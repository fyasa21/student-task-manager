const CACHE_NAME = 'actask-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles/variables.css',
    '/styles/main.css',
    '/src/app.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response if found
            if (cachedResponse) {
                return cachedResponse;
            }
            // Otherwise, fetch from network
            return fetch(event.request).catch(() => {
                // If network fails and request is for an HTML page, we could return a fallback offline page
                // For now, Actask works mostly client-side
                console.error('[Service Worker] Fetch failed; returning offline page instead.', event.request.url);
            });
        })
    );
});
