/**
 * 通用日报生成脚本：提取全文 + 调用 Claude API 生成摘要 + 输出 Markdown
 * 用法: node gen-digest.mjs <YYYY-MM-DD>
 */

import http from 'http';
import https from 'https';
import fs from 'fs';

const DATE = process.argv[2];
if (!DATE) { console.error('Usage: node gen-digest.mjs YYYY-MM-DD'); process.exit(1); }

const MMDD = DATE.slice(5).replace('-', '');
const FETCH_FILE = `tmp/fetch-result-${MMDD}.json`;
const CONTENT_FILE = `tmp/content-${MMDD}.json`;
const OUTPUT_FILE = `output/wechat-digest-${DATE}.md`;

const API_KEY = process.env.ANTHROPIC_AUTH_TOKEN;
const BASE_URL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
const MODEL = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL || 'claude-haiku-4-5-20251001';

// ── CDP helpers ──────────────────────────────────────────────────────────────

function cdpGet(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3488' + path, (res) => {
      let s = ''; res.on('data', (c) => (s += c)); res.on('end', () => resolve(s));
    }).on('error', reject);
  });
}

function cdpPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(body);
    const req = http.request({
      hostname: 'localhost', port: 3488, path, method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'Content-Length': data.length },
    }, (res) => {
      let s = ''; res.on('data', (c) => (s += c)); res.on('end', () => resolve(s));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

async function getFullText(tid, rid) {
  const js = `fetch('https://weread.qq.com/web/mp/content?reviewId='+encodeURIComponent('${rid}')).then(function(r){return r.text()}).then(function(html){var lm=html.match(/link:\\s*['"](https?:\\/\\/mp\\.weixin[^'"]*)/);var mpUrl=lm?lm[1].replace(/\\x26amp;/g,'&').replace(/&amp;/g,'&').replace(/\\u0026/g,'&'):'';var doc=new DOMParser().parseFromString(html,'text/html');var t=doc.querySelector('#js_content,.rich_media_content');var text=t?t.innerText:doc.body.innerText;text=(text||'').replace(/\\s+/g,' ').trim().slice(0,3000);return JSON.stringify({mpUrl:mpUrl,text:text})})`;
  const res = await cdpPost('/eval?target=' + tid, js);
  try {
    const outer = JSON.parse(res);
    const inner = JSON.parse(outer.value || '{}');
    return { reviewId: rid, mpUrl: inner.mpUrl || '', text: inner.text || '' };
  } catch (e) {
    return { reviewId: rid, mpUrl: '', text: '', error: e.message };
  }
}

// ── Claude API helper ─────────────────────────────────────────────────────────

function callClaude(userPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system: '你是一位公众号内容编辑，擅长写简洁客观的文章摘要。用100-150字中文，一段话，包含核心观点+主要论据+结论，客观简练第三人称，不重复标题，不用项目符号，不用"本文讲述了"等套话。',
      messages: [{ role: 'user', content: userPrompt }],
    });
    const url = new URL('/v1/messages', BASE_URL);
    const opts = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (res) => {
      let d = ''; res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d).content?.[0]?.text || ''); }
        catch (e) { reject(new Error(d.slice(0, 200))); }
      });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function fixUrl(raw) {
  return (raw || '').replace(/\\x26amp;/g, '&').replace(/&amp;/g, '&').replace(/\\u0026/g, '&');
}

