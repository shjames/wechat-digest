#!/usr/bin/env node
/**
 * fetch.mjs — 微信公众号文章数据抓取脚本
 *
 * 通过 CDP proxy（localhost:3488）在用户 Chrome 中执行 weread API 调用，
 * 复用登录态 Cookie，批量获取指定日期的文章数据。
 *
 * 用法：
 *   node fetch.mjs                          # 默认：昨天（北京时间）
 *   node fetch.mjs --date 2026-04-27        # 指定日期
 *   node fetch.mjs --date 2026-04-27 --output result.json  # 输出到文件
 *   node fetch.mjs --accounts /path/to/accounts.txt         # 指定账号文件
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ─── 参数解析 ───────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

function yesterdayBJ() {
  const now = new Date();
  const bj = new Date(now.getTime() + 8 * 3600_000);
  const y = new Date(bj.getTime() - 86400_000);
  return y.toISOString().slice(0, 10);
}

const TARGET_DATE = getArg("date", yesterdayBJ());
const OUTPUT_FILE = getArg("output", "");
const ACCOUNTS_FILE = getArg("accounts", resolve(process.cwd(), "accounts.txt"));
const PROXY = getArg("proxy", "http://localhost:3488");
const BATCH_SIZE = 5;
const FETCH_DELAY_MS = 800; // 每个账号间隔，避免限流

// ─── 日志 ──────────────────────────────────────────────────

const log = (...a) => console.error(`[fetch]`, ...a);

// ─── CDP 工具 ──────────────────────────────────────────────

async function cdp(path, opts) {
  const r = await fetch(`${PROXY}${path}`, opts);
  if (!r.ok) throw new Error(`CDP ${path} failed: ${r.status}`);
  return r.json();
}

async function cdpEval(targetId, script) {
  const body = typeof script === "string" ? script : `(${script})()`;
  const r = await fetch(`${PROXY}/eval?target=${targetId}`, {
    method: "POST",
    body,
  });
  const data = await r.json();
  if (data.error) throw new Error(`CDP eval error: ${data.error}`);
  // value 可能是字符串或已解析的对象
  return data.value;
}

// 统一解析 cdpEval 返回值（可能是 JSON 字符串或对象）
function parseResult(val) {
  if (typeof val === "string") return JSON.parse(val);
  return val;
}

// ─── accounts.txt 解析 ─────────────────────────────────────

function parseAccounts(path) {
  const raw = readFileSync(path, "utf-8");
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.replace(/^["']|["']$/g, "").trim()) // 去引号
    .filter(Boolean);
}

// ─── 核心流程 ──────────────────────────────────────────────

async function main() {
  log(`目标日期: ${TARGET_DATE}`);
  log(`账号文件: ${ACCOUNTS_FILE}`);

  // 1. 创建临时 tab
  log("创建 weread tab...");
  const { targetId } = await cdp(`/new?url=${encodeURIComponent("https://weread.qq.com/web/shelf")}`);
  log(`tab: ${targetId}`);

  try {
    // 2. 等待页面就绪 + 检查登录
    log("等待页面就绪...");
    const loginResult = await cdpEval(targetId, `
      (async () => {
        // 等待页面 DOM 有内容（最多 10 秒）
        for (let i = 0; i < 20; i++) {
          if (document.querySelector("a[href*='/web/mp/reader/']") || document.body.innerText.length > 200) break;
          await new Promise(r => setTimeout(r, 500));
        }
        const r = await fetch("https://weread.qq.com/web/shelf/sync?synckey=0&lectureSynckey=0");
        const d = await r.json();
        if (!d.books) return JSON.stringify({ok:false, err: d.errCode || "NOT_LOGGED_IN"});
        const mp = d.books
          .filter(b => b.bookId && b.bookId.startsWith("MP_WXS_"))
          .map(b => ({ bookId: b.bookId, name: b.title || (b.book && b.book.title) || b.bookId }));
        window._mpAccounts = mp;
        return JSON.stringify({ok:true, count: mp.length});
      })()
    `);

    const login = parseResult(loginResult);
    if (!login.ok) {
      console.log(JSON.stringify({ error: "NOT_LOGGED_IN", detail: login.err }));
      process.exit(1);
    }
    log(`已登录，${login.count} 个订阅号`);

    // 3. 名称匹配
    const wanted = parseAccounts(ACCOUNTS_FILE);
    log(`待匹配 ${wanted.length} 个账号...`);

    const matchResult = await cdpEval(targetId, `
      (async () => {
        const wanted = ${JSON.stringify(wanted)};
        const mp = window._mpAccounts;
        const matched = {};
        const unmatched = [];
        for (const name of wanted) {
          const found = mp.find(a => a.name === name);
          if (found) matched[name] = found.bookId;
          else unmatched.push(name);
        }
        return JSON.stringify({ matched, unmatched });
      })()
    `);

    const { matched, unmatched } = parseResult(matchResult);
    const matchCount = Object.keys(matched).length;
    log(`匹配成功 ${matchCount}，未匹配 ${unmatched.length}: ${unmatched.join(", ") || "无"}`);

    // 4. 批量抓取文章
    const entries = Object.entries(matched); // [[name, bookId], ...]
    const results = {};
    const errors = {};

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(entries.length / BATCH_SIZE);
      log(`批次 ${batchNum}/${totalBatches}: ${batch.map(([n]) => n).join(", ")}`);

      const batchResult = await cdpEval(targetId, `
        (async () => {
          const pairs = ${JSON.stringify(batch)};
          const targetDate = "${TARGET_DATE}";
          const delay = ms => new Promise(r => setTimeout(r, ms));
          const out = {};

          for (const [name, bookId] of pairs) {
            try {
              const r = await fetch("https://weread.qq.com/web/mp/articles?bookId=" + bookId + "&offset=0");
              const d = await r.json();

              if (d.errCode) {
                out[name] = { bookId, error: d.errCode };
                continue;
              }

              const arts = [];
              let stop = false;
              for (const rv of (d.reviews || [])) {
                for (const sub of (rv.subReviews || [])) {
                  const info = sub.review && sub.review.mpInfo;
                  if (!info) continue;
                  const ts = info.time || sub.review.createTime;
                  const bj = new Date((ts + 8 * 3600) * 1000);
                  const dateStr = bj.toISOString().slice(0, 10);
                  if (dateStr === targetDate) {
                    const hh = String(bj.getUTCHours()).padStart(2, "0");
                    const mm = String(bj.getUTCMinutes()).padStart(2, "0");
                    arts.push({
                      title: info.title,
                      content: (info.content || "").slice(0, 600),
                      time: ts,
                      timeStr: hh + ":" + mm,
                      readNum: info.readNum || 0,
                    });
                  } else if (dateStr < targetDate) {
                    stop = true;
                    break;
                  }
                }
                if (stop) break;
              }

              out[name] = { bookId, articles: arts };
              await delay(${FETCH_DELAY_MS});
            } catch (e) {
              out[name] = { bookId, error: e.message };
            }
          }

          return JSON.stringify(out);
        })()
      `);

      const batchData = parseResult(batchResult);
      for (const [name, data] of Object.entries(batchData)) {
        if (data.error) {
          errors[name] = data.error;
          log(`  ⚠️ ${name}: ${data.error}`);
        } else {
          results[name] = data;
          log(`  ✅ ${name}: ${data.articles.length} 篇`);
        }
      }
    }

    // 5. 组装输出
    const output = {
      date: TARGET_DATE,
      accounts: results,
      unmatched,
      errors,
      summary: {
        total_accounts: matchCount,
        accounts_with_articles: Object.values(results).filter((a) => a.articles.length > 0).length,
        total_articles: Object.values(results).reduce((s, a) => s + a.articles.length, 0),
      },
    };

    const json = JSON.stringify(output, null, 2);

    if (OUTPUT_FILE) {
      const { writeFileSync } = await import("node:fs");
      writeFileSync(OUTPUT_FILE, json, "utf-8");
      log(`结果已写入: ${OUTPUT_FILE}`);
    }

    console.log(json);
    log("完成");
  } finally {
    // 关闭临时 tab
    await cdp(`/close?target=${targetId}`).catch(() => {});
    log("tab 已关闭");
  }
}

main().catch((e) => {
  console.error(`[fetch] 致命错误:`, e.message);
  process.exit(1);
});
