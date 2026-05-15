import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

const OUTPUT_DIR = './output';
const SITE_DIR   = './site';
const SITE_TITLE = '公众号日报';

// ── constants ─────────────────────────────────────────────────────────────────

const WEEKDAYS  = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(dateStr + 'T00:00:00');
  return { year, month, day, monthEn: MONTHS_EN[+month - 1], wd: `星期${WEEKDAYS[d.getDay()]}` };
}

function parseMeta(md) {
  const m = md.match(/共\s*(\d+)\s*个账号.*?(\d+)\s*篇文章/);
  if (m) return { accounts: m[1], articles: m[2] };
  const a = md.match(/(\d+)\s*篇文章/);
  return { accounts: '?', articles: a ? a[1] : '?' };
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #f6f1e7;
  --bg2:      #ede8db;
  --surface:  #faf7f0;
  --ink:      #1d1912;
  --ink2:     #4e473f;
  --ink3:     #9a9088;
  --accent:   #b83224;
  --accent2:  #d4574a;
  --rule:     #d8d0c2;
  --rule2:    #e8e2d6;
  --serif:    'Noto Serif SC', 'Songti SC', 'Source Han Serif SC', 'SimSun', Georgia, serif;
  --display:  'Playfair Display', 'Georgia', 'Times New Roman', serif;
  --max-w:    740px;
  --r:        3px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:      #13100b;
    --bg2:     #1c1812;
    --surface: #171410;
    --ink:     #ede5d6;
    --ink2:    #c0b0a0;
    --ink3:    #7a7060;
    --accent:  #d4826a;
    --accent2: #e09a82;
    --rule:    #2c2820;
    --rule2:   #231f18;
  }
}

/* ── base ── */
html { font-size: 16px; -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }

body {
  font-family: var(--serif);
  background: var(--bg);
  color: var(--ink);
  line-height: 1.8;
  padding-bottom: 80px;
  min-height: 100vh;
}

/* ── animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.fade-up   { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }
.fade-in   { animation: fadeIn 0.4s ease both; }
.delay-1   { animation-delay: 0.07s; }
.delay-2   { animation-delay: 0.14s; }
.delay-3   { animation-delay: 0.21s; }
.delay-4   { animation-delay: 0.28s; }

/* ── scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 3px; }

/* ── nav ── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  border-bottom: 1px solid var(--rule2);
  padding: 0 20px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-home {
  font-family: var(--display);
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--ink2);
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.nav-home:hover { color: var(--accent); }
.nav-home svg { flex-shrink: 0; }

.nav-sep {
  width: 1px;
  height: 16px;
  background: var(--rule);
  flex-shrink: 0;
}

.nav-info {
  font-family: var(--display);
  font-size: 12px;
  color: var(--ink3);
  letter-spacing: 0.06em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.nav-brand {
  margin-left: auto;
  font-family: var(--display);
  font-size: 14px;
  letter-spacing: 0.22em;
  color: var(--ink2);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── container ── */
.container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 20px;
}

/* ── masthead (index) ── */
.masthead {
  text-align: center;
  padding: 60px 20px 52px;
  animation: fadeUp 0.7s cubic-bezier(.22,.68,0,1.2) both;
}

.masthead-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 28px;
}
.masthead-ornament::before,
.masthead-ornament::after {
  content: '';
  width: 80px;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--rule));
}
.masthead-ornament::after {
  background: linear-gradient(to left, transparent, var(--rule));
}
.masthead-ornament-diamond {
  width: 6px;
  height: 6px;
  background: var(--accent);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.masthead h1 {
  font-family: var(--display);
  font-size: clamp(32px, 8vw, 52px);
  font-weight: 400;
  letter-spacing: 0.35em;
  color: var(--ink);
  line-height: 1;
  padding-right: 0.35em; /* compensate letter-spacing on last char */
}

.masthead-en {
  font-family: var(--display);
  font-size: 11px;
  letter-spacing: 0.32em;
  color: var(--ink3);
  text-transform: uppercase;
  margin-top: 14px;
}

.masthead-rule {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 24px auto 0;
  max-width: 340px;
}
.masthead-rule-line {
  flex: 1;
  height: 1px;
  background: var(--rule);
}
.masthead-rule-line.thick {
  height: 2px;
  background: var(--ink);
}
.masthead-rule-gap { width: 4px; }

.masthead-meta {
  font-family: var(--display);
  font-size: 12px;
  color: var(--ink3);
  letter-spacing: 0.1em;
  margin-top: 20px;
}

/* ── year group (index) ── */
.year-group { margin-top: 44px; }
.year-group + .year-group { margin-top: 36px; }

.year-label {
  font-family: var(--display);
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--ink3);
  text-transform: uppercase;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 14px;
}

