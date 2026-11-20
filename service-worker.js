const CACHE_VERSION = 'meteolive-v2.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/weather-themes.css',
  '/js/app.js',
  '/js/state.js',
  '/js/api.js',
  '/js/weather-engine.js',
  '/js/audio-engine.js',
  '/js/chart.js',
  '/js/pwa-manager.js',
  '/js/components/search.js',
  '/js/components/hero.js',
  '/js/components/hourly.js',
  '/js/components/daily.js',
  '/js/components/details.js',
  '/js/components/favorites.js',
  '/js/components/time-machine.js',
  '/js/components/insights.js',
  '/js/components/world-explorer.js',
  '/js/components/comparison.js',
  '/js/utils/weather-codes.js',
  '/js/utils/formatters.js',
  '/js/utils/icons.js',
  '/assets/icons/favicon.svg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-maskable.png',
  '/assets/icons/apple-touch-icon.png'
];

// Install Event: Precaches static application shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Use cache.addAll with individual catch to avoid failure if one optional asset is missing
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[Service Worker] Pre-cache failed for ${asset}:`, err);
          })
        )
      );
    })
  );
});

// Activate Event: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== API_CACHE) {
            console.log('[Service Worker] Removing stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // 1. API Requests (Open-Meteo forecast and geocoding)
  if (url.hostname.includes('open-meteo.com')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed: attempt to serve from API cache with offline marker
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            // Clone and decorate response with custom header to notify client of offline cache
            const headers = new Headers(cachedResponse.headers);
            headers.set('X-Aether-Offline-Cached', 'true');
            return new Response(await cachedResponse.blob(), {
              status: cachedResponse.status,
              statusText: cachedResponse.statusText,
              headers
            });
          }
          // If no cache, return meaningful offline JSON response
          return new Response(
            JSON.stringify({
              error: true,
              offline: true,
              message: 'You are currently offline and no cached weather data is available for this location.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            }
          );
        })
    );
    return;
  }

  // 2. Static Assets: Stale-While-Revalidate with Cache Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // For navigation HTML requests when offline and cache miss, fallback to root index.html
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for messages from client (e.g. skipWaiting trigger)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
