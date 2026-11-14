/* Keena AI — service worker khusus /chat/.
   Hanya meng-cache app shell (halaman, manifest, ikon). API AI dan CDN
   tidak disentuh — selalu lewat jaringan. */
const CACHE_NAME = 'keena-ai-chat-v1';
const APP_SHELL = [
  '/chat/',
  '/chat/index.html',
  '/chat/manifest.webmanifest',
  '/chat/icons/icon-192.png',
  '/chat/icons/icon-512.png',
  '/chat/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // CDN & API: biarkan jaringan
  if (!url.pathname.startsWith('/chat/')) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
