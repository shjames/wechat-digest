// cdp-proxy.mjs — 简单的 Chrome CDP 代理服务器
// 将 HTTP 请求转换为 Chrome DevTools Protocol 调用
import { createServer } from "node:http";

const CHROME_CDP = "http://localhost:9222";
const PORT = 3488;

// 辅助：获取 Chrome CDP 信息
async function chromeFetch(path) {
  const r = await fetch(`${CHROME_CDP}${path}`);
  if (!r.ok) throw new Error(`Chrome CDP ${path} failed: ${r.status}`);
  return r.json();
}

// 辅助：通过 WebSocket 发送 CDP 命令并获取结果
async function wsSend(wsUrl, method, params) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const msgId = 1;

    ws.on("open", () => {
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === msgId) {
        ws.close();
        resolve(msg.result);
      }
    });

    ws.on("error", (err) => {
      ws.close();
      reject(err);
    });

    setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error("WebSocket timeout"));
    }, 30000);
  });
}

// 辅助：获取 tab 的 WebSocket URL
async function getWsUrl(targetId) {
  const tabs = await chromeFetch("/json");
  const tab = tabs.find((t) => t.id === targetId);
  if (!tab) throw new Error(`Tab ${targetId} not found`);
  return tab.webSocketDebuggerUrl;
}

// 解析 JSON body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
  });
}

// CORS 头
function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
}

const server = createServer(async (req, res) => {
  setCORS(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;

  try {
    if (path === "/new" && req.method === "GET") {
      // 创建新 tab
      const targetUrl = url.searchParams.get("url") || "about:blank";
      const tabs = await chromeFetch("/json");
      // 找一个已有的 tab 或者创建新的
      const data = await chromeFetch(`/json/new?${new URLSearchParams({ url: targetUrl })}`);
      console.error(`[cdp-proxy] new tab: ${data.id} -> ${targetUrl}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ targetId: data.id }));
      return;
    }

    if (path === "/close" && req.method === "GET") {
      const targetId = url.searchParams.get("target");
      if (!targetId) throw new Error("Missing target param");
      const wsUrl = await getWsUrl(targetId);
      // 通过 Runtime.evaluate 关闭页面没有用，用 chromeFetch close
      await chromeFetch(`/json/close/${targetId}`);
      console.error(`[cdp-proxy] closed tab: ${targetId}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (path === "/eval" && req.method === "POST") {
      const targetId = url.searchParams.get("target");
      if (!targetId) throw new Error("Missing target param");
      const expression = await parseBody(req);

      const wsUrl = await getWsUrl(targetId);

      // 开启 Runtime domain
      try { await wsSend(wsUrl, "Runtime.enable", {}); } catch {}

      // 使用 Runtime.evaluate 执行脚本
      const result = await wsSend(wsUrl, "Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
        timeout: 120000,
      });

      if (result.exceptionDetails) {
        throw new Error(
          result.exceptionDetails.text || result.exceptionDetails.exception?.description || "eval exception"
        );
      }

      const value = result.result?.value;
      console.error(`[cdp-proxy] eval on ${targetId.slice(0,8)}: ${typeof value === "string" ? value.slice(0, 100) : typeof value}`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ value }));
      return;
    }

    if (path === "/list") {
      const tabs = await chromeFetch("/json");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(tabs.map((t) => ({ id: t.id, url: t.url, title: t.title }))));
      return;
    }

    // 404
    res.writeHead(404);
    res.end("Not found");
  } catch (e) {
    console.error(`[cdp-proxy] error: ${e.message}`);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(PORT, () => {
  console.error(`[cdp-proxy] listening on http://localhost:${PORT}`);
  console.error(`[cdp-proxy] Chrome CDP: ${CHROME_CDP}`);
});
