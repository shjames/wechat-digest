#!/usr/bin/env node
/**
 * run-digest.mjs — 公众号日报「一句话全自动」编排器
 *
 * 用法（在 WorkBuddy 中一句话触发，由 WorkBuddy 代为执行）：
 *   node run-digest.mjs 2026-11-19 2026-11-20 2026-11-21 --full
 *   node run-digest.mjs 2026-11-22                 # 单日，摘要模式
 *   node run-digest.mjs --resume                   # 验证码被 WorkBuddy 视觉处理后继续
 *   node run-digest.mjs --status                   # 查看当前任务状态
 *   node run-digest.mjs --reset                    # 清空未完成任务
 *
 * 选项：
 *   --full          全文模式（gen-digest 提取全文再摘要）
 *   --no-push       只生成本地文件，不 git commit/push
 *   --no-captcha    跳过验证码处理（账号被 -2041 限流时直接报错）
 *
 * 设计：脚本把整个任务拆成可恢复的状态机，状态写入 tmp/digest-job.json。
 *   遇到腾讯「点选图片」验证码时，脚本无法自己理解图片语义，会以退出码 10
 *   暂停并输出 @@NEEDS_CAPTCHA_VISION@@ 信号 + 截图路径 + scale。
 *   WorkBuddy 读取截图、识别目标、调用 captcha-solver.mjs 点击，再以 --resume 继续。
 *   对用户而言全程一句话触发，中间的看图点击由 WorkBuddy 自动完成。
 *
 * 退出码：0=全部完成  10=需要 WorkBuddy 处理验证码  1=错误
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const TMP = resolve(ROOT, "tmp");
const JOB_FILE = resolve(TMP, "digest-job.json");

const args = process.argv.slice(2);
const log = (...a) => console.error("[run]", ...a);
const out = (obj) => console.log(JSON.stringify(obj, null, 2));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadJob() {
  try { return JSON.parse(readFileSync(JOB_FILE, "utf-8")); }
  catch { return null; }
}
function saveJob(job) {
  mkdirSync(TMP, { recursive: true });
  writeFileSync(JOB_FILE, JSON.stringify(job, null, 2), "utf-8");
}
function clearJob() { try { unlinkSync(JOB_FILE); } catch { /* ignore */ } }

// 从 ~/.claude/settings.json 的 env 字段加载 API 配置（gen-digest 需要）
function claudeEnv() {
  const p = resolve(homedir(), ".claude/settings.json");
  try {
    const j = JSON.parse(readFileSync(p, "utf-8"));
    return j.env && typeof j.env === "object" ? j.env : {};
  } catch { return {}; }
}

function runNode(script, scriptArgs, opts = {}) {
  const r = spawnSync("node", [resolve(ROOT, script), ...scriptArgs], {
    cwd: ROOT,
    encoding: "utf-8",
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, ...claudeEnv() },
    ...opts,
  });
  return {
    code: r.status ?? 1,
    stdout: r.stdout || "",
    stderr: r.stderr || "",
    error: r.error ? r.error.message : null,
  };
}

function runGit(gitArgs) {
  // 遵循 CLAUDE.md：Windows 上用 git -C <绝对路径>
  const r = spawnSync("git", ["-C", ROOT, ...gitArgs], {
    cwd: ROOT, encoding: "utf-8", maxBuffer: 8 * 1024 * 1024,
  });
  return { code: r.status ?? 1, stdout: r.stdout || "", stderr: r.stderr || "" };
}

const mmdd = (d) => d.slice(5).replace("-", "");

function hasCaptcha(fetchJson) {
  const errs = fetchJson?.errors || {};
  for (const [k, v] of Object.entries(errs)) {
    if (k === "__captcha__") continue;
    if (v === -2041 || v === "-2041") return true;
  }
  return false;
}

// 生成「需要视觉识别」信号并暂停
function pauseForVision(job) {
  saveJob(job);
  out({
    status: "NEEDS_CAPTCHA_VISION",
    marker: "@@NEEDS_CAPTCHA_VISION@@",
    message: "检测到微信读书验证码，请 WorkBuddy 查看截图、识别目标图片、点击并用 --resume 继续",
    screenshot: job.captcha.screenshot,
    screenshotPx: job.captcha.screenshotPx,
    viewportCss: job.captcha.viewportCss,
    scale: job.captcha.scale,
    coordRule: "点击坐标 = 截图像素坐标 / scale（captcha-solver click 使用视口 CSS 坐标）",
    readerUrl: job.captcha.readerUrl,
    mode: job.mode,
    resumeCmd: `node run-digest.mjs --resume`,
  });
  process.exit(10);
}

