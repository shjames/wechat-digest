import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { marked } from 'marked';

const OUTPUT_DIR = './output';
const SITE_DIR = './site';
const SITE_TITLE = '公众号日报';

// ── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #ffffff;
  --bg2: #f7f8fa;
  --border: #e8eaed;
  --text: #202124;
  --text2: #5f6368;
  --accent: #1a73e8;
  --accent-bg: #e8f0fe;
  --tag-bg: #f1f3f4;
  --radius: 8px;
  --max-w: 780px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1c1c1e;
    --bg2: #2c2c2e;
    --border: #3a3a3c;
    --text: #f2f2f7;
    --text2: #aeaeb2;
    --accent: #4da3ff;
    --accent-bg: #1c3354;
    --tag-bg: #3a3a3c;
  }
}

html { font-size: 16px; -webkit-text-size-adjust: 100%; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
               "Microsoft YaHei", "Segoe UI", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  padding-bottom: 60px;
}

/* Nav */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav a { color: var(--accent); text-decoration: none; font-size: 14px; }
.nav a:hover { text-decoration: underline; }
.nav-title { font-size: 15px; font-weight: 600; color: var(--text); flex: 1; }
.nav-sep { color: var(--text2); font-size: 12px; }

/* Container */
.container { max-width: var(--max-w); margin: 0 auto; padding: 24px 16px; }

/* Index page */
.index-hero { text-align: center; padding: 40px 0 32px; }
.index-hero h1 { font-size: 28px; font-weight: 700; }
.index-hero p { color: var(--text2); margin-top: 8px; font-size: 15px; }

.date-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.date-card {
  display: flex;
  flex-direction: column;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  text-decoration: none;
  color: var(--text);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.date-card:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(26,115,232,0.12);
}
.date-card .date-label { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
.date-card .date-meta { font-size: 13px; color: var(--text2); margin-top: 4px; }
.date-card .date-weekday { font-size: 12px; color: var(--accent); margin-top: 8px; font-weight: 500; }

/* Article page */
.page-header { padding: 28px 0 20px; border-bottom: 1px solid var(--border); margin-bottom: 28px; }
.page-header h1 { font-size: 22px; font-weight: 700; }
.page-header .meta { color: var(--text2); font-size: 14px; margin-top: 6px; }

/* Markdown rendered content */
.md-body h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 32px 0 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--border);
  color: var(--text);
}
.md-body h2:first-child { margin-top: 0; }

.md-body h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 20px 0 8px;
  color: var(--text);
}
.md-body h3 a {
  color: var(--accent);
  text-decoration: none;
  word-break: break-all;
}
.md-body h3 a:hover { text-decoration: underline; }

.md-body p {
  font-size: 15px;
  color: var(--text);
  margin: 8px 0;
  line-height: 1.75;
}

.md-body blockquote {
  margin: 10px 0;
  padding: 10px 14px;
  background: var(--accent-bg);
  border-left: 3px solid var(--accent);
  border-radius: 0 var(--radius) var(--radius) 0;
  font-size: 14px;
  color: var(--text2);
}
.md-body blockquote a { color: var(--accent); }
.md-body blockquote p { font-size: 14px; color: var(--text2); margin: 0; }

/* WeChat article links — show green WeChat badge */
.md-body blockquote a[href*="mp.weixin.qq.com"]::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 5px;
  vertical-align: -2px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2307c160' d='M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-3.895-6.348-7.601-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm4.843 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.142 2.45c-3.016 0-5.463 2.144-5.463 4.787 0 2.644 2.447 4.788 5.463 4.788.871 0 1.69-.179 2.434-.492a.748.748 0 0 1 .61.083l1.592.93a.28.28 0 0 0 .14.046.248.248 0 0 0 .248-.248.215.215 0 0 0-.04-.18l-.327-1.238a.505.505 0 0 1 .179-.558C21.525 15.368 22.5 13.77 22.5 12c0-2.643-2.447-4.559-6.73-3.559zm-2.6 2.237c.538 0 .974.444.974.99a.982.982 0 0 1-.975.99.982.982 0 0 1-.975-.99c0-.546.437-.99.975-.99zm5.2 0c.538 0 .975.444.975.99a.982.982 0 0 1-.975.99.982.982 0 0 1-.975-.99c0-.546.437-.99.975-.99z'/%3E%3C/svg%3E") center/contain no-repeat;
}

.md-body ul {
  padding-left: 20px;
  margin: 8px 0;
}
.md-body ul li { font-size: 15px; line-height: 1.7; color: var(--text2); }

.md-body hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 24px 0;
}

.md-body em { color: var(--text2); font-size: 13px; font-style: normal; }

/* Date nav (prev/next) */
.date-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  gap: 12px;
}
.date-nav a {
  flex: 1;
  padding: 12px 16px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--accent);
  font-size: 14px;
  text-align: center;
  transition: border-color 0.15s;
}
.date-nav a:hover { border-color: var(--accent); }
.date-nav .placeholder { flex: 1; }