/* ── date grid (index) ── */
.date-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.date-card {
  display: block;
  background: var(--surface);
  border: 1px solid var(--rule2);
  border-radius: var(--r);
  padding: 18px 14px 14px;
  text-decoration: none;
  color: var(--ink);
  transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
  position: relative;
  overflow: hidden;
}

.date-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
}

.date-card:hover {
  border-color: var(--rule);
  transform: translateY(-3px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.09);
}

.date-card:hover::before { transform: scaleX(1); }

.date-card.today {
  border-color: var(--accent);
  background: var(--bg2);
}
.date-card.today::before { transform: scaleX(1); }

.card-month {
  font-family: var(--display);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--accent);
  text-transform: uppercase;
}

.card-day {
  font-family: var(--display);
  font-size: 40px;
  font-weight: 300;
  line-height: 1.05;
  color: var(--ink);
  letter-spacing: -0.02em;
  margin: 1px 0 2px;
}

.card-weekday {
  font-family: var(--serif);
  font-size: 11px;
  color: var(--ink3);
  letter-spacing: 0.04em;
}

.card-meta {
  font-family: var(--display);
  font-size: 11px;
  color: var(--ink2);
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--rule2);
  letter-spacing: 0.04em;
}

/* ── page header (article) ── */
.page-header {
  padding: 48px 0 36px;
  margin-bottom: 44px;
  border-bottom: 1px solid var(--rule);
  position: relative;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 48px;
  height: 2px;
  background: var(--accent);
}

.page-header-eyebrow {
  font-family: var(--display);
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--ink3);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.page-header-date {
  font-family: var(--display);
  font-size: clamp(36px, 10vw, 58px);
  font-weight: 300;
  color: var(--ink);
  letter-spacing: -0.01em;
  line-height: 1;
}

.page-header-date em {
  font-style: normal;
  color: var(--ink3);
  font-size: 0.55em;
  letter-spacing: 0.1em;
}

.page-header-wd {
  font-family: var(--display);
  font-size: 14px;
  letter-spacing: 0.12em;
  color: var(--ink2);
  margin-top: 8px;
}

.page-header-meta {
  display: flex;
  gap: 20px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.page-header-meta-item {
  font-family: var(--display);
  font-size: 12px;
  color: var(--ink3);
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

/* ── markdown body ── */

/* h2: account sections */
.md-body h2 {
  font-family: var(--display);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--ink);
  margin: 52px 0 0;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--rule);
  position: relative;
  line-height: 1.3;
}

.md-body h2::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 36px;
  height: 2px;
  background: var(--accent);
}

.md-body h2:first-child { margin-top: 0; }

/* h3: article titles */
.md-body h3 {
  font-family: var(--serif);
  font-size: 15.5px;
  font-weight: 500;
  margin: 28px 0 9px;
  color: var(--ink);
  line-height: 1.55;
}

.md-body h3 a {
  color: var(--ink);
  text-decoration: none;
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
  padding-bottom: 1px;
  transition: background-size 0.3s ease, color 0.2s;
}

.md-body h3 a:hover {
  color: var(--accent);
  background-size: 100% 1px;
}

.article-time {
  font-family: var(--display);
  font-size: 12px;
  font-weight: 300;
  color: var(--ink3);
  letter-spacing: 0.04em;
}

/* p: summary */
.md-body p {
  font-size: 15px;
  color: var(--ink2);
  margin: 10px 0;
  line-height: 1.9;
  font-weight: 400;
}

/* blockquote: original article link */
.md-body blockquote {
  margin: 14px 0 4px;
  padding: 0;
  border: none;
  background: none;
}

.md-body blockquote p { margin: 0; }

.md-body blockquote a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px 6px 10px;
  border: 1px solid var(--rule);
  border-radius: 20px;
  color: var(--ink2);
  text-decoration: none;
  font-family: var(--display);
  font-size: 12px;
  letter-spacing: 0.06em;
  background: var(--surface);
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.md-body blockquote a:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg2);
}

/* WeChat icon on original links */
.md-body blockquote a[href*="mp.weixin.qq.com"]::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2307c160' d='M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-3.895-6.348-7.601-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm4.843 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.142 2.45c-3.016 0-5.463 2.144-5.463 4.787 0 2.644 2.447 4.788 5.463 4.788.871 0 1.69-.179 2.434-.492a.748.748 0 0 1 .61.083l1.592.93a.28.28 0 0 0 .14.046.248.248 0 0 0 .248-.248.215.215 0 0 0-.04-.18l-.327-1.238a.505.505 0 0 1 .179-.558C21.525 15.368 22.5 13.77 22.5 12c0-2.643-2.447-4.559-6.73-3.559zm-2.6 2.237c.538 0 .974.444.974.99a.982.982 0 0 1-.975.99.982.982 0 0 1-.975-.99c0-.546.437-.99.975-.99zm5.2 0c.538 0 .975.444.975.99a.982.982 0 0 1-.975.99.982.982 0 0 1-.975-.99c0-.546.437-.99.975-.99z'/%3E%3C/svg%3E") center/contain no-repeat;
}

