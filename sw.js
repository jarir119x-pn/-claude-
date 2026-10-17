'use strict';

// يخزّن ملفات التطبيق كلها عند أول فتح، فيعمل بعده دون إنترنت.
// عند كل إصدار جديد: ارفع رقم CACHE_VERSION، وأضف إلى FILES كل ملف جديد.
const CACHE_VERSION = 5;
const CACHE = `hifz-alshir-v${CACHE_VERSION}`;

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'design/tokens.css',
  'design/bundle.css',
  'styles/zakharif.css',
  'styles/app.css',
  'src/arabic.js',
  'src/model.js',
  'src/db.js',
  'src/backup.js',
  'src/parse.js',
  'src/poems.js',
  'src/srs.js',
  'src/textimport.js',
  'src/entry.js',
  'src/library.js',
  'src/review.js',
  'src/settings.js',
  'src/app.js',
  'icons/shamsa-192.png',
  'icons/shamsa-512.png',
  'icons/shamsa-maskable-512.png',
  'design/fonts/Kufam-400.woff2',
  'design/fonts/Kufam-500.woff2',
  'design/fonts/Kufam-600.woff2',
  'design/fonts/Kufam-700.woff2',
  'design/fonts/ReemKufi-400.woff2',
  'design/fonts/ReemKufi-500.woff2',
  'design/fonts/ReemKufi-600.woff2',
  'design/fonts/ReemKufi-700.woff2',
  'design/fonts/Rabat.otf',
  'design/ornaments/muqarnas-band.svg',
  'design/ornaments/shamsa.svg',
  'design/ornaments/drill-holes.svg',
  'design/ornaments/izar-crest.svg',
  'design/ornaments/dafira-band.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

// يحذف مخازن الإصدارات القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// من المخزن أولًا، ثم من الشبكة لما لم يُخزَّن
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || fetch(event.request))
  );
});
