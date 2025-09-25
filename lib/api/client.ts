import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
const REQUEST_TIMEOUT = 30000 // 30 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Cache configuration
interface CacheEntry<T> {
    data: T
    timestamp: number
    expiresAt: number
}

class ApiCache {
    private cache = new Map<string, CacheEntry<any>>()
    private defaultTTL = 5 * 60 * 1000 // 5 minutes

    set<T>(key: string, data: T, ttl?: number): void {
        const now = Date.now()
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + (ttl || this.defaultTTL),
        })
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key)
        if (!entry) return null

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key)
            return null
        }

        return entry.data
    }

    delete(key: string): void {
        this.cache.delete(key)
    }

    clear(): void {
        this.cache.clear()
    }

    has(key: string): boolean {
        const entry = this.cache.get(key)
        if (!entry) return false

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key)
            return false
        }

        return true
    }
}

const apiCache = new ApiCache()

// Retry configuration
interface RetryConfig {
    retries: number
    retryDelay: number
    retryCondition?: (error: AxiosError) => boolean
}

const defaultRetryConfig: RetryConfig = {
    retries: MAX_RETRIES,
    retryDelay: RETRY_DELAY,
    retryCondition: (error: AxiosError) => {
        // Retry on network errors or 5xx server errors
        return !error.response || (error.response.status >= 500 && error.response.status < 600)
    },
}

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: USE_MOCK_API ? '/api' : API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token and handle caching
apiClient.interceptors.request.use(
    (config) => {
        // Add request timestamp for debugging
        config.metadata = { startTime: Date.now() }

        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        return config
    },
    (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
    }
)

// Retry function
const retryRequest = async (error: AxiosError, config: RetryConfig = defaultRetryConfig): Promise<AxiosResponse> => {
    const { retries, retryDelay, retryCondition } = config
    const originalRequest = error.config as any

    if (!originalRequest || originalRequest._retryCount >= retries) {
        return Promise.reject(error)
    }

    if (retryCondition && !retryCondition(error)) {
        return Promise.reject(error)
    }

    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

    // Exponential backoff
    const delay = retryDelay * Math.pow(2, originalRequest._retryCount - 1)

    await new Promise(resolve => setTimeout(resolve, delay))

    console.log(`Retrying request (attempt ${originalRequest._retryCount}/${retries}):`, originalRequest.url)

    return apiClient(originalRequest)
}

// Response interceptor to handle token refresh, caching, and retries
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response time for debugging
        const startTime = response.config.metadata?.startTime
        if (startTime) {
            const duration = Date.now() - startTime
            console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
        }

        // Cache GET requests if they have cache headers or are explicitly cacheable
        if (response.config.method === 'get' && response.status === 200) {
            const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`
            const cacheControl = response.headers['cache-control']

            if (cacheControl && cacheControl.includes('max-age')) {
                const maxAge = parseInt(cacheControl.match(/max-age=(\d+)/)?.[1] || '0') * 1000
                if (maxAge > 0) {
                    apiCache.set(cacheKey, response.data, maxAge)
                }
            }
        }

        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Handle 401 Unauthorized - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken')
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    })

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens

                    // Update tokens in localStorage
                    localStorage.setItem('accessToken', accessToken)
                    localStorage.setItem('refreshToken', newRefreshToken)

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`
                    return apiClient(originalRequest)
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('user')

                    // Dispatch custom event for auth store to handle
                    window.dispatchEvent(new CustomEvent('auth:logout'))

                    // Only redirect if not already on login page
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login'
                    }
                }
                return Promise.reject(refreshError)
            }
        }

        // Handle retryable errors
        if (defaultRetryConfig.retryCondition?.(error)) {
            try {
                return await retryRequest(error)
            } catch (retryError) {
                // All retries failed, log and reject
                console.error('All retry attempts failed:', retryError)
                return Promise.reject(retryError)
            }
        }

        // Log error details
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        })

        return Promise.reject(error)
    }
)

// API response wrapper
export interface ApiResponse<T = any> {
    success: boolean
    message: string
    data?: T
    error?: string
    errorCode?: string
    timestamp?: string
    path?: string
}