/* ul: no-update list */
.md-body ul {
  padding-left: 0;
  list-style: none;
  margin: 10px 0;
}

.md-body ul li {
  font-family: var(--display);
  font-size: 13px;
  color: var(--ink3);
  padding: 3px 0 3px 18px;
  position: relative;
  letter-spacing: 0.03em;
}

.md-body ul li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--rule);
  font-family: var(--display);
}

/* hr: section divider */
.md-body hr {
  border: none;
  margin: 44px 0;
  height: 1px;
  background: var(--rule2);
  position: relative;
}

/* em: footer */
.md-body > em,
.md-body p > em {
  display: block;
  font-style: italic;
  font-family: var(--display);
  font-size: 12px;
  color: var(--ink3);
  text-align: center;
  letter-spacing: 0.08em;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--rule2);
}

/* ── date nav (prev/next) ── */
.date-nav {
  display: flex;
  align-items: stretch;
  margin-top: 60px;
  padding-top: 32px;
  border-top: 1px solid var(--rule);
  gap: 1px;
  background: var(--rule2);
  border: 1px solid var(--rule2);
  border-radius: var(--r);
  overflow: hidden;
}

.date-nav a {
  flex: 1;
  padding: 16px 20px;
  text-decoration: none;
  background: var(--surface);
  transition: background 0.2s, color 0.2s;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.date-nav a:first-child { text-align: left; }
.date-nav a:last-child  { text-align: right; }
.date-nav a:hover { background: var(--bg2); }

.date-nav a:first-child:last-child { text-align: left; }

.date-nav .nav-dir {
  font-family: var(--display);
  font-size: 10px;
  letter-spacing: 0.25em;
  color: var(--ink3);
  text-transform: uppercase;
}

.date-nav .nav-date {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 300;
  color: var(--accent);
  letter-spacing: 0.03em;
}

.date-nav .placeholder {
  flex: 1;
  background: var(--surface);
}

/* ── responsive ── */
@media (max-width: 480px) {
  .nav { padding: 0 14px; height: 48px; }
  .masthead { padding: 40px 16px 36px; }
  .date-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .date-card { padding: 14px 12px 12px; }
  .card-day { font-size: 32px; }
  .container { padding: 0 14px; }
  .page-header { padding: 32px 0 28px; margin-bottom: 32px; }
  .md-body h2 { font-size: 20px; margin-top: 40px; }
  .md-body h3 { font-size: 15px; }
  .md-body p  { font-size: 14.5px; }
}

@media (max-width: 360px) {
  .date-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
  .card-day { font-size: 28px; }
}
`;

// ── JS ────────────────────────────────────────────────────────────────────────

const WECHAT_JS = `
(function(){
  var ua=navigator.userAgent;
  var isMM=/MicroMessenger/i.test(ua);
  var isAnd=/Android/i.test(ua);
  document.querySelectorAll('a[href*="mp.weixin.qq.com"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var url=a.href;
      if(isMM){e.preventDefault();window.location.href=url;return;}
      if(isAnd){
        e.preventDefault();
        try{
          var u=new URL(url);
          window.location.href='intent://'+u.host+u.pathname+u.search
            +'#Intent;scheme=https;package=com.tencent.mm;'
            +'S.browser_fallback_url='+encodeURIComponent(url)+';end';
        }catch(_){window.location.href=url;}
      }
    });
  });
})();
`;

const ARTICLE_JS = `
// De-emphasize timestamps in article titles
document.querySelectorAll('.md-body h3 a').forEach(function(a){
  a.innerHTML=a.innerHTML.replace(
    /（(\d{1,2}:\d{2})）/g,
    '<span class="article-time">（$1）</span>'
  );
});
// Highlight today's card on index
var today=new Date().toISOString().slice(0,10);
var card=document.querySelector('a[href="'+today+'.html"]');
if(card)card.classList.add('today');
`;

// ── shell ─────────────────────────────────────────────────────────────────────

function shell(body, { title, back = true, navInfo = '' } = {}) {
  const homeLink = back
    ? `<a class="nav-home" href="index.html">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        首页
      </a>
      <div class="nav-sep"></div>`
    : '';
  const navInfoEl = navInfo ? `<span class="nav-info">${navInfo}</span>` : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — ${SITE_TITLE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;500;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<nav class="nav">
  ${homeLink}
  ${navInfoEl}
  <span class="nav-brand">${SITE_TITLE}</span>
</nav>
<div class="container">
${body}
</div>
<script>${WECHAT_JS}${ARTICLE_JS}</script>
</body>
</html>`;
}

