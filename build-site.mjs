import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

const OUTPUT_DIR = './output';
const SITE_DIR   = './site';
const SITE_TITLE = '公众号日报';

// ── constants ─────────────────────────────────────────────────────────────────

const WEEKDAYS  = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// Accent color per month — vivid against dark card covers
const MONTH_COLORS = [
  '#ff6b6b','#ff9f43','#ffd32a','#0be881',
  '#3ae0f9','#4ea8de','#7c6aff','#f368e0',
  '#ff6b9d','#ff6348','#7bed9f','#70a1ff',
];

// ── quotes / emojis / holidays ────────────────────────────────────────────────

const QUOTES = [
  '世界按下暂停键，所有烦恼都跑出来晒太阳',
  '每一个普通的今天，都藏着值得珍惜的小确幸',
  '今天也要好好吃饭，好好睡觉，好好爱自己',
  '深呼吸，慢慢来，一切都会好的',
  '阳光总在风雨后，乌云遮不住太阳',
  '把每一天都过成礼拜五',
  '心中有阳光，脚下就有力量',
  '走慢一点，看看沿途的风景',
  '今天的温柔，是给未来自己的礼物',
  '每一步都算数，每一天都有意义',
  '你比你想象中更勇敢、更坚强、更聪明',
  '今天的努力，是明天最好的底气',
  '种一棵树最好的时间是十年前，其次是现在',
  '不要停止好奇，好奇是进步的起点',
  '慢慢走，也在前进',
  '读万卷书，行万里路',
  '读书是最廉价的旅行，旅行是最生动的读书',
  '好文章是写给所有时代的信',
  '每天读一点，积累一点点',
  '阅读是对作者最好的尊重',
  '信息喂养大脑，阅读滋养灵魂',
  '文字是思维最好的容器',
  '花开花落，皆是风景',
  '雨后的空气，闻起来像新生',
  '把时间留给真正重要的事',
  '简单地活，认真地爱',
  '做一个有趣的人，过一段有趣的人生',
  '平凡的生活里，也有闪光的瞬间',
  '知足者常乐，惜福者长安',
  '生活不止眼前的苟且，还有远方的田野',
  '微笑是最美的语言，善良是最好的品格',
  '去看看，去感受，去爱',
  '保持热爱，奔赴山海',
  '今日事今日毕，明日另有明日美',
  '每一次阅读，都是一次远行',
  '愿你所有的努力，都能被生活温柔以待',
  '今天也要闪闪发光呀',
  '不辜负每一个认真的早晨',
  '生命中最美好的事情，很多都是免费的',
  '用力生活，认真爱',
];

const EMOJIS = [
  '🌸','☀️','🌻','🌈','⭐','🌙','🐱','🐼','🦊','🐝',
  '🦋','🐧','🍀','🌺','🌊','⛅','🌟','📚','☕','🎵',
  '💫','✨','🐨','🦁','🌵','🍁','🐸','🌿','🎋','🎯',
];

const HOLIDAY_MAP = {
  '01-01': { name: '元旦', quote: '新年快乐！新的一年，万事如意 🎊', emoji: '🎉' },
  '02-14': { name: '情人节', quote: '愿你被温柔以待，被爱意包围', emoji: '💝' },
  '03-08': { name: '妇女节', quote: '愿所有美丽的灵魂，永远自由', emoji: '🌷' },
  '04-01': { name: '愚人节', quote: '今天，请保持微笑应对一切', emoji: '😄' },
  '04-04': { name: '清明', quote: '慎终追远，珍惜当下', emoji: '🌿' },
  '05-01': { name: '劳动节', quote: '劳动最光荣，休息也重要', emoji: '🌟' },
  '05-04': { name: '青年节', quote: '青春不散场，未来正当时', emoji: '🔥' },
  '06-01': { name: '儿童节', quote: '愿你永远保有一颗赤子之心', emoji: '🎈' },
  '07-01': { name: '建党节', quote: '初心不变，砥砺前行', emoji: '🌸' },
  '08-01': { name: '建军节', quote: '致敬最可爱的人', emoji: '🫡' },
  '09-09': { name: '重阳节', quote: '岁岁重阳，今又重阳，感恩长辈', emoji: '🍂' },
  '09-10': { name: '教师节', quote: '感恩所有照亮过我们的人', emoji: '📚' },
  '10-01': { name: '国庆节', quote: '山河无恙，盛世如你所愿', emoji: '🎉' },
  '10-02': { name: '国庆假期', quote: '好好休息，好好享受假期', emoji: '🌅' },
  '10-03': { name: '国庆假期', quote: '愿山河常在，岁月静好', emoji: '🌅' },
  '12-24': { name: '平安夜', quote: '愿你平安喜乐，岁岁无忧', emoji: '🎄' },
  '12-25': { name: '圣诞节', quote: '愿你的每个心愿都能实现', emoji: '🎅' },
  '12-31': { name: '跨年夜', quote: '告别过去，迎接美好的未来', emoji: '🎆' },
};

