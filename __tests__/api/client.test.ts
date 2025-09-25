import axios from 'axios'
import { api, ApiError, NetworkError, TimeoutError } from '@/lib/api/client'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock axios.create
const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
    },
}

mockedAxios.create.mockReturnValue(mockAxiosInstance as any)

describe('API Client', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Clear localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn(),
            },
            writable: true,
        })
    })

    describe('GET requests', () => {
        it('should make successful GET request', async () => {
            const mockResponse = {
                data: { success: true, data: { id: 1, name: 'Test' } },
                status: 200,
            }
            mockAxiosInstance.get.mockResolvedValue(mockResponse)

            const result = await api.get('/test')

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {})
            expect(result).toEqual(mockResponse.data)
        })

        it('should handle GET request with caching', async () => {
            const mockResponse = {
                data: { success: true, data: { id: 1, name: 'Test' } },
                status: 200,
            }
            mockAxiosInstance.get.mockResolvedValue(mockResponse)

            // First request
            const result1 = await api.get('/test', { useCache: true })
            expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)

            // Second request should use cache
            const result2 = await api.get('/test', { useCache: true })
            expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1) // Still 1, not 2
            expect(result1).toEqual(result2)
        })

        it('should handle network errors', async () => {
            mockAxiosInstance.get.mockRejectedValue({
                code: 'ECONNABORTED',
                message: 'timeout',
            })

            await expect(api.get('/test')).rejects.toThrow(TimeoutError)
        })

        it('should handle API errors', async () => {
            mockAxiosInstance.get.mockRejectedValue({
                response: {
                    status: 404,
                    data: { message: 'Not found' },
                },
            })

            await expect(api.get('/test')).rejects.toThrow(ApiError)
        })
    })

    describe('POST requests', () => {
        it('should make successful POST request', async () => {
            const mockResponse = {
                data: { success: true, data: { id: 1 } },
                status: 201,
            }
            mockAxiosInstance.post.mockResolvedValue(mockResponse)

            const result = await api.post('/test', { name: 'Test' })

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', { name: 'Test' }, {})
            expect(result).toEqual(mockResponse.data)
        })

        it('should handle POST errors', async () => {
            mockAxiosInstance.post.mockRejectedValue({
                response: {
                    status: 400,
                    data: { message: 'Bad request', errorCode: 'INVALID_DATA' },
                },
            })

            try {
                await api.post('/test', { invalid: 'data' })
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError)
                expect((error as ApiError).status).toBe(400)
                expect((error as ApiError).code).toBe('INVALID_DATA')
            }
        })
    })

    describe('Error handling', () => {
        it('should throw NetworkError for network issues', async () => {
            mockAxiosInstance.get.mockRejectedValue({
                message: 'Network Error',
            })

            await expect(api.get('/test')).rejects.toThrow(NetworkError)
        })

        it('should throw TimeoutError for timeout', async () => {
            mockAxiosInstance.get.mockRejectedValue({
                code: 'ECONNABORTED',
                message: 'timeout of 30000ms exceeded',
            })

            await expect(api.get('/test')).rejects.toThrow(TimeoutError)
        })

        it('should throw ApiError for HTTP errors', async () => {
            mockAxiosInstance.get.mockRejectedValue({
                response: {
                    status: 500,
                    data: { message: 'Internal server error' },
                },
            })

            await expect(api.get('/test')).rejects.toThrow(ApiError)
        })
    })

    describe('Utility methods', () => {
        it('should clear cache', () => {
            expect(() => api.clearCache()).not.toThrow()
        })

        it('should get cache stats', () => {
            const stats = api.getCacheStats()
            expect(stats).toHaveProperty('size')
            expect(stats).toHaveProperty('keys')
        })

        it('should check health', async () => {
            mockAxiosInstance.get.mockResolvedValue({ status: 200 })

            const isHealthy = await api.healthCheck()
            expect(isHealthy).toBe(true)
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health')
        })

        it('should handle health check failure', async () => {
            mockAxiosInstance.get.mockRejectedValue(new Error('Server down'))

            const isHealthy = await api.healthCheck()
            expect(isHealthy).toBe(false)
        })
    })

    describe('File upload', () => {
        it('should upload file with progress', async () => {
            const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
            const mockResponse = {
                data: { success: true, data: { url: 'http://example.com/file.txt' } },
                status: 200,
            }

            mockAxiosInstance.post.mockResolvedValue(mockResponse)

            const onProgress = jest.fn()
            const result = await api.uploadFile('/upload', mockFile, onProgress)

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/upload',
                expect.any(FormData),
                expect.objectContaining({
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: expect.any(Function),
                })
            )
            expect(result).toEqual(mockResponse.data)
        })
    })
})
