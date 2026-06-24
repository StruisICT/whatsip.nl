// Service Worker for whatsip.nl
// Provides offline support for static pages (browser info, headers, DNS test)
const CACHE_NAME = 'whatsip-v1';
const OFFLINE_CAPABLE = [
  '/',
  '/en/',
  '/nl/',
  '/en/browser',
  '/nl/browser',
  '/en/headers',
  '/nl/headers',
  '/en/dns',
  '/nl/dns',
  '/style.css',
  '/app.js',
  '/i18n.js',
  '/favicon.svg',
];

// Install - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_CAPABLE);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fall back to cache for offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls that need network
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/speedtest') ||
      event.request.url.includes('/ip')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache
        return caches.match(event.request);
      })
  );
});
