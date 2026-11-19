const CACHE = 'brainless-v3-final';
const ASSETS = [
 "./",
 "index.html",
 "style.css",
 "app.js",
 "manifest.webmanifest",
 "apple-touch-icon.png",
 "black-sweatpants-back.webp",
 "black-sweatpants-front.webp",
 "chain-set.webp",
 "eyelet-belt.webp",
 "favicon.png",
 "hotwheels-tee-back.webp",
 "hotwheels-tee-front.webp",
 "icon-192.png",
 "icon-512.png",
 "icon-maskable-512.png",
 "logo-dark.png",
 "logo-light.png",
 "look-1.webp",
 "look-2.webp",
 "look-3.webp",
 "look-4.webp",
 "look-5.webp",
 "look-6.webp",
 "look-7.webp",
 "marlboro-layered-tee-back.webp",
 "marlboro-layered-tee-front.webp",
 "maroon-graphic-tee-back.webp",
 "maroon-graphic-tee-front.webp",
 "portugal-jersey-back.webp",
 "portugal-jersey-front.webp",
 "red-check-shirt-back.webp",
 "red-check-shirt-front.webp",
 "ring-band.webp",
 "ring-shield.webp",
 "teal-blazer-back.webp",
 "teal-blazer-front.webp",
 "teal-trousers-back.webp",
 "teal-trousers-front.webp",
 "wide-jeans-back.webp",
 "wide-jeans-front.webp"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const same = new URL(r.url).origin === location.origin;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => {
    const net = fetch(r).then(res => {
      if (same && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
      return res;
    }).catch(() => hit || (r.mode === 'navigate' ? caches.match('index.html') : undefined));
    return hit || net;
  }));
});
