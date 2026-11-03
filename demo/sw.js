/* sw.js — the installable app's offline cache (tools/build_app.py fills in the version and the file list).
   Everything the app needs is a handful of files (the page carries its libraries and fonts inside), so all of them are cached
   on install and served from the cache, with or without a network. A new build has a new CACHE name: it installs beside the
   running one and waits until the page asks it to take over (the "Reload" notice), then deletes the old cache. */
const CACHE = 'retirement-app-Demo_3.13-bcf155a277';
const FILES = ["index.html", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];  // the page is cached once, as index.html, and answers every navigation
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('retirement-app-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;  // the AI Advisor's calls go straight to the network
  if (req.mode === 'navigate') {  // the app's page, whatever path or query opened it
    e.respondWith(caches.match('index.html', { cacheName: CACHE }).then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, { cacheName: CACHE, ignoreSearch: true }).then(r => r || fetch(req)));
});