function getNthWeekday(year, month0, weekday, n) {
  const d = new Date(year, month0, 1);
  let count = 0;
  while (d.getMonth() === month0) {
    if (d.getDay() === weekday && ++count === n) return d.getDate();
    d.setDate(d.getDate() + 1);
  }
  return null;
}

function getCardContent(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const key = `${month}-${day}`;
  // Mother's Day: 2nd Sunday of May
  if (month === '05' && +day === getNthWeekday(+year, 4, 0, 2))
    return { name: '母亲节', quote: '感谢妈妈，你是世界上最美的风景', emoji: '👩‍👧' };
  // Father's Day: 3rd Sunday of June
  if (month === '06' && +day === getNthWeekday(+year, 5, 0, 3))
    return { name: '父亲节', quote: '父爱如山，感谢有你一路同行', emoji: '👨‍👧' };
  if (HOLIDAY_MAP[key]) return { ...HOLIDAY_MAP[key], name: HOLIDAY_MAP[key].name };
  const hash = +year * 400 + +month * 31 + +day;
  return { name: null, quote: QUOTES[hash % QUOTES.length], emoji: EMOJIS[hash % EMOJIS.length] };
}

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(dateStr + 'T00:00:00');
  return {
    year, month, day,
    monthEn: MONTHS_EN[+month - 1],
    wd: `星期${WEEKDAYS[d.getDay()]}`,
    color: MONTH_COLORS[+month - 1],
  };
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
  --bg:      #f5ede2;
  --white:   #fffcf7;
  --text:    #1c1712;
  --text2:   #5c4f42;
  --text3:   #b09880;
  --accent:  #c0601a;
  --border:  #e8d8c8;
  --shadow:  0 1px 6px rgba(0,0,0,.08);
  --shadow2: 0 2px 16px rgba(0,0,0,.12);
  --r:       10px;
  --sans: -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans SC",
          "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --max-w: 800px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:     #1c1c1e;
    --white:  #2c2c2e;
    --text:   #f2f2f7;
    --text2:  #aeaeb2;
    --text3:  #636366;
    --border: #3a3a3c;
    --shadow: 0 1px 6px rgba(0,0,0,.3);
  }
}

html { font-size: 16px; -webkit-text-size-adjust: 100%; }

body {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  padding-bottom: 40px;
  min-height: 100vh;
}

/* ── animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade  { animation: fadeUp .35s ease both; }
.d1   { animation-delay: .06s; }
.d2   { animation-delay: .12s; }
.d3   { animation-delay: .18s; }

/* ── nav ── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 50px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
}

.nav-back {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--accent);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0;
}
.nav-back svg { width: 20px; height: 20px; }

.nav-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-placeholder { flex-shrink: 0; width: 60px; } /* balance the back button */

/* ── container ── */
.container {
  max-width: var(--max-w);
  margin: 0 auto;
}

/* ────────────────── INDEX PAGE ──────────────────── */

.index-header {
  background: var(--white);
  padding: 20px 16px 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 10px;
}

.index-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: .02em;
}

.index-header-meta {
  font-size: 13px;
  color: var(--text3);
  margin-top: 4px;
}

/* ── date grid ── */
.date-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 10px;
}

/* ── date card ── */
.date-card {
  background: var(--white);
  border-radius: var(--r);
  overflow: hidden;
  text-decoration: none;
  color: var(--text);
  box-shadow: var(--shadow);
  display: block;
  transition: transform .18s ease, box-shadow .18s ease;
  -webkit-tap-highlight-color: transparent;
}

.date-card:active {
  transform: scale(.97);
  box-shadow: var(--shadow2);
}

/* card cover — dark with month color accent */
.card-cover {
  background: #1e1208;
  padding: 13px 13px 12px;
  position: relative;
  min-height: 168px;
  display: flex;
  flex-direction: column;
}

.card-cover-stripe {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}

.card-cover-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-day {
  font-size: 50px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  letter-spacing: -1px;
}

.card-emoji-icon {
  font-size: 26px;
  line-height: 1;
  margin-top: 2px;
}

