/* Keena AI — service worker khusus /chat/.
   API AI dan CDN tidak disentuh — selalu lewat jaringan.
   HALAMAN (index.html): network-first — setiap buka selalu ambil kode
   terbaru dari server, cache hanya jadi cadangan saat offline. Ini
   penting karena halaman sering diperbarui: cache-first membuat HP
   menjalankan kode lama berhari-hari (bug yang bikin perbaikan
   thinking-level tidak terasa).
   ASET STATIS (manifest, ikon): stale-while-revalidate — tampil
   instan dari cache, diperbarui di latar belakang. */
const CACHE_NAME = 'keena-ai-chat-v2';
const APP_SHELL = [
  '/chat/',
  '/chat/index.html',
  '/chat/manifest.webmanifest',
  '/chat/icons/icon-192.png',
  '/chat/icons/icon-512.png',
  '/chat/icons/icon-maskable-512.png'
];

function isHtmlShell(url) {
  return url.pathname === '/chat/' || url.pathname === '/chat/index.html';
}

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

  // Halaman: network-first (kode terbaru), cache hanya saat offline.
  if (isHtmlShell(url)) {
    event.respondWith(
      fetch(event.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Aset statis: stale-while-revalidate.
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
