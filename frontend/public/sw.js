/* Simple runtime service worker for offline access to the landing page
   - Caches requests as they are fetched (runtime caching)
   - Pre-caches the root ('/') and '/index.html' during install so the landing page works offline
   Note: This is a minimal implementation. For robust production offline support consider Workbox
         or an injectManifest build step so hashed assets are precached.
*/
const CACHE_NAME = 'pharmatrack-runtime-v1';
const PRECACHE_URLS = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // clean up old caches if any
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// Runtime caching strategy: try cache first, then network; cache successful network responses
self.addEventListener('fetch', (event) => {
  // only handle 'GET' requests
  if (event.request.method !== 'GET') return;

  // Skip non-http(s) schemes (chrome-extension, moz-extension, data, etc.) which
  // cannot be cached by the Cache API and will throw when using cache.put.
  try {
    const reqUrl = new URL(event.request.url);
    if (reqUrl.protocol !== 'http:' && reqUrl.protocol !== 'https:') {
      // Just forward the request to network and don't attempt to cache
      event.respondWith(fetch(event.request));
      return;
    }
  } catch (e) {
    // If URL parsing fails for any reason, bail out and do a network fetch.
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Only cache valid responses (status 200 and basic type)
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseClone = response.clone();
          // Be defensive: ignore cache.put errors (some browsers may reject certain requests)
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone).catch(() => {}));
          return response;
        })
        .catch(() => {
          // If offline and request is navigation, return cached index.html as fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // Otherwise let it fail (or could return a fallback asset)
          return new Response('', { status: 504, statusText: 'Gateway Timeout' });
        });
    })
  );
});