@media (max-width: 480px) {
  .index-hero h1 { font-size: 24px; }
  .date-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .date-card { padding: 12px; }
  .date-card .date-label { font-size: 16px; }
  .container { padding: 16px 14px; }
  .page-header h1 { font-size: 19px; }
  .md-body h2 { font-size: 17px; }
}
`;

// ── helpers ───────────────────────────────────────────────────────────────────

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function weekday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `星期${WEEKDAYS[d.getDay()]}`;
}

function shell(html, { title, navExtra = '', back = true } = {}) {
  const homeLink = back ? `<a href="index.html">← 首页</a>` : '';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — ${SITE_TITLE}</title>
<style>${CSS}</style>
</head>
<body>
<nav class="nav">
  ${homeLink}
  ${homeLink && navExtra ? `<span class="nav-sep">·</span>` : ''}
  ${navExtra}
  <span class="nav-title">${SITE_TITLE}</span>
</nav>
<div class="container">
${html}
</div>
<script>
(function () {
  // Android: use Chrome Intent URL to open mp.weixin.qq.com links directly in WeChat
  // iOS: Universal Links intercept mp.weixin.qq.com natively — no JS needed
  if (!/Android/i.test(navigator.userAgent)) return;

  document.querySelectorAll('a[href*="mp.weixin.qq.com"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var url = a.href;
      try {
        var u = new URL(url);
        // intent://mp.weixin.qq.com/s?...#Intent;scheme=https;package=com.tencent.mm;end
        var intentUrl = 'intent://' + u.host + u.pathname + u.search
          + '#Intent;scheme=https;package=com.tencent.mm;'
          + 'S.browser_fallback_url=' + encodeURIComponent(url) + ';end';
        window.location.href = intentUrl;
      } catch (_) {
        window.location.href = url;
      }
    });
  });
})();
</script>
</body>
</html>`;
}

// Extract article count and account count from first 3 lines of MD
function parseMeta(md) {
  const match = md.match(/共\s*(\d+)\s*个账号.*?(\d+)\s*篇文章/);
  if (match) return { accounts: match[1], articles: match[2] };
  const artMatch = md.match(/(\d+)\s*篇文章/);
  return { accounts: '?', articles: artMatch ? artMatch[1] : '?' };
}

// ── build ─────────────────────────────────────────────────────────────────────

mkdirSync(SITE_DIR, { recursive: true });

// Collect all date MD files (exclude -full suffix)
const files = readdirSync(OUTPUT_DIR)
  .filter(f => /^wechat-digest-\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort()
  .reverse(); // newest first

const dates = files.map(f => f.replace('wechat-digest-', '').replace('.md', ''));

console.log(`Found ${files.length} digest files.`);

// Build each date page
files.forEach((file, idx) => {
  const date = dates[idx];
  const md = readFileSync(join(OUTPUT_DIR, file), 'utf8');
  const { accounts, articles } = parseMeta(md);
  const html = marked.parse(md);

  const prev = idx < dates.length - 1 ? dates[idx + 1] : null;
  const next = idx > 0 ? dates[idx - 1] : null;

  const prevLink = prev
    ? `<a href="${prev}.html">← ${prev}</a>`
    : `<div class="placeholder"></div>`;
  const nextLink = next
    ? `<a href="${next}.html">${next} →</a>`
    : `<div class="placeholder"></div>`;

  const page = shell(`
<div class="page-header">
  <h1>${SITE_TITLE} · ${date}</h1>
  <p class="meta">${weekday(date)} · ${accounts} 个账号 · ${articles} 篇文章</p>
</div>
<div class="md-body">${html}</div>
<nav class="date-nav">
  ${prevLink}
  ${nextLink}
</nav>
`, { title: date, navExtra: `<span style="font-size:14px;color:var(--text2)">${date} ${weekday(date)}</span>` });

  writeFileSync(join(SITE_DIR, `${date}.html`), page);
  console.log(`  ✓ ${date}.html  (${accounts} 账号, ${articles} 篇)`);
});

// Build index page
const cards = files.map((file, idx) => {
  const date = dates[idx];
  const md = readFileSync(join(OUTPUT_DIR, file), 'utf8');
  const { accounts, articles } = parseMeta(md);
  return `<a class="date-card" href="${date}.html">
  <span class="date-label">${date}</span>
  <span class="date-meta">${accounts} 账号 · ${articles} 篇文章</span>
  <span class="date-weekday">${weekday(date)}</span>
</a>`;
}).join('\n');

const indexHtml = shell(`
<div class="index-hero">
  <h1>📰 ${SITE_TITLE}</h1>
  <p>微信公众号每日摘要 · 共 ${files.length} 期</p>
</div>
<div class="date-grid">
${cards}
</div>
`, { title: '首页', back: false });

writeFileSync(join(SITE_DIR, 'index.html'), indexHtml);
console.log(`\n✅ Site built → ${SITE_DIR}/  (${files.length + 1} files)`);
