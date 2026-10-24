'use strict';
/* Phase 1 (غير مُفعَّل بعد): كاش للأصول الثابتة لتشغيل التطبيق دون اتصال.
   لا يُسجَّل من أي ملف حالياً؛ التسجيل خطوة مستقلة (يتطلب HTTPS + worker-src 'self' في CSP).
   عند رفع أي ملف غيّر رقم VER ليُحدَّث الكاش. */
const VER='almiqdad-v1';
const ASSETS=['./','index.html','manifest.json','css/style.css',
'js/config.js','js/sec.js','js/state.js',
'js/features/trash.js','js/features/backup.js','js/features/audit.js',
'js/views/home.js','js/views/sell.js','js/views/stock.js','js/views/par.js','js/views/exp.js','js/views/rep.js','js/views/set.js',
'js/boot.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VER).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
