import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW for browser environment
export const worker = setupWorker(...handlers)

// Start the worker
export const startMockAPI = async () => {
    if (typeof window !== 'undefined') {
        await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
                url: '/mockServiceWorker.js'
            }
        })
        console.log('🎭 Mock API started')
    }
}