.card-month-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.card-month {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.card-wd {
  font-size: 11px;
  color: rgba(255,255,255,.4);
}

.card-holiday-tag {
  font-size: 10px;
  background: rgba(255,255,255,.13);
  border-radius: 3px;
  padding: 1px 5px;
  color: rgba(255,255,255,.75);
  letter-spacing: .02em;
}

.card-quote {
  font-size: 11px;
  color: rgba(255,255,255,.6);
  margin-top: auto;
  padding-top: 8px;
  line-height: 1.55;
  letter-spacing: .02em;
}

/* card info strip */
.card-info {
  padding: 11px 14px 13px;
  border-top: 1px solid var(--border);
}

.card-info-date {
  font-size: 12px;
  color: var(--text3);
}

.card-info-stats {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-top: 2px;
}

/* ────────────────── DETAIL PAGE ──────────────────── */

/* page header */
.page-header {
  background: var(--white);
  padding: 20px 16px 18px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 10px;
}

.page-header-date {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: .01em;
}

.page-header-sub {
  font-size: 13px;
  color: var(--text3);
  margin-top: 5px;
  display: flex;
  gap: 12px;
}

/* reading card */
.md-card {
  background: var(--white);
  border-radius: 0;
  padding: 0 16px;
}

/* ── account section (h2) ── */
.md-body h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  padding: 18px 0 14px;
  margin: 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.md-body h2::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 18px;
  background: var(--accent);
  border-radius: 2px;
  flex-shrink: 0;
}

.md-body h2:first-child { padding-top: 20px; }

/* ── article title (h3) ── */
.md-body h3 {
  font-size: 15.5px;
  font-weight: 600;
  color: var(--text);
  margin: 16px 0 8px;
  line-height: 1.5;
}

.md-body h3 a {
  color: var(--text);
  text-decoration: none;
}

.md-body h3 a:active { color: var(--accent); }

.article-time {
  font-size: 12px;
  font-weight: 400;
  color: var(--text3);
}

/* ── summary paragraph ── */
.md-body p {
  font-size: 15.5px;
  color: var(--text2);
  line-height: 1.9;
  margin: 0 0 4px;
}

/* ── original link (blockquote) ── */
.md-body blockquote {
  margin: 10px 0 18px;
  padding: 0;
  border: none;
  background: none;
}

.md-body blockquote p { font-size: 13px; margin: 0; color: var(--text3); }

.md-body blockquote a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px 6px 10px;
  background: #f0f7ff;
  border: 1px solid #c8dff8;
  border-radius: 20px;
  color: var(--accent);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: background .15s;
}

.md-body blockquote a:active { background: #daeeff; }

@media (prefers-color-scheme: dark) {
  .md-body blockquote a {
    background: rgba(22,119,255,.12);
    border-color: rgba(22,119,255,.3);
  }
  .md-body blockquote a:active { background: rgba(22,119,255,.2); }
}

/* WeChat icon */
.md-body blockquote a[href*="mp.weixin.qq.com"]::before {
  content: '';
  display: inline-block;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2307c160' d='M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-3.895-6.348-7.601-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm4.843 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.142 2.45c-3.016 0-5.463 2.144-5.463 4.787 0 2.644 2.447 4.788 5.463 4.788.871 0 1.69-.179 2.434-.492a.748.748 0 0 1 .61.083l1.592.93a.28.28 0 0 0 .14.046.248.248 0 0 0 .248-.248.215.215 0 0 0-.04-.18l-.327-1.238a.505.505 0 0 1 .179-.558C21.525 15.368 22.5 13.77 22.5 12c0-2.643-2.447-4.559-6.73-3.559zm-2.6 2.237c.538 0 .974.444.974.99a.982.982 0 0 1-.975.99.982.982 0 0 1-.975-.99c0-.546.437-.99.975-.99zm5.2 0c.538 0 .975.444.975.99a.982.982 0 0 1-.975.99.982.982 0 0 1-.975-.99c0-.546.437-.99.975-.99z'/%3E%3C/svg%3E") center/contain no-repeat;
}

/* ── no-update list ── */
.md-body ul {
  padding-left: 0;
  list-style: none;
  margin: 6px 0 16px;
}

.md-body ul li {
  font-size: 14px;
  color: var(--text3);
  padding: 4px 0;
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.md-body ul li::before {
  content: '·';
  color: var(--text3);
  flex-shrink: 0;
}

/* ── hr (section divider) ── */
.md-body hr {
  border: none;
  height: 8px;
  background: var(--bg);
  margin: 4px -16px;
}

/* ── footer em ── */
.md-body em {
  display: block;
  font-style: normal;
  font-size: 12px;
  color: var(--text3);
  text-align: center;
  padding: 20px 0 8px;
}

/* ── prev/next nav ── */
.date-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 10px 10px 20px;
  margin-top: 8px;
}

.date-nav a {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px;
  background: var(--white);
  border-radius: var(--r);
  text-decoration: none;
  box-shadow: var(--shadow);
}

.date-nav a:last-child { align-items: flex-end; }

.nav-dir {
  font-size: 11px;
  color: var(--text3);
  letter-spacing: .04em;
}

.nav-date-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--accent);
}