async function main() {
  const job = loadJob();

  // --status
  if (args.includes("--status")) {
    if (!job) out({ status: "NO_JOB" });
    else out({ status: "JOB", ...job });
    return;
  }
  // --reset
  if (args.includes("--reset")) {
    clearJob();
    out({ status: "RESET_OK" });
    return;
  }

  // --resume：从已有 job 继续
  const resume = args.includes("--resume");
  let state;
  if (resume) {
    if (!job) { log("没有可恢复的任务"); process.exit(1); }
    state = job;
  } else {
    const dates = args.filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
    if (!dates.length) {
      console.error("用法: node run-digest.mjs <YYYY-MM-DD> [...] [--full] [--no-push] [--no-captcha]");
      process.exit(1);
    }
    state = {
      dates,
      mode: args.includes("--full") ? "full" : "brief",
      noPush: args.includes("--no-push"),
      noCaptcha: args.includes("--no-captcha"),
      index: 0,
      phase: "fetch",
      results: {},
      captcha: null,
      createdAt: Date.now(),
    };
    saveJob(state);
  }

  while (true) {
    const phase = state.phase;

    // ── 阶段1：抓取 ──────────────────────────────────────────────
    if (phase === "fetch") {
      const date = state.dates[state.index];
      log(`抓取 ${date} ...`);
      const fetchArgs = [
        "--date", date,
        "--output", `tmp/fetch-result-${mmdd(date)}.json`,
        "--no-captcha", // 验证码统一由本编排器处理
      ];
      // CDP 新建 tab 偶发「页面就绪检查返回空」的时序问题，自动重试最多 3 次
      let r;
      for (let attempt = 1; attempt <= 3; attempt++) {
        r = runNode("fetch.mjs", fetchArgs);
        if (r.code === 0 && r.stdout.trim()) break;
        log(`fetch 第 ${attempt}/3 次未成功（偶发 CDP 时序问题），重试...`);
        if (attempt < 3) await new Promise((res) => setTimeout(res, 2000));
      }
      if (r.code !== 0 || !r.stdout.trim()) {
        log(`fetch 失败:\n${r.stdout}\n${r.stderr}`);
        out({ status: "ERROR", phase: "fetch", date, stdout: r.stdout, stderr: r.stderr });
        process.exit(1);
      }
      let fetchJson;
      try { fetchJson = JSON.parse(r.stdout); }
      catch {
        out({ status: "ERROR", phase: "fetch", date, message: "fetch 输出非 JSON", stdout: r.stdout });
        process.exit(1);
      }

      if (hasCaptcha(fetchJson) && !state.noCaptcha) {
        const readerUrl = Object.values(fetchJson.readerUrls || {})[0] || null;
        log("检测到 -2041 验证码，准备截图...");
        const p = runNode("captcha-solver.mjs", ["prepare", readerUrl || ""]);
        let info = {};
        try { info = JSON.parse(p.stdout); } catch { /* ignore */ }
        if (p.code !== 0 || !info.screenshot) {
          out({ status: "ERROR", phase: "captcha-prepare", stdout: p.stdout, stderr: p.stderr });
          process.exit(1);
        }
        state.phase = "captcha";
        state.captcha = {
          screenshot: info.screenshot,
          screenshotPx: info.screenshotPx,
          viewportCss: info.viewportCss,
          scale: info.scale,
          readerUrl,
          targetId: info.targetId,
        };
        pauseForVision(state);
      }

      if (hasCaptcha(fetchJson) && state.noCaptcha) {
        out({ status: "ERROR", phase: "fetch", date, message: "账号触发 -2041（--no-captcha 已跳过处理）", errors: fetchJson.errors });
        process.exit(1);
      }

      state.results[date] = {
        accounts: fetchJson.summary?.total_accounts ?? 0,
        articles: fetchJson.summary?.total_articles ?? 0,
        unmatched: fetchJson.unmatched || [],
      };
      log(`  ${date}: ${state.results[date].articles} 篇文章`);
      state.phase = "digest";
      saveJob(state);
      continue;
    }

    // ── 阶段2：等待验证码视觉处理（resume 入口）────────────────
    if (phase === "captcha") {
      log("验证验证码是否已通过...");
      const v = runNode("captcha-solver.mjs", ["verify"]);
      let vinfo = {};
      try { vinfo = JSON.parse(v.stdout); } catch { /* ignore */ }
      if (!vinfo.passed) {
        log("验证码尚未通过，重新截图...");
        const p = runNode("captcha-solver.mjs", ["shot"]);
        let info = {};
        try { info = JSON.parse(p.stdout); } catch { /* ignore */ }
        state.captcha = {
          ...(state.captcha || {}),
          screenshot: info.screenshot || state.captcha?.screenshot,
          screenshotPx: info.screenshotPx || state.captcha?.screenshotPx,
          viewportCss: info.viewportCss || state.captcha?.viewportCss,
          scale: info.scale ?? state.captcha?.scale,
        };
        pauseForVision(state);
      }
      log("验证码已通过，关闭临时 tab 并重新抓取");
      runNode("captcha-solver.mjs", ["close"]);
      state.captcha = null;
      state.phase = "fetch"; // 重新抓取当前日期
      saveJob(state);
      continue;
    }

    // ── 阶段3：生成日报 ──────────────────────────────────────────
    if (phase === "digest") {
      const date = state.dates[state.index];
      log(`生成日报 ${date} (${state.mode}模式) ...`);
      const r = runNode("gen-digest.mjs", [date]);
      if (r.code !== 0) {
        log(`gen-digest 失败:\n${r.stdout}\n${r.stderr}`);
        out({ status: "ERROR", phase: "digest", date, stdout: r.stdout, stderr: r.stderr });
        process.exit(1);
      }
      log(r.stdout.trim().split("\n").slice(-1)[0]);
      state.index += 1;
      state.phase = state.index < state.dates.length ? "fetch" : "build";
      saveJob(state);
      continue;
    }

    // ── 阶段4：构建站点 ──────────────────────────────────────────
    if (phase === "build") {
      log("构建静态站点...");
      const r = runNode("build-site.mjs", []);
      if (r.code !== 0) {
        log(`build 失败:\n${r.stdout}\n${r.stderr}`);
        out({ status: "ERROR", phase: "build", stdout: r.stdout, stderr: r.stderr });
        process.exit(1);
      }
      log(r.stdout.trim().split("\n").slice(-1)[0]);
      state.phase = state.noPush ? "done" : "push";
      saveJob(state);
      continue;
    }

    // ── 阶段5：提交推送 ──────────────────────────────────────────
    if (phase === "push") {
      log("提交并推送...");
      // site/ 被 .gitignore 忽略，只提交 output 下的日报 md
      const add = runGit(["add", "output"]);
      if (add.code !== 0) { out({ status: "ERROR", phase: "push", stderr: add.stderr }); process.exit(1); }
      const label = state.dates.length === 1 ? state.dates[0] : `${state.dates[0]}..${state.dates[state.dates.length - 1]}`;
      const commit = runGit(["commit", "-m", `add ${label} digest`]);
      if (commit.code !== 0 && !/nothing to commit/i.test(commit.stdout + commit.stderr)) {
        out({ status: "ERROR", phase: "commit", stderr: commit.stderr }); process.exit(1);
      }
      const push = runGit(["push", "origin", "main"]);
      if (push.code !== 0) { out({ status: "ERROR", phase: "push", stderr: push.stderr }); process.exit(1); }
      log("push 完成");
      state.phase = "done";
      saveJob(state);
      continue;
    }

    // ── 完成 ─────────────────────────────────────────────────────
    if (phase === "done") {
      out({
        status: "DONE",
        dates: state.dates,
        mode: state.mode,
        results: state.results,
        files: state.dates.map((d) => `output/wechat-digest-${d}.md`),
        pushed: !state.noPush,
      });
      clearJob();
      return;
    }

    out({ status: "ERROR", message: `未知阶段: ${phase}` });
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`[run] 致命错误: ${e.message}`);
  process.exit(1);
});
