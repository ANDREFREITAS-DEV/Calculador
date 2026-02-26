/* service-worker.js - offline-first app shell */
const CACHE_NAME = "calc-pwa-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/src/main.js",
  "/src/controller/calculator.controller.js",
  "/src/core/engine.js",
  "/src/core/formatter.js",
  "/src/core/theme.js",
  "/src/ui/dom.js",
  "/src/ui/display.js",
  "/src/ui/history.js",
  "/src/ui/keypad.js",
  "/src/storage/db.js",
  "/src/storage/history.repo.js",
  "/src/storage/state.repo.js",
  "/src/pwa/sw-register.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // só mesma origem
  if (url.origin !== location.origin) return;

  // navegação: app shell
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match("/index.html");
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch {
        return cached;
      }
    })());
    return;
  }

  // assets: cache-first
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      // cachea só respostas ok
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      return cached || Response.error();
    }
  })());
});
