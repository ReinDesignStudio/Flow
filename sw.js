const cacheName = "flow-v57";
const assets = [
  "./",
  "./index.html",
  "./styles.css?v=62",
  "./app.js?v=62",
  "./manifest.webmanifest?v=62",
  "./supabase-schema.sql",
  "./assets/flow-logo-gradient.png",
  "./icons/icon-192.svg?v=62",
  "./icons/icon-512.svg?v=62",
  "./icons/icon-192.png?v=62",
  "./icons/icon-512.png?v=62",
  "./icons/apple-touch-icon.png?v=62",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});

async function networkFirst(request) {
  const cache = await caches.open(cacheName);

  try {
    const fresh = await fetch(request, { cache: "no-store" });
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    return cached || caches.match("./index.html");
  }
}
