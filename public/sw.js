const CACHE_NAME = "keysmith-v2.7.4";
const scopedUrl = (path) => new URL(path, self.registration.scope).toString();
const CORE_ASSETS = [
  scopedUrl("./"),
  scopedUrl("index.html"),
  scopedUrl("manifest.webmanifest"),
  scopedUrl("keysmith.svg"),
  scopedUrl("wasm/keysmith_web.js"),
  scopedUrl("wasm/keysmith_web_bg.wasm"),
];
const NAVIGATION_FALLBACK = scopedUrl("index.html");

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          const shell = await caches.match(NAVIGATION_FALLBACK);
          if (shell) return shell;
        }
        throw new Error("Offline resource is not cached");
      }),
  );
});
