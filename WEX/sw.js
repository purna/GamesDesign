/**
 * Service worker for Race to the Role.
 *
 * Strategy notes:
 * - Code, styles and game data are NETWORK-FIRST. This project is edited constantly
 *   and a cache-first worker silently serves stale files, which is very hard to
 *   diagnose from the page. Falling back to cache keeps the game playable offline.
 * - Images are CACHE-FIRST: they change rarely and there is no benefit in a
 *   network round-trip.
 * - Bump CACHE_NAME whenever the shell changes. Old caches are deleted on activate.
 */

const CACHE_NAME = 'race-to-the-role-v5';
const DATA_CACHE = 'race-to-the-role-data-v5';

// Loaded with the page. Keep this list accurate: a missing entry is precached as a
// silent no-op, so a stale list fails quietly rather than erroring.
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './card-styles.css',
  './css/tutorials.css',
  './js/tutorialConfig.js',
  './js/tooltip.js',
  './js/game.js',
  './js/ai.js',
  './js/tutorialSystem.js',
  './js/settings.js',
  './js/accessibility.js',
  './favicon.svg',
  './gfx/logo_black.png',
  './gfx/logo_white.png',
];

// Fetched at runtime per industry. Precached so a first load works offline.
const INDUSTRIES = [
  'animation',
  'cyber-security',
  'esports',
  'film-making',
  'game-design',
  'games-development',
  'illustration',
  'web-design',
];

const DATA_SHELL = INDUSTRIES.map((id) => `./data/industries/${id}/game-data.json`);

function cacheAll(cacheName, urls) {
  return caches.open(cacheName).then((cache) =>
    Promise.all(
      urls.map((url) =>
        fetch(new Request(url, { cache: 'no-cache' }))
          .then((response) => {
            if (response && response.status === 200) return cache.put(url, response);
            return null;
          })
          .catch(() => null)
      )
    )
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      cacheAll(CACHE_NAME, APP_SHELL),
      cacheAll(DATA_CACHE, DATA_SHELL),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== DATA_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Network-first: try the network, fall back to the cache when offline.
function networkFirst(request, cacheName, fallbackUrl) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const copy = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((cached) => {
        if (cached) return cached;
        if (fallbackUrl) return caches.match(fallbackUrl);
        return new Response('Offline and not cached.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
    );
}

// Cache-first: serve from cache, refresh in the background.
function cacheFirst(request, cacheName) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(cacheName).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Font Awesome comes from a CDN; leave it entirely alone.
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME, './index.html'));
    return;
  }

  const isData = url.pathname.includes('/data/industries/');
  const isAsset = /\.(css|js)$/.test(url.pathname);
  const isImage = /\.(png|svg|jpg|jpeg|gif|webp|ico)$/.test(url.pathname);

  if (isData) event.respondWith(networkFirst(request, DATA_CACHE));
  else if (isAsset) event.respondWith(networkFirst(request, CACHE_NAME));
  else if (isImage) event.respondWith(cacheFirst(request, CACHE_NAME));
});
