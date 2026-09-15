const CACHE_NAME = 'lev-schedule-v1';
const ASSETS_TO_CACHE = [
  './',
  './fix songs_4.html',
  './manifest.json',
  './icon-192.png'
];

// התקנת ה-Service Worker ושמירת הקבצים במטמון
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// שליפת נתונים מהמטמון כשאין אינטרנט
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
