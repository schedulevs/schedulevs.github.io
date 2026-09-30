// ⚠️ בכל פעם שאתה מעדכן קובץ כלשהו באפליקציה (index.html וכו'),
// תעלה את המספר הזה (v4 → v5 → v6...). זה היוצר את הגרסה החדשה.
const CACHE_VERSION = 'v6';
const CACHE_NAME = 'lev-schedule-' + CACHE_VERSION;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* ---------- INSTALL ---------- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting()) // אל תחכה שכל הטאבים הישנים ייסגרו - תפוס שליטה מיד
  );
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('lev-schedule-') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // תפוס שליטה על כל הטאבים הפתוחים מיד, בלי לחכות לרענון ידני
  );
});

/* ---------- FETCH ---------- */
self.addEventListener('fetch', event => {
  const req = event.request;

  // לא נוגעים בשום דבר שהוא לא GET או לא מהדומיין שלנו (Firebase, Google Auth, גופנים...)
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  const isHTML = req.mode === 'navigate' || req.url.endsWith('index.html');

  if (isHTML) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return response;
        })
        .catch(() => caches.match(req))
    );
  } else {
    event.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
