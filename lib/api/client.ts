import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"
import { mockApi } from "../mocks/mock-api"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
const REQUEST_TIMEOUT = 30000 // 30 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

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

// API Client configuration
interface APIClientConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface RequestOptions extends AxiosRequestConfig {
  useCache?: boolean
  cacheTTL?: number
  skipAuth?: boolean
}

class APIClient {
  private axiosInstance: AxiosInstance
  private cache = new ApiCache()
  private config: APIClientConfig
  private useMockAPI: boolean

  constructor(config: APIClientConfig = {}) {
    this.config = {
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      retries: MAX_RETRIES,
      retryDelay: RETRY_DELAY,
      ...config,
    }

    this.useMockAPI = USE_MOCK_API

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token and handle caching
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add request timestamp for debugging
        config.metadata = { startTime: Date.now() }

        // Add request ID for tracking
        config.headers["X-Request-ID"] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Add auth token if available and not skipped
        if (!config.skipAuth) {
          const token = this.getAuthToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        return config
      },
      (error) => {
        console.error("Request interceptor error:", error)
        return Promise.reject(error)
      },
    )

    // Response interceptor to handle token refresh, caching, and retries
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response time for debugging
        const startTime = response.config.metadata?.startTime
        if (startTime) {
          const duration = Date.now() - startTime
          console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
        }

        // Cache GET requests if they have cache headers or are explicitly cacheable
        if (response.config.method === "get" && response.status === 200) {
          const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`
          const cacheControl = response.headers["cache-control"]

          if (cacheControl && cacheControl.includes("max-age")) {
            const maxAge = Number.parseInt(cacheControl.match(/max-age=(\d+)/)?.[1] || "0") * 1000
            if (maxAge > 0) {
              this.cache.set(cacheKey, response.data, maxAge)
            }
          }
        }

        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Try to refresh token
            await this.refreshToken()
            const token = this.getAuthToken()
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return this.axiosInstance(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthError()
            return Promise.reject(refreshError)
          }
        }

        // Log error details
        console.error("API Error:", {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        })

        return Promise.reject(this.handleError(error))
      },
    )
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken")
    }
    return null
  }

  private async refreshToken() {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null

    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await this.axiosInstance.post(
      "/auth/refresh",
      {
        refreshToken,
      },
      { skipAuth: true },
    )

    if (response.data.tokens) {
      localStorage.setItem("accessToken", response.data.tokens.accessToken)
      localStorage.setItem("refreshToken", response.data.tokens.refreshToken)
    }
  }

  private handleAuthError() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
  }

  private handleError(error: any): Error {
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return new TimeoutError("Request timeout")
    }

    if (!error.response) {
      return new NetworkError("Network connection failed")
    }

    const { status, data } = error.response
    const message = data?.message || error.message || "An error occurred"
    const code = data?.errorCode || data?.code

    return new ApiError(message, status, code, data)
  }

  private getCacheKey(url: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : ""
    return `${url}${paramString}`
  }

  async get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    const { useCache, cacheTTL, ...axiosOptions } = options

    // Check cache first for GET requests
    if (useCache) {
      const cacheKey = this.getCacheKey(url, axiosOptions.params)
      const cached = this.cache.get<T>(cacheKey)
      if (cached) {
        console.log("Cache hit:", cacheKey)
        return cached
      }
    }

    try {
      let response: any

      if (this.useMockAPI) {
        response = { data: await mockApi.get(url, options) }
      } else {
        response = await this.axiosInstance.get<T>(url, axiosOptions)
      }

      // Cache the response if requested
      if (useCache) {
        const cacheKey = this.getCacheKey(url, axiosOptions.params)
        this.cache.set(cacheKey, response.data, cacheTTL)
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    try {
      let response: any

      if (this.useMockAPI) {
        response = { data: await mockApi.post(url, data, options) }
      } else {
        response = await this.axiosInstance.post<T>(url, data, options)
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    try {
      let response: any

      if (this.useMockAPI) {
        response = { data: await mockApi.put(url, data, options) }
      } else {
        response = await this.axiosInstance.put<T>(url, data, options)
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    try {
      let response: any

      if (this.useMockAPI) {
        response = { data: await mockApi.patch(url, data, options) }
      } else {
        response = await this.axiosInstance.patch<T>(url, data, options)
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    try {
      let response: any

      if (this.useMockAPI) {
        response = { data: await mockApi.delete(url, options) }
      } else {
        response = await this.axiosInstance.delete<T>(url, options)
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    options: RequestOptions = {},
  ): Promise<T> {
    const formData = new FormData()
    formData.append("file", file)

    try {
      let response: any

      if (this.useMockAPI) {
        response = { data: await mockApi.uploadFile(url, file, onProgress) }
      } else {
        response = await this.axiosInstance.post<T>(url, formData, {
          ...options,
          headers: {
            "Content-Type": "multipart/form-data",
            ...options.headers,
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(progress)
            }
          },
        })
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): { size: number; keys: string[] } {
    return this.cache.getStats()
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (this.useMockAPI) {
        return await mockApi.healthCheck()
      } else {
        await this.axiosInstance.get("/health")
        return true
      }
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const api = new APIClient()
