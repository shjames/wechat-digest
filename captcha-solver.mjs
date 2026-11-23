#!/usr/bin/env node
/**
 * captcha-solver.mjs — 微信读书验证码「视觉识别 + 浏览器自动点击」工具
 *
 * 设计思路：
 *   验证码是「按描述点选图片」型（如"红色沙发" → 点九宫格里的红沙发 → 确定），
 *   纯脚本无法可靠理解图片语义。因此本脚本只负责「浏览器侧原子操作」：
 *     prepare / shot  → 触发验证码并截图，交给 WorkBuddy 的视觉能力识别目标坐标
 *     click / click-seq → 用 CDP 真实鼠标事件按坐标点击（可穿透跨域 iframe）
 *     verify          → 调 weread API 确认 -2041 是否解除
 *     close           → 清理 tab 与状态文件
 *   用户只需一句指令，WorkBuddy 自动串起以上步骤，全程无需人工点击。
 *
 * 用法：
 *   node captcha-solver.mjs prepare [readerUrl]   # 触发验证码 + 截图，输出坐标换算信息
 *   node captcha-solver.mjs shot                  # 换一组/刷新后重新截图
 *   node captcha-solver.mjs click <x> <y>         # 点击视口 CSS 坐标
 *   node captcha-solver.mjs click-seq "x,y x,y"   # 顺序点击多个点（选图 + 确定）
 *   node captcha-solver.mjs verify                # 验证是否通过
 *   node captcha-solver.mjs close                 # 关闭 tab 并清理状态
 *
 * 坐标说明：
 *   click 使用浏览器视口 CSS 像素坐标。prepare/shot 会输出 scale = 截图宽度 / viewport 宽度。
 *   若从截图上读到像素坐标 (px, py)，点击坐标应为 (px / scale, py / scale)。
 *   scale 通常为 1；高分屏可能为 1.25 / 1.5 / 2。
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const TMP = resolve(ROOT, "tmp");
const STATE_FILE = resolve(TMP, "captcha-session.json");
const SHOT_FILE = resolve(TMP, "captcha-current.png");

const PROXY = process.env.CDP_PROXY || "http://localhost:3488";
const PROXY_SCRIPT = "C:/Users/suzhiquan/.claude/skills/web-access/scripts/cdp-proxy.mjs";
const DEFAULT_URL = "https://weread.qq.com/web/shelf";

const log = (...a) => console.error("[captcha]", ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = (obj) => console.log(JSON.stringify(obj, null, 2));

// ── 基础设施 ─────────────────────────────────────────────────────────────────

async function ensureProxy() {
  try {
    const r = await fetch(`${PROXY}/health`);
    if (r.ok) return;
  } catch { /* 未运行 */ }
  log("启动 CDP proxy...");
  const child = spawn("node", [PROXY_SCRIPT], { detached: true, stdio: "ignore" });
  child.unref();
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(`${PROXY}/health`);
      if (r.ok) return;
    } catch { /* retry */ }
    await sleep(500);
  }
  throw new Error("CDP proxy 启动超时");
}

async function cdp(path, opts) {
  const r = await fetch(`${PROXY}${path}`, opts);
  if (!r.ok) throw new Error(`CDP ${path} failed: ${r.status}`);
  return r.json();
}

async function cdpEval(targetId, script) {
  const body = typeof script === "string" ? script : `(${script})()`;
  const r = await fetch(`${PROXY}/eval?target=${targetId}`, { method: "POST", body });
  const data = await r.json();
  if (data.error) throw new Error(data.error);
  return data.value;
}

function parseResult(val) {
  if (typeof val === "string") return JSON.parse(val);
  return val;
}

function loadState() {
  try { return JSON.parse(readFileSync(STATE_FILE, "utf-8")); }
  catch { return null; }
}

