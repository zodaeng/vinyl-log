/* Vinyl Log: 화면 파일을 기기에 보관해 오프라인에서도 열리게 합니다. 데이터 요청은 건드리지 않습니다. */
var CACHE = 'vinyl-log-shell-v5';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  var font = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (e.request.method !== 'GET' || (url.origin !== self.location.origin && !font)) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(e.request, { ignoreSearch: url.origin === self.location.origin }).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
