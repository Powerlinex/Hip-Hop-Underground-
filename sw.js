/* Network-first for the game page so a new build replaces a cached one. */
const VERSION = "v9-live-20261112b";
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("message", event => {
  if (event.data === "skip") self.skipWaiting();
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const page = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html") || url.pathname.endsWith("sw.js");
  if (!page) return;
  event.respondWith(
    fetch(req, { cache: "no-store" }).catch(() => caches.match(req))
  );
});
