const CACHE_NAME = "fmcielo-cache-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./fmcielo.ico",
  "./quinelasolicaria.mp3",
  "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
