
window._allArticles = window._allArticles || {};
(async function() {
  async function fetchOne(i, targetDate) {
    const acc = window._mpAccounts[i];
    const bookId = acc.bookId;
    try {
      const r = await fetch("https://weread.qq.com/web/mp/articles?bookId=" + bookId + "&offset=0");
      const data = await r.json();
      if (data.errCode) {
        return {name: acc.name, error: data.errCode};
      }
      const arts = [];
      let stop = false;
      for (const rv of (data.reviews || [])) {
        for (const sub of (rv.subReviews || [])) {
          const info = sub.review && sub.review.mpInfo;
          if (!info) continue;
          const ts = info.time || sub.review.createTime;
          const bjDate = new Date((ts + 8*3600)*1000).toISOString().slice(0,10);
          if (bjDate === targetDate) {
            arts.push({title: info.title, content: (info.content || "").slice(0,500), time: ts, readNum: info.readNum||0});
          } else if (bjDate < targetDate) {
            stop = true; break;
          }
        }
        if (stop) break;
      }
      return {name: acc.name, articles: arts};
    } catch(e) {
      return {name: acc.name, error: e.message};
    }
  }
  const indices = [0,1,2,3,4,6];
  for (const i of indices) {
    window._allArticles[i] = await fetchOne(i, "2026-04-27");
  }
  return JSON.stringify(window._allArticles);
})();
