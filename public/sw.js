const CACHE_NAME = 'project-hub-v1'
const STATIC_CACHE = 'project-hub-static-v1'
const DYNAMIC_CACHE = 'project-hub-dynamic-v1'

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/explore',
    '/manifest.json',
    '/offline',
    // Add critical CSS and JS files
    '/_next/static/css/app/layout.css',
    '/_next/static/chunks/webpack.js',
    '/_next/static/chunks/main.js',
    // Add fonts
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /^https:\/\/api\.projecthub\.com\/projects/,
    /^https:\/\/api\.projecthub\.com\/auth\/me/,
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...')

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets')
                return cache.addAll(STATIC_ASSETS)
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static assets', error)
            })
    )

    // Skip waiting to activate immediately
    self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...')

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName)
                            return caches.delete(cacheName)
                        }
                    })
                )
            })
            .then(() => {
                // Take control of all clients immediately
                return self.clients.claim()
            })
    )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return
    }

    // Skip chrome-extension requests
    if (url.protocol === 'chrome-extension:') {
        return
    }

    // Handle different types of requests
    if (isStaticAsset(request)) {
        event.respondWith(cacheFirst(request))
    } else if (isAPIRequest(request)) {
        event.respondWith(networkFirst(request))
    } else if (isNavigationRequest(request)) {
        event.respondWith(navigationHandler(request))
    } else {
        event.respondWith(staleWhileRevalidate(request))
    }
})

// Cache strategies
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
            return cachedResponse
        }

        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE)
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    } catch (error) {
        console.error('Cache first strategy failed:', error)
        return new Response('Offline', { status: 503 })
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE)
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    } catch (error) {
        console.log('Network failed, trying cache:', error)
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
            return cachedResponse
        }

        // Return offline response for API requests
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'No network connection available'
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    }).catch(() => cachedResponse)

    return cachedResponse || fetchPromise
}

async function navigationHandler(request) {
    try {
        const networkResponse = await fetch(request)
        return networkResponse
    } catch (error) {
        console.log('Navigation request failed, serving offline page:', error)
        const cache = await caches.open(STATIC_CACHE)
        const offlinePage = await cache.match('/offline')
        return offlinePage || new Response('Offline', { status: 503 })
    }
}

// Helper functions
function isStaticAsset(request) {
    const url = new URL(request.url)
    return url.pathname.includes('/_next/static/') ||
        url.pathname.includes('/icons/') ||
        url.pathname.includes('/images/') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.woff')
}

function isAPIRequest(request) {
    const url = new URL(request.url)
    return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
        url.pathname.startsWith('/api/')
}

function isNavigationRequest(request) {
    return request.mode === 'navigate' ||
        (request.method === 'GET' && request.headers.get('accept').includes('text/html'))
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag)

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync())
    }
})

async function doBackgroundSync() {
    try {
        // Handle offline actions when back online
        const offlineActions = await getOfflineActions()

        for (const action of offlineActions) {
            try {
                await processOfflineAction(action)
                await removeOfflineAction(action.id)
            } catch (error) {
                console.error('Failed to process offline action:', error)
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error)
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received')

    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/icons/action-explore.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/action-close.png'
            }
        ]
    }

    event.waitUntil(
        self.registration.showNotification('Project Hub', options)
    )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked')

    event.notification.close()

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/explore')
        )
    } else if (event.action === 'close') {
        // Just close the notification
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        )
    }
})

// Utility functions for offline storage
async function getOfflineActions() {
    // Implementation would depend on your offline storage strategy
    return []
}

async function processOfflineAction(action) {
    // Process the offline action when back online
    console.log('Processing offline action:', action)
}

async function removeOfflineAction(actionId) {
    // Remove the processed action from offline storage
    console.log('Removing offline action:', actionId)
}
