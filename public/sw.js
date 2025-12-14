// Service Worker for AZFanpage PWA
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `az-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `az-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `az-images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

const MAX_IMAGE_CACHE_SIZE = 100;
const MAX_DYNAMIC_CACHE_SIZE = 50;
const API_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Helper functions
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return request.destination === 'image' || 
    /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
}

function isFontRequest(request) {
  const url = new URL(request.url);
  return url.hostname === 'fonts.gstatic.com' || 
    url.hostname === 'fonts.googleapis.com' ||
    /\.(woff|woff2|ttf|otf|eot)$/i.test(url.pathname);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.hostname.includes('supabase') || 
    url.pathname.includes('wp-json') ||
    url.pathname.includes('/api/');
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css)$/i.test(url.pathname);
}

async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => {
              return name.startsWith('az-') && 
                name !== STATIC_CACHE && 
                name !== DYNAMIC_CACHE && 
                name !== IMAGE_CACHE;
            })
            .map(name => {
              console.log('🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;

  // Navigation requests - Network First with cache fallback
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || caches.match('/'));
        })
    );
    return;
  }

  // Font requests - Cache First (fonts never change)
  if (isFontRequest(request)) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          return fetch(request)
            .then(response => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then(cache => cache.put(request, responseClone));
              return response;
            });
        })
    );
    return;
  }

  // Image requests - Cache First with limit
  if (isImageRequest(request)) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          return fetch(request)
            .then(response => {
              const responseClone = response.clone();
              caches.open(IMAGE_CACHE)
                .then(cache => {
                  cache.put(request, responseClone);
                  limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
                });
              return response;
            })
            .catch(() => {
              // Return placeholder for failed images
              return caches.match('/placeholder.svg');
            });
        })
    );
    return;
  }

  // API requests - Network First with short cache
  if (isAPIRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(request, responseClone);
              limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets (JS/CSS) - Stale While Revalidate
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          const fetchPromise = fetch(request)
            .then(response => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then(cache => cache.put(request, responseClone));
              return response;
            });
          return cached || fetchPromise;
        })
    );
    return;
  }

  // Default - Network First
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📨 Push notification received:', event);
  
  let notificationData = {
    title: 'AZ Alkmaar',
    body: 'Je hebt een nieuwe notificatie',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'az-notification',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        { action: 'open', title: 'Bekijken' },
        { action: 'dismiss', title: 'Sluiten' }
      ]
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification);
  
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';
  
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(Promise.resolve());
  }
});
