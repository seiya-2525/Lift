/* 画面ファイルをキャッシュして、電波が弱い場所でも開けるようにする。通信できるときは常に最新を取りに行く（記録の保存先はFirestore側のオフライン機能） */
const V = 'kl-v1';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(V).then(c => {
    const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; });
    const cached = () => c.match(r, { ignoreSearch: true });
    return Promise.race([net, new Promise((_, rej) => setTimeout(rej, 3500))]).catch(() => cached().then(h => h || net));
  }));
});
