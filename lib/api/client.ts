import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"
import { mockApi } from "../mocks/mock-api"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
const REQUEST_TIMEOUT = 30000 // 30 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errorCode?: string
  timestamp?: string
  path?: string
}

// Cache configuration
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class ApiCache {
  private cache = new Map<string, CacheEntry>()

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

const apiCache = new ApiCache()

// Custom error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class NetworkError extends Error {
  constructor(message = "Network connection failed") {
    super(message)
    this.name = "NetworkError"
  }
}

export class TimeoutError extends Error {
  constructor(message = "Request timeout") {
    super(message)
    this.name = "TimeoutError"
  }
}

// Enhanced request configuration
export interface EnhancedRequestConfig extends AxiosRequestConfig {
  useCache?: boolean
  cacheTTL?: number
  skipAuth?: boolean
}

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: USE_MOCK_API ? "/api" : API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token and handle caching
apiClient.interceptors.request.use(
  (config) => {
    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() }

    // Get token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return config
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh, caching, and retries
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time for debugging
    const startTime = response.config.metadata?.startTime
    if (startTime) {
      const duration = Date.now() - startTime
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
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
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens

          // Update tokens in localStorage
          localStorage.setItem("accessToken", accessToken)
          localStorage.setItem("refreshToken", newRefreshToken)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")

          // Only redirect if not already on login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login"
          }
        }
        return Promise.reject(refreshError)
      }
    }

    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    })

    return Promise.reject(error)
  },
)

// Enhanced error handler
const handleApiError = (error: AxiosError): never => {
  if (error.code === "ECONNABORTED") {
    throw new TimeoutError("Request timed out")
  }

  if (!error.response) {
    throw new NetworkError("Network error - please check your connection")
  }

  const { status, data } = error.response
  const errorMessage = (data as any)?.message || error.message || "An error occurred"
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
        console.log("Cache hit:", cacheKey)
        return cached
      }
    }

    try {
      let result: ApiResponse<T>

      if (USE_MOCK_API) {
        result = (await mockApi.get(url, axiosConfig)) as ApiResponse<T>
      } else {
        const response = await apiClient.get(url, axiosConfig)
        result = response.data
      }

      // Cache successful GET responses
      if (useCache && result.success) {
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
      let result: ApiResponse<T>

      if (USE_MOCK_API) {
        result = (await mockApi.post(url, data, config)) as ApiResponse<T>
      } else {
        const response = await apiClient.post(url, data, config)
        result = response.data
      }

      // Invalidate related cache entries on successful POST
      if (result.success) {
        apiCache.clear()
      }

      return result
    } catch (error) {
      handleApiError(error as AxiosError)
    }
  },

  put: async <T = any>(url: string, data?: any, config: EnhancedRequestConfig = {}): Promise<ApiResponse<T>> => {
    try {
      let result: ApiResponse<T>

      if (USE_MOCK_API) {
        result = (await mockApi.put(url, data, config)) as ApiResponse<T>
      } else {
        const response = await apiClient.put(url, data, config)
        result = response.data
      }

      // Invalidate cache on successful PUT
      if (result.success) {
        apiCache.clear()
      }

      return result
    } catch (error) {
      handleApiError(error as AxiosError)
    }
  },

  patch: async <T = any>(url: string, data?: any, config: EnhancedRequestConfig = {}): Promise<ApiResponse<T>> => {
    try {
      let result: ApiResponse<T>

      if (USE_MOCK_API) {
        result = (await mockApi.patch(url, data, config)) as ApiResponse<T>
      } else {
        const response = await apiClient.patch(url, data, config)
        result = response.data
      }

      // Invalidate cache on successful PATCH
      if (result.success) {
        apiCache.clear()
      }

      return result
    } catch (error) {
      handleApiError(error as AxiosError)
    }
  },

  delete: async <T = any>(url: string, config: EnhancedRequestConfig = {}): Promise<ApiResponse<T>> => {
    try {
      let result: ApiResponse<T>

      if (USE_MOCK_API) {
        result = (await mockApi.delete(url, config)) as ApiResponse<T>
      } else {
        const response = await apiClient.delete(url, config)
        result = response.data
      }

      // Invalidate cache on successful DELETE
      if (result.success) {
        apiCache.clear()
      }

      return result
    } catch (error) {
      handleApiError(error as AxiosError)
    }
  },

  // Utility methods
  clearCache: () => apiCache.clear(),

  getCacheStats: () => apiCache.getStats(),

  // Health check endpoint
  healthCheck: async (): Promise<boolean> => {
    try {
      if (USE_MOCK_API) {
        return await mockApi.healthCheck()
      } else {
        await apiClient.get("/health")
        return true
      }
    } catch {
      return false
    }
  },

  // Upload file with progress
  uploadFile: async (url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> => {
    try {
      if (USE_MOCK_API) {
        return await mockApi.uploadFile(url, file, onProgress)
      } else {
        const formData = new FormData()
        formData.append("file", file)

        const response = await apiClient.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(progress)
            }
          },
        })

        return response.data
      }
    } catch (error) {
      handleApiError(error as AxiosError)
    }
  },
}

// Export the enhanced API client and cache
export { apiCache }
export default apiClient
