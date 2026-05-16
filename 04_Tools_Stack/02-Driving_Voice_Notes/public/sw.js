// Minimal service worker — enables PWA installability on Android Chrome
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// Network-first: always fetch fresh, no caching (personal local tool)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