// ── build ─────────────────────────────────────────────────────────────────────

mkdirSync(SITE_DIR, { recursive: true });

const files = readdirSync(OUTPUT_DIR)
  .filter(f => /^wechat-digest-\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort()
  .reverse();

const dates = files.map(f => f.replace('wechat-digest-', '').replace('.md', ''));

console.log(`Found ${files.length} digest files.`);

// ── individual date pages ─────────────────────────────────────────────────────

files.forEach((file, idx) => {
  const date = dates[idx];
  const { year, month, day, monthEn, wd } = parseDate(date);
  const md = readFileSync(join(OUTPUT_DIR, file), 'utf8');
  const { accounts, articles } = parseMeta(md);
  // Strip redundant H1, meta blockquote, and leading HR from MD
  // (the page already has a custom header section)
  const mdBody = md
    .replace(/^# [^\n]+\n+/, '')
    .replace(/^> 共[^\n]+\n+/, '')
    .replace(/^---\n+/, '');
  const html = marked.parse(mdBody);

  const prev = idx < dates.length - 1 ? dates[idx + 1] : null;
  const next = idx > 0 ? dates[idx - 1] : null;

  const prevLink = prev
    ? `<a href="${prev}.html">
        <span class="nav-dir">← 上一期</span>
        <span class="nav-date">${prev}</span>
      </a>`
    : `<div class="placeholder"></div>`;

  const nextLink = next
    ? `<a href="${next}.html" style="text-align:right">
        <span class="nav-dir">下一期 →</span>
        <span class="nav-date">${next}</span>
      </a>`
    : `<div class="placeholder"></div>`;

  const page = shell(`
<div class="page-header fade-up">
  <div class="page-header-eyebrow">${SITE_TITLE} · ${year}</div>
  <div class="page-header-date">${monthEn} <em>·</em> ${day}</div>
  <div class="page-header-wd">${wd}</div>
  <div class="page-header-meta">
    <span class="page-header-meta-item"><span class="meta-dot"></span>${accounts} 个账号</span>
    <span class="page-header-meta-item"><span class="meta-dot"></span>${articles} 篇文章</span>
  </div>
</div>
<div class="md-body fade-up delay-1">${html}</div>
<nav class="date-nav fade-up delay-2">
  ${prevLink}
  ${nextLink}
</nav>
`, {
    title: `${monthEn} ${day}, ${year}`,
    back: true,
    navInfo: `${date} ${wd}`,
  });

  writeFileSync(join(SITE_DIR, `${date}.html`), page);
  console.log(`  ✓ ${date}.html  (${accounts} 账号, ${articles} 篇)`);
});

// ── index page ────────────────────────────────────────────────────────────────

// Group by year
const byYear = {};
files.forEach((file, idx) => {
  const date = dates[idx];
  const { year } = parseDate(date);
  if (!byYear[year]) byYear[year] = [];
  byYear[year].push({ file, date, idx });
});

const yearGroups = Object.keys(byYear)
  .sort((a, b) => b - a)
  .map((year, yi) => {
    const cards = byYear[year].map(({ file, date, idx }) => {
      const { month, day, monthEn, wd } = parseDate(date);
      const md = readFileSync(join(OUTPUT_DIR, file), 'utf8');
      const { accounts, articles } = parseMeta(md);
      return `<a class="date-card" href="${date}.html">
  <span class="card-month">${monthEn}</span>
  <span class="card-day">${day}</span>
  <span class="card-weekday">${wd}</span>
  <div class="card-meta">${articles} 篇 · ${accounts} 账号</div>
</a>`;
    }).join('\n');

    const delay = yi < 3 ? ` delay-${yi + 1}` : '';
    return `<div class="year-group fade-up${delay}">
  <div class="year-label">${year}</div>
  <div class="date-grid">
${cards}
  </div>
</div>`;
  }).join('\n');

const indexPage = shell(`
<div class="masthead">
  <div class="masthead-ornament">
    <div class="masthead-ornament-diamond"></div>
  </div>
  <h1>${SITE_TITLE}</h1>
  <div class="masthead-en">WeChat Public Account Digest</div>
  <div class="masthead-rule">
    <div class="masthead-rule-line thick"></div>
    <div class="masthead-rule-gap"></div>
    <div class="masthead-rule-line"></div>
  </div>
  <div class="masthead-meta">共 ${files.length} 期存档</div>
</div>
${yearGroups}
`, { title: '首页', back: false });

writeFileSync(join(SITE_DIR, 'index.html'), indexPage);
console.log(`\n✅ Site built → ${SITE_DIR}/  (${files.length + 1} files)`);