function saveState(state) {
  mkdirSync(TMP, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

function clearState() {
  try { unlinkSync(STATE_FILE); } catch { /* ignore */ }
}

// 读 PNG 的 IHDR 拿截图像素尺寸（无需第三方依赖）
function pngSize(file) {
  const buf = readFileSync(file);
  if (buf.length < 24 || buf.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// ── 验证码检测 ───────────────────────────────────────────────────────────────

const DETECT_JS = `(() => {
  const selectors = [
    'iframe[id*="tcaptcha"]',
    'iframe[src*="captcha.gtimg.com"]',
    'iframe[src*="captcha"]',
    '.tcap-widget', '#TCaptcha', '#TDCaptcha',
    '[class*="captcha-dialog"]', '[class*="verify_dialog"]'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.offsetParent !== null) {
      const r = el.getBoundingClientRect();
      return JSON.stringify({
        found: true, selector: sel,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
      });
    }
  }
  const text = document.body.innerText || '';
  const kws = ['选择最符合描述的图片','请完成安全验证','点击图片完成验证','安全验证','拖动滑块'];
  const hit = kws.find(k => text.includes(k));
  return JSON.stringify({ found: !!hit, keyword: hit || null, rect: null });
})()`;

async function detectCaptcha(targetId) {
  try {
    return parseResult(await cdpEval(targetId, DETECT_JS));
  } catch {
    return { found: false, error: "detect failed" };
  }
}

async function viewportInfo(targetId) {
  try {
    return parseResult(await cdpEval(targetId,
      `(() => JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio}))()`));
  } catch {
    return { w: 0, h: 0, dpr: 1 };
  }
}

async function takeShot(targetId) {
  mkdirSync(TMP, { recursive: true });
  await cdp(`/screenshot?target=${targetId}&file=${encodeURIComponent(SHOT_FILE)}`);
  const px = pngSize(SHOT_FILE);
  const vp = await viewportInfo(targetId);
  const scale = px && vp.w ? +(px.width / vp.w).toFixed(4) : 1;
  return {
    screenshot: SHOT_FILE,
    screenshotPx: px,
    viewportCss: vp,
    scale,
    coordRule: "点击坐标 = 截图像素坐标 / scale（click 命令使用视口 CSS 坐标）",
  };
}

// ── 子命令 ───────────────────────────────────────────────────────────────────

async function cmdPrepare(urlArg) {
  await ensureProxy();
  let targetId = loadState()?.targetId || null;
  let reused = false;
  if (targetId) {
    try { await cdp(`/info?target=${targetId}`); reused = true; }
    catch { targetId = null; clearState(); }
  }
  if (!targetId) {
    const r = await cdp(`/new?url=${encodeURIComponent(DEFAULT_URL)}`);
    targetId = r.targetId;
    await sleep(1800);
  }

  let url = urlArg || DEFAULT_URL;
  await cdp(`/navigate?target=${targetId}&url=${encodeURIComponent(url)}`);
  await cdp(`/activate?target=${targetId}`);
  await sleep(2500);

  // 若没有明确的文章 URL，从书架提取一个 MP reader 链接（文章页更容易触发验证码）
  if (!urlArg) {
    try {
      const found = parseResult(await cdpEval(targetId, `(() => {
        const a = document.querySelector("a[href*='/web/mp/reader/']");
        return JSON.stringify({ url: a ? a.href : "" });
      })()`));
      if (found.url) {
        url = found.url;
        await cdp(`/navigate?target=${targetId}&url=${encodeURIComponent(url)}`);
        await sleep(3000);
      }
    } catch { /* 保留 shelf 页面继续 */ }
  }

  // 轮询等待验证码出现（最多 ~12 秒）
  let detected = await detectCaptcha(targetId);
  for (let i = 0; i < 8 && !detected.found; i++) {
    await sleep(1200);
    detected = await detectCaptcha(targetId);
  }

  const shot = await takeShot(targetId);
  saveState({ targetId, url, createdAt: Date.now() });

  out({
    status: detected.found ? "CAPTCHA_VISIBLE" : "NO_CAPTCHA",
    targetId,
    reusedTab: reused,
    ...shot,
    captcha: detected,
    next: detected.found
      ? "WorkBuddy: 查看 screenshot，识别描述文字与九宫格目标，换算坐标后执行 click-seq，再 verify"
      : "无需处理验证码，可直接继续抓取",
  });
}

async function cmdShot() {
  await ensureProxy();
  const state = loadState();
  if (!state?.targetId) throw new Error("无活跃验证码会话，请先运行 prepare");
  await cdp(`/activate?target=${state.targetId}`);
  await sleep(500);
  const shot = await takeShot(state.targetId);
  const detected = await detectCaptcha(state.targetId);
  out({ status: detected.found ? "CAPTCHA_VISIBLE" : "NO_CAPTCHA", targetId: state.targetId, ...shot, captcha: detected });
}

async function cmdClick(x, y) {
  await ensureProxy();
  const state = loadState();
  if (!state?.targetId) throw new Error("无活跃验证码会话，请先运行 prepare");
  const nx = Number(x), ny = Number(y);
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) throw new Error("坐标必须是数字");
  await cdp(`/clickXY?target=${state.targetId}&x=${nx}&y=${ny}`);
  await sleep(500);
  out({ clicked: true, x: nx, y: ny, targetId: state.targetId });
}

async function cmdClickSeq(points) {
  await ensureProxy();
  const state = loadState();
  if (!state?.targetId) throw new Error("无活跃验证码会话，请先运行 prepare");
  const list = String(points || "").trim().split(/\s+/).map((p) => {
    const [x, y] = p.split(",").map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error(`坐标格式错误: ${p}`);
    return { x, y };
  });
  if (!list.length) throw new Error("未提供坐标");
  for (const p of list) {
    await cdp(`/clickXY?target=${state.targetId}&x=${p.x}&y=${p.y}`);
    await sleep(600);
  }
  out({ clicked: true, points: list, count: list.length, targetId: state.targetId });
}

async function cmdVerify() {
  await ensureProxy();
  const state = loadState();
  if (!state?.targetId) throw new Error("无活跃验证码会话，请先运行 prepare");
  const tid = state.targetId;

  const captcha = await detectCaptcha(tid);
  const api = parseResult(await cdpEval(tid, `(async () => {
    try {
      const r = await fetch("https://weread.qq.com/web/shelf/sync?synckey=0&lectureSynckey=0");
      const d = await r.json();
      const mp = (d.books || []).filter(b => b.bookId && b.bookId.startsWith("MP_WXS_"));
      if (!mp.length) return JSON.stringify({ ok: false, err: d.errCode || "NO_BOOKS" });
      const r2 = await fetch("https://weread.qq.com/web/mp/articles?bookId=" + mp[0].bookId + "&offset=0");
      const d2 = await r2.json();
      return JSON.stringify({ ok: !d2.errCode, errCode: d2.errCode || 0, sample: mp[0].bookId });
    } catch (e) { return JSON.stringify({ ok: false, err: e.message }); }
  })()`));

  const passed = api.ok === true;
  out({
    status: passed ? "PASSED" : "FAILED",
    passed,
    api,
    captchaStillVisible: captcha.found,
    hint: passed
      ? "验证码已通过，可运行 close 清理，然后继续生成日报"
      : "API 仍返回 -2041，请 shot 重新截图后再次识别点击（可能图已刷新）",
  });
  if (!passed) process.exitCode = 1;
}

async function cmdClose() {
  const state = loadState();
  if (state?.targetId) {
    try { await cdp(`/close?target=${state.targetId}`); }
    catch { /* 可能已关闭 */ }
  }
  clearState();
  try { unlinkSync(SHOT_FILE); } catch { /* ignore */ }
  out({ closed: true });
}

// ── 入口 ─────────────────────────────────────────────────────────────────────

const [cmd, ...args] = process.argv.slice(2);
const commands = {
  prepare: () => cmdPrepare(args[0]),
  shot: cmdShot,
  click: () => cmdClick(args[0], args[1]),
  "click-seq": () => cmdClickSeq(args[0]),
  verify: cmdVerify,
  close: cmdClose,
  help: () => {
    console.log(`captcha-solver.mjs — 微信读书验证码自动处理

子命令:
  prepare [readerUrl]     触发验证码并截图，输出坐标换算信息
  shot                    刷新/换一组后重新截图
  click <x> <y>           点击视口 CSS 坐标（可穿透 iframe）
  click-seq "x,y x,y"     顺序点击多个点（选图 → 确定）
  verify                  验证 API 是否解除 -2041
  close                   关闭 tab 并清理状态

坐标规则: 点击坐标 = 截图像素坐标 / scale`);
  },
};

if (!cmd || !commands[cmd]) {
  console.error(`未知命令: ${cmd || "(空)"}，可用: ${Object.keys(commands).join(", ")}`);
  process.exit(1);
}

Promise.resolve(commands[cmd]()).catch((e) => {
  console.error(`[captcha] 错误: ${e.message}`);
  process.exit(1);
});