const SKIP_REVIEW_IDS = [
  'MP_WXS_3236757533_dIEKuk5WYtAnr70oynlzqw', // 量子位招聘
  'MP_WXS_2396392481_SadQ9urgVZ1U-~rGumWg4w',  // 刘润日历卡片
];
const SKIP_TITLE_KEYWORDS = ['不敢爱、怕表达、总讨好', '关系阴影指数', '招聘'];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(FETCH_FILE)) {
    console.error(`找不到 ${FETCH_FILE}，请先运行 fetch.mjs`); process.exit(1);
  }
  const fetchData = JSON.parse(fs.readFileSync(FETCH_FILE, 'utf8'));

  // ── Phase 1: 全文提取（如果 content 文件不存在）──────────────────────────
  let articles;
  if (fs.existsSync(CONTENT_FILE)) {
    console.log(`已有 ${CONTENT_FILE}，跳过全文提取`);
    articles = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
  } else {
    console.log('Phase 1: 提取全文...');
    const allArts = [];
    for (const [account, info] of Object.entries(fetchData.accounts)) {
      for (const art of info.articles) allArts.push({ account, ...art });
    }
    const toExtract = allArts.filter((a) => !SKIP_REVIEW_IDS.includes(a.reviewId));

    const newRes = JSON.parse(await cdpGet('/new?url=https://weread.qq.com'));
    const tid = newRes.targetId;
    console.log('CDP tab:', tid);
    await sleep(4000);

    const results = [];
    for (let i = 0; i < toExtract.length; i += 8) {
      const batch = toExtract.slice(i, i + 8);
      console.log(`  批次 ${Math.floor(i / 8) + 1}/${Math.ceil(toExtract.length / 8)}`);
      for (const art of batch) {
        const r = await getFullText(tid, art.reviewId);
        results.push({ ...art, extractedMpUrl: r.mpUrl, fullText: r.text });
        process.stdout.write('.');
        await sleep(300);
      }
      await sleep(500);
    }
    console.log('');
    await cdpGet('/close?target=' + tid);
    fs.mkdirSync('tmp', { recursive: true });
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(results, null, 2));
    console.log(`  已写入 ${CONTENT_FILE}`);
    articles = results;
  }

  // ── Phase 2: 生成摘要 ────────────────────────────────────────────────────
  console.log(`Phase 2: 生成摘要，模型: ${MODEL}`);
  const toProcess = articles.filter(
    (a) => !SKIP_REVIEW_IDS.includes(a.reviewId) &&
           !SKIP_TITLE_KEYWORDS.some((kw) => a.title.includes(kw))
  );

  const summaries = {};
  for (let i = 0; i < toProcess.length; i++) {
    const art = toProcess[i];
    const isJsPage = art.fullText?.startsWith('window.page_begintime');
    const text = isJsPage
      ? (art.content || art.title || '')
      : (art.fullText || art.content || art.title || '');

    if (!text || text.length < 20) {
      summaries[art.reviewId] = '（暂无正文内容）';
      console.log(`  [${i + 1}/${toProcess.length}] SKIP ${art.title.slice(0, 30)}`);
      continue;
    }

    process.stdout.write(`  [${i + 1}/${toProcess.length}] ${art.account.slice(0, 8)} | ${art.title.slice(0, 22)}... `);
    try {
      const summary = await callClaude(`文章标题：${art.title}\n\n正文节选：\n${text.slice(0, 2000)}`);
      summaries[art.reviewId] = summary.trim();
      console.log(`✓ (${summary.trim().length}字)`);
    } catch (e) {
      summaries[art.reviewId] = '（摘要生成失败）';
      console.log(`✗ ${e.message.slice(0, 40)}`);
    }
    await sleep(200);
  }

  // ── Phase 3: 组装 Markdown ──────────────────────────────────────────────
  console.log('Phase 3: 组装 Markdown...');

  const accountOrder = Object.keys(fetchData.accounts);
  const totalArts = accountOrder.reduce((sum, acc) => sum + fetchData.accounts[acc].articles.length, 0);
  const accountsWithArts = accountOrder.filter((acc) => fetchData.accounts[acc].articles.length > 0).length;

  const lines = [
    `# 公众号日报 · ${DATE}`,
    '',
    `> 共 ${accountsWithArts} 个账号，${totalArts} 篇文章`,
    '',
    '---',
    '',
  ];

  for (const account of accountOrder) {
    const info = fetchData.accounts[account];
    const arts = info.articles.filter((a) => !SKIP_REVIEW_IDS.includes(a.reviewId));

    lines.push(`## ${account}`);
    lines.push('');

    if (arts.length === 0) {
      lines.push('（今日无更新）');
      lines.push('');
      lines.push('---');
      lines.push('');
      continue;
    }

    for (const art of arts) {
      const isSkipTitle = SKIP_TITLE_KEYWORDS.some((kw) => art.title.includes(kw));
      const extracted = articles.find((a) => a.reviewId === art.reviewId);
      const rawMpUrl = extracted?.extractedMpUrl || art.mpUrl || '';
      const mpUrl = fixUrl(rawMpUrl);
      const ridSuffix = art.reviewId.split('_').slice(2).join('_');

      lines.push(`### [${art.title}（${art.timeStr}）](https://weread.qq.com/web/reader/${info.bookId}_${ridSuffix})`);
      lines.push('');
      lines.push(isSkipTitle ? '（测评/广告内容，略）' : (summaries[art.reviewId] || '（未收录）'));
      lines.push('');
      if (mpUrl) { lines.push(`> 📎 [原文链接](${mpUrl})`); lines.push(''); }
    }

    lines.push('---');
    lines.push('');
  }

  if (fetchData.unmatched?.length) {
    lines.push('## ⚠️ 未找到的账号');
    lines.push('');
    fetchData.unmatched.forEach((u) => lines.push(`- ${u}：未订阅或名称有误`));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push(`*生成时间：${DATE} 北京时间*`);

  const output = lines.join('\n');
  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`✅ 已写入 ${OUTPUT_FILE} (${output.length} 字符)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
