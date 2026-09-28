const CACHE_NAME = 'race-to-the-role-v1';

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './card-styles.css',
  './js/game.js',
  './js/storage.js',
  './js/helpers.js',
  './js/settings.js',
  './js/accessibility.js',
  './js/firebase-config.js',
  './js/databaseManager.js',
  './js/classroom.js',
  './manifest.webmanifest',
  './favicon.svg',
  './logo.svg',
  './apple-touch-icon.png',
  './web-app-manifest-192x192.png',
  './web-app-manifest-512x512.png',
  './favicon-96x96.png',
  './data/game-data.json',
  './gfx/logo_black.png',
  './gfx/logo_black.svg',
  './gfx/logo_white.png',
  './gfx/logo_white.svg',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(APP_SHELL.map(function (url) {
        return fetch(url, { cache: 'no-cache' }).then(function (response) {
          if (response && response.status === 200) return cache.put(url, response);
          return null;
        }).catch(function () {
          return null;
        });
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});