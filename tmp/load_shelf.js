
(async function() {
  try {
    var r = await fetch("https://weread.qq.com/web/shelf/sync?synckey=0&lectureSynckey=0");
    var data = await r.json();
    if (!data.books) return "NOT_LOGGED_IN";
    var mp = data.books.filter(function(b) { return b.bookId && b.bookId.startsWith("MP_WXS_"); }).map(function(b) { return {bookId: b.bookId, name: (b.book && b.book.title) || b.bookId}; });
    window._mpAccounts = mp;
    return "OK:" + mp.length;
  } catch(e) {
    return "ERR:" + e.message;
  }
})()
