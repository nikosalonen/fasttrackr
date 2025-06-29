const CACHE_NAME = 'fasttrackr-v3';
const STATIC_CACHE = 'fasttrackr-static-v3';
const DYNAMIC_CACHE = 'fasttrackr-dynamic-v3';

// Files that should always be fetched fresh (network-first)
const NETWORK_FIRST_URLS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx'
];

// Static assets that can be cached longer
const urlsToCache = [
  '/manifest.json',
  '/icons/manifest-icon-192.maskable.png',
  '/icons/manifest-icon-512.maskable.png'
];

// Install event - cache resources and force immediate activation
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event - v3');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All files cached, forcing immediate activation');
        return self.skipWaiting(); // Force immediate activation
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event - v3');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Cache cleanup complete and clients claimed');
      // Notify all clients about the update
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            message: 'Service Worker updated successfully!'
          });
        });
      });
    })
  );
});

// Fetch event - use different strategies based on URL
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Network-first strategy for critical app files
  if (NETWORK_FIRST_URLS.some(path => url.pathname === path || url.pathname.startsWith('/src/'))) {
    event.respondWith(networkFirstStrategy(event.request));
  }
  // Static assets - cache-first with network fallback
  else if (event.request.destination === 'image' || event.request.url.includes('/icons/')) {
    event.respondWith(cacheFirstStrategy(event.request));
  }
  // Default to stale-while-revalidate for everything else
  else {
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  }
});

// Network-first strategy: Always try network first, fallback to cache
async function networkFirstStrategy(request) {
  try {
    console.log('Service Worker: Network-first for', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache the fresh response
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Cache-first strategy: Check cache first, fallback to network
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('Service Worker: Serving from cache', request.url);
    return cachedResponse;
  }
  
  console.log('Service Worker: Fetching from network', request.url);
  const networkResponse = await fetch(request);
  
  if (networkResponse && networkResponse.status === 200) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale-while-revalidate: Serve from cache, update in background
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await caches.match(request);
  
  // Always try to fetch fresh version in background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    console.log('Service Worker: Background fetch failed for', request.url);
  });
  
  // Return cached version immediately if available, otherwise wait for network
  if (cachedResponse) {
    console.log('Service Worker: Serving stale content for', request.url);
    return cachedResponse;
  }
  
  console.log('Service Worker: No cache, waiting for network', request.url);
  return fetchPromise;
}

// Background sync for data synchronization
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync-fasts') {
    event.waitUntil(syncFastData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Your fast is complete!',
    icon: '/icons/manifest-icon-192.maskable.png',
    badge: '/icons/manifest-icon-192.maskable.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/manifest-icon-192.maskable.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/manifest-icon-192.maskable.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('FastTrackr', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for background sync
async function syncFastData() {
  try {
    console.log('Service Worker: Syncing fast data');
    // Implementation would go here for server sync
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// Enhanced message handling
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({version: CACHE_NAME});
  }
  
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    // Clear all caches and force reload
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({type: 'CACHES_CLEARED'});
    });
  }
});

// Periodic update check
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-check') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    // This would check for app updates
    console.log('Service Worker: Checking for updates...');
  } catch (error) {
    console.error('Service Worker: Update check failed', error);
  }
} 