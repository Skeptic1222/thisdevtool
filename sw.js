/**
 * DevToolbox — Service Worker
 * Cache-first for static assets, network-first for HTML navigation
 */
var CACHE_NAME = 'thisdevtool-v8';
var STATIC_ASSETS = [
  '/css/style.css',
  '/js/core.js',
  '/js/ads.js',
  '/js/feedback.js',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/images/logo-light.svg',
  '/images/logo-dark.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  // Only handle GET requests — POST/PUT/etc. cannot be cached
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // HTML navigation: network-first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function () {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Static assets: stale-while-revalidate (serve cached, update in background)
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        var fetchPromise = fetch(event.request).then(function (response) {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      });
    })
  );
});
