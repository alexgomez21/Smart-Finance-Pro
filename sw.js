/* =============================================
   SW.JS - Service Worker
   Smart Finance Personal - PWA
   ============================================= */

const CACHE_NAME = 'smart-finance-v1';
const BASE = '/Smart-Finance-Pro';

// Archivos que se guardan para usar sin internet
const ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/css/style.css`,
  `${BASE}/js/app.js`,
  `${BASE}/js/data.js`,
  `${BASE}/js/classifier.js`,
  `${BASE}/js/engine.js`,
  `${BASE}/js/ui.js`,
  `${BASE}/js/charts.js`,
  `${BASE}/js/demo.js`,
  `${BASE}/js/firebase.js`,
  `${BASE}/manifest.json`,
  `${BASE}/icons/icon-192.png`,
  `${BASE}/icons/icon-512.png`,
];

// Instalar: guardar archivos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('SW: error cacheando algunos archivos', err);
      });
    })
  );
  self.skipWaiting();
});

// Activar: limpiar cachés viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: primero intenta la red, si falla usa caché
self.addEventListener('fetch', (event) => {
  // No interceptar peticiones a Firebase (necesitan internet)
  if (event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar copia fresca en caché
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        // Sin internet: usar caché
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Si es navegación, devolver index.html
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE}/index.html`);
          }
        });
      })
  );
});
