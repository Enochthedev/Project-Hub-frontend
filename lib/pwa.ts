"use client"

// PWA utilities and helpers
export class PWAManager {
    private static instance: PWAManager
    private deferredPrompt: any = null
    private isInstalled = false
    private isOnline = true

    private constructor() {
        if (typeof window !== 'undefined') {
            this.initializePWA()
        }
    }

    static getInstance(): PWAManager {
        if (!PWAManager.instance) {
            PWAManager.instance = new PWAManager()
        }
        return PWAManager.instance
    }

    private initializePWA() {
        // Register service worker
        this.registerServiceWorker()

        // Listen for install prompt
        this.setupInstallPrompt()

        // Monitor online/offline status
        this.setupNetworkMonitoring()

        // Check if already installed
        this.checkInstallStatus()

        // Setup background sync
        this.setupBackgroundSync()
    }

    private async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                })

                console.log('Service Worker registered successfully:', registration)

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content is available
                                this.notifyUpdate()
                            }
                        })
                    }
                })

                return registration
            } catch (error) {
                console.error('Service Worker registration failed:', error)
            }
        }
    }

    private setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault()
            // Store the event so it can be triggered later
            this.deferredPrompt = e

            // Notify that app can be installed
            this.dispatchEvent('pwa-installable', { canInstall: true })
        })

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed')
            this.isInstalled = true
            this.deferredPrompt = null
            this.dispatchEvent('pwa-installed', { installed: true })
        })
    }

    private setupNetworkMonitoring() {
        const updateOnlineStatus = () => {
            const wasOnline = this.isOnline
            this.isOnline = navigator.onLine

            if (wasOnline !== this.isOnline) {
                this.dispatchEvent('pwa-network-change', {
                    online: this.isOnline,
                    wasOnline
                })

                if (this.isOnline) {
                    // Trigger background sync when back online
                    this.triggerBackgroundSync()
                }
            }
        }

        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)

        // Initial check
        updateOnlineStatus()
    }

    private checkInstallStatus() {
        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true) {
            this.isInstalled = true
        }
    }

    private setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // Background sync is supported
            console.log('Background sync is supported')
        }
    }

    private notifyUpdate() {
        this.dispatchEvent('pwa-update-available', {
            message: 'A new version is available. Refresh to update.'
        })
    }

    private dispatchEvent(eventName: string, detail: any) {
        const event = new CustomEvent(eventName, { detail })
        window.dispatchEvent(event)
    }

    // Public methods
    async installApp(): Promise<boolean> {
        if (!this.deferredPrompt) {
            return false
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt()

            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt')
                return true
            } else {
                console.log('User dismissed the install prompt')
                return false
            }
        } catch (error) {
            console.error('Error during app installation:', error)
            return false
        } finally {
            this.deferredPrompt = null
        }
    }

    canInstall(): boolean {
        return !!this.deferredPrompt
    }

    isAppInstalled(): boolean {
        return this.isInstalled
    }

    isAppOnline(): boolean {
        return this.isOnline
    }

    async updateApp(): Promise<void> {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration()
            if (registration?.waiting) {
                // Tell the waiting service worker to skip waiting and become active
                registration.waiting.postMessage({ type: 'SKIP_WAITING' })

                // Reload the page to use the new service worker
                window.location.reload()
            }
        }
    }

    async triggerBackgroundSync(): Promise<void> {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            try {
                const registration = await navigator.serviceWorker.ready
                await registration.sync.register('background-sync')
                console.log('Background sync registered')
            } catch (error) {
                console.error('Background sync registration failed:', error)
            }
        }
    }

    // Offline storage helpers
    async storeOfflineAction(action: any): Promise<void> {
        if ('indexedDB' in window) {
            // Store action for later processing when online
            const db = await this.openOfflineDB()
            const transaction = db.transaction(['actions'], 'readwrite')
            const store = transaction.objectStore('actions')
            await store.add({
                ...action,
                timestamp: Date.now(),
                id: crypto.randomUUID()
            })
        }
    }

    private async openOfflineDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ProjectHubOffline', 1)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                if (!db.objectStoreNames.contains('actions')) {
                    const store = db.createObjectStore('actions', { keyPath: 'id' })
                    store.createIndex('timestamp', 'timestamp', { unique: false })
                }

                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
                    cacheStore.createIndex('expiry', 'expiry', { unique: false })
                }
            }
        })
    }

    // Push notification helpers
    async requestNotificationPermission(): Promise<boolean> {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission()
            return permission === 'granted'
        }
        return false
    }

    async subscribeToPushNotifications(): Promise<PushSubscription | null> {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(
                        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
                    )
                })
                return subscription
            } catch (error) {
                console.error('Push subscription failed:', error)
                return null
            }
        }
        return null
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    }
}

// React hook for PWA functionality
export function usePWA() {
    const pwa = PWAManager.getInstance()

    return {
        canInstall: pwa.canInstall(),
        isInstalled: pwa.isAppInstalled(),
        isOnline: pwa.isAppOnline(),
        installApp: () => pwa.installApp(),
        updateApp: () => pwa.updateApp(),
        requestNotifications: () => pwa.requestNotificationPermission(),
        subscribeToPush: () => pwa.subscribeToPushNotifications(),
    }
}