// Enhanced request configuration
export interface EnhancedRequestConfig extends AxiosRequestConfig {
    useCache?: boolean
    cacheTTL?: number
    retryConfig?: Partial<RetryConfig>
    skipAuth?: boolean
}

// Error types for better error handling
export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string,
        public data?: any
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Network error occurred') {
        super(message)
        this.name = 'NetworkError'
    }
}

export class TimeoutError extends Error {
    constructor(message: string = 'Request timeout') {
        super(message)
        this.name = 'TimeoutError'
    }
}

// Enhanced error handler
const handleApiError = (error: AxiosError): never => {
    if (error.code === 'ECONNABORTED') {
        throw new TimeoutError('Request timed out')
    }

    if (!error.response) {
        throw new NetworkError('Network error - please check your connection')
    }

    const { status, data } = error.response
    const errorMessage = (data as any)?.message || error.message || 'An error occurred'
    const errorCode = (data as any)?.errorCode || (data as any)?.code

    throw new ApiError(errorMessage, status, errorCode, data)
}

// Generic API methods with enhanced features
export const api = {
    get: async <T = any>(url: string, config: EnhancedRequestConfig = {}): Promise<ApiResponse<T>> => {
        const { useCache = false, cacheTTL, ...axiosConfig } = config

        // Check cache first for GET requests
        if (useCache) {
            const cacheKey = `${url}?${JSON.stringify(axiosConfig.params || {})}`
            const cached = apiCache.get<ApiResponse<T>>(cacheKey)
            if (cached) {
                console.log('Cache hit:', cacheKey)
                return cached
            }
        }

        try {
            const response = await apiClient.get(url, axiosConfig)
            const result = response.data

            // Cache successful GET responses
            if (useCache && response.status === 200) {
                const cacheKey = `${url}?${JSON.stringify(axiosConfig.params || {})}`
                apiCache.set(cacheKey, result, cacheTTL)
            }

            return result
        } catch (error) {
            handleApiError(error as AxiosError)
        }
    },

    post: async <T = any>(url: string, data?: any, config: EnhancedRequestConfig = {}): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.post(url, data, config)

            // Invalidate related cache entries on successful POST
            if (response.status >= 200 && response.status < 300) {
                // Simple cache invalidation - clear all cache for now
                // In a real app, you'd implement more sophisticated cache invalidation
                apiCache.clear()
            }

            return response.data
        } catch (error) {
            handleApiError(error as AxiosError)
        }
    },

    put: async <T = any>(url: string, data?: any, config: EnhancedRequestConfig = {}): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.put(url, data, config)

            // Invalidate cache on successful PUT
            if (response.status >= 200 && response.status < 300) {
                apiCache.clear()
            }

            return response.data
        } catch (error) {
            handleApiError(error as AxiosError)
        }
    },

    patch: async <T = any>(url: string, data?: any, config: EnhancedRequestConfig = {}): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.patch(url, data, config)

            // Invalidate cache on successful PATCH
            if (response.status >= 200 && response.status < 300) {
                apiCache.clear()
            }

            return response.data
        } catch (error) {
            handleApiError(error as AxiosError)
        }
    },

    delete: async <T = any>(url: string, config: EnhancedRequestConfig = {}): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.delete(url, config)

            // Invalidate cache on successful DELETE
            if (response.status >= 200 && response.status < 300) {
                apiCache.clear()
            }

            return response.data
        } catch (error) {
            handleApiError(error as AxiosError)
        }
    },

    // Utility methods
    clearCache: () => apiCache.clear(),

    getCacheStats: () => ({
        size: apiCache['cache'].size,
        keys: Array.from(apiCache['cache'].keys()),
    }),

    // Health check endpoint
    healthCheck: async (): Promise<boolean> => {
        try {
            await apiClient.get('/health')
            return true
        } catch {
            return false
        }
    },

    // Upload file with progress
    uploadFile: async (
        url: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<ApiResponse<any>> => {
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await apiClient.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        onProgress(progress)
                    }
                },
            })

            return response.data
        } catch (error) {
            handleApiError(error as AxiosError)
        }
    },
}

// Export the enhanced API client and cache
export { apiCache }
export default apiClient