.date-nav .placeholder {
  background: transparent;
  box-shadow: none;
}

/* ── responsive ── */
@media (min-width: 600px) {
  .date-grid { grid-template-columns: repeat(3, 1fr); padding: 0 16px; }
  .md-card { border-radius: var(--r); margin: 0 10px; }
  .date-nav { padding: 10px 16px 20px; }
}

@media (min-width: 800px) {
  .date-grid { grid-template-columns: repeat(4, 1fr); }
  .index-header { border-radius: var(--r); margin: 10px; }
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
  // Highlight today's card
  var today=new Date().toISOString().slice(0,10);
  var c=document.querySelector('a[href="'+today+'.html"] .card-cover-stripe');
  if(c)c.parentElement.parentElement.style.outline='2px solid var(--accent)';
  // De-emphasize timestamps in article titles
  document.querySelectorAll('.md-body h3 a').forEach(function(a){
    a.innerHTML=a.innerHTML.replace(/（(\d{1,2}:\d{2})）/g,
      '<span class="article-time">（$1）</span>');
  });
})();
`;

// ── shell ─────────────────────────────────────────────────────────────────────

function shell(body, { title, back = true } = {}) {
  const navContent = back
    ? `<a class="nav-back" href="index.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        首页
      </a>
      <span class="nav-title">${title}</span>
      <div class="nav-placeholder"></div>`
    : `<span class="nav-title">${SITE_TITLE}</span>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — ${SITE_TITLE}</title>
<style>${CSS}</style>
</head>
<body>
<nav class="nav">${navContent}</nav>
<div class="container">
${body}
</div>
<script>${WECHAT_JS}</script>
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

// ── detail pages ──────────────────────────────────────────────────────────────

files.forEach((file, idx) => {
  const date = dates[idx];
  const { year, month, day, monthEn, wd, color } = parseDate(date);
  const md = readFileSync(join(OUTPUT_DIR, file), 'utf8');
  const { accounts, articles } = parseMeta(md);

  // Strip H1, meta blockquote, and leading HR from MD output
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
        <span class="nav-date-text">${prev}</span>
      </a>`
    : `<div class="placeholder"></div>`;

  const nextLink = next
    ? `<a href="${next}.html">
        <span class="nav-dir">下一期 →</span>
        <span class="nav-date-text">${next}</span>
      </a>`
    : `<div class="placeholder"></div>`;

  const page = shell(`
<div class="page-header fade">
  <div class="page-header-date">${year}年${+month}月${+day}日</div>
  <div class="page-header-sub">
    <span>${wd}</span>
    <span>${accounts} 个账号</span>
    <span>${articles} 篇文章</span>
  </div>
</div>
<div class="md-card md-body fade d1">${html}</div>
<nav class="date-nav fade d2">
  ${prevLink}
  ${nextLink}
</nav>
`, { title: `${year}年${+month}月${+day}日`, back: true });

  writeFileSync(join(SITE_DIR, `${date}.html`), page);
  console.log(`  ✓ ${date}.html  (${accounts} 账号, ${articles} 篇)`);
});

// ── index page ────────────────────────────────────────────────────────────────

const cards = files.map((file, idx) => {
  const date = dates[idx];
  const { year, month, day, monthEn, wd, color } = parseDate(date);
  const md = readFileSync(join(OUTPUT_DIR, file), 'utf8');
  const { accounts, articles } = parseMeta(md);
  const { name: holiday, quote, emoji } = getCardContent(date);
  const holidayTag = holiday ? `<span class="card-holiday-tag">${holiday}</span>` : '';
  return `<a class="date-card" href="${date}.html">
  <div class="card-cover">
    <div class="card-cover-stripe" style="background:${color}"></div>
    <div class="card-cover-top">
      <span class="card-day">${day}</span>
      <span class="card-emoji-icon">${emoji}</span>
    </div>
    <div class="card-month-row">
      <span class="card-month" style="color:${color}">${monthEn}</span>
      <span class="card-wd">${wd}</span>
      ${holidayTag}
    </div>
    <div class="card-quote">${quote}</div>
  </div>
  <div class="card-info">
    <div class="card-info-date">${year}-${month}-${day}</div>
    <div class="card-info-stats">${articles} 篇 · ${accounts} 账号</div>
  </div>
</a>`;
}).join('\n');

const indexPage = shell(`
<div class="index-header fade">
  <h1>${SITE_TITLE}</h1>
  <div class="index-header-meta">共 ${files.length} 期存档</div>
</div>
<div class="date-grid fade d1">
${cards}
</div>
`, { title: '首页', back: false });

writeFileSync(join(SITE_DIR, 'index.html'), indexPage);
console.log(`\n✅ Site built → ${SITE_DIR}/  (${files.length + 1} files)`);
