const CACHE_NAME = "foodmap-app-shell-v3";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/foodmap-icon.svg"];

function offlineFallbackResponse() {
  return new Response(
    `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>FoodMap 暂时离线</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #1f1a13; color: #fff7ed; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { width: min(86vw, 520px); border: 1px solid rgba(255, 247, 237, .22); border-radius: 20px; padding: 28px; background: rgba(20, 16, 11, .86); box-shadow: 0 20px 80px rgba(0, 0, 0, .36); }
      h1 { margin: 0 0 14px; font-size: 28px; line-height: 1.2; }
      p { margin: 0 0 12px; color: #e7d7c3; font-size: 16px; line-height: 1.7; }
      .note { margin-top: 18px; color: #f7bf8a; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <h1>FoodMap 暂时无法连接静态站点</h1>
      <p>当前浏览器和本地数据仍在设备上。地图瓦片、静态站点或网络恢复后，请刷新页面继续使用。</p>
      <p>FoodMap 不会把本地收藏误报为云同步，也不会因为网络失败自动删除本地数据。</p>
      <p class="note">请检查网络或稍后重试。</p>
    </main>
  </body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    }
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  const sameOrigin = requestUrl.origin === self.location.origin;
  if (!sameOrigin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => (response.ok ? response : offlineFallbackResponse()))
        .catch(() => caches.match("./index.html").then((response) => response || offlineFallbackResponse()))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
