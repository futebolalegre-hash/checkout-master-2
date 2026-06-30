const CACHE = 'checkout-master-v18';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// インストール時に必要なファイルをキャッシュ（保存）する
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除して最新状態を保つ
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// ネットワークファースト戦略
// 通信できる時は常に最新版を取得し、機内モード（通信不可）の時は保存したキャッシュから起動する
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(res => {
      const resClone = res.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, resClone));
      return res;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
