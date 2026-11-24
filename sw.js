/* YouthBox service worker: always try the network first so updates arrive,
   and fall back to the last saved copy when offline. */
const CACHE = 'youthbox-v3';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(r.url, { cache: 'no-store' });
      if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); }
      return res;
    } catch (err) {
      return (await caches.match(r)) || (await caches.match('index.html')) || Response.error();
    }
  })());
});
