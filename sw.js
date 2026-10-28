// ぽんぽこ温泉宿：一度開いたら電波がなくても起動できるように、ページと音源を保存する
const CACHE='ponpoko-v8';
// 最初に保存するのはページとタイトル・遊び中の曲だけ（約2MB）。ほかの曲は一度流れたときに保存する
const FILES=['./','manifest.webmanifest','icon-192.png','icon-512.png','bgm/hanagoyomi2-96.mp3','bgm/michikusa-96.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  // ページは新しい版を優先（つながらなければ保存した版）、音源と画像は保存した版を優先
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./',cp));return res}).catch(()=>caches.match('./')));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.status===200&&new URL(r.url).origin===location.origin){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp)).catch(()=>{})}return res})));
});
