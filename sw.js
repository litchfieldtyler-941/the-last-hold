// The Last Hold's service worker: the game kept on the phone, so it starts quickly and plays without a signal. The
// page and the small files come from the network first and fall back to the copy kept here; the art packs, whose
// names carry a hash of what is in them, come from the copy kept here first.
const PAGE = 'lh-page-v1', ART = 'lh-art-v1';
// the page itself is kept at once, so the game opens without a signal from the first visit on
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(PAGE).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'])).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/art/packs/')) {
    e.respondWith(caches.open(ART).then(async c => (await c.match(r)) || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; })));
    return;
  }
  e.respondWith(fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(PAGE).then(c => c.put(r, copy)); } return res; }).catch(() => caches.match(r, { ignoreSearch: true })));
});
