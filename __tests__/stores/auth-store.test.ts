import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { authApi, authUtils } from '@/lib/api/auth'

// Mock the API and utils
jest.mock('@/lib/api/auth', () => ({
    authApi: {
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        logoutFromAllDevices: jest.fn(),
        refreshTokens: jest.fn(),
        verifyEmail: jest.fn(),
        forgotPassword: jest.fn(),
        resetPassword: jest.fn(),
        resendEmailVerification: jest.fn(),
    },
    authUtils: {
        storeTokens: jest.fn(),
        storeUser: jest.fn(),
        getStoredUser: jest.fn(),
        getStoredTokens: jest.fn(),
        clearAuthData: jest.fn(),
    },
}))

const mockAuthApi = authApi as jest.Mocked<typeof authApi>
const mockAuthUtils = authUtils as jest.Mocked<typeof authUtils>

describe('AuthStore', () => {
    beforeEach(() => {
        // Reset the store state
        useAuthStore.setState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            isInitializing: false,
            error: null,
            sessionExpiry: null,
            lastActivity: Date.now(),
        })

        // Clear all mocks
        jest.clearAllMocks()
    })

    describe('login', () => {
        it('should login successfully', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                role: 'student' as const,
                isEmailVerified: true,
                isActive: true,
                createdAt: '2023-01-01',
                updatedAt: '2023-01-01',
            }

            const mockTokens = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            }

            mockAuthApi.login.mockResolvedValue({
                data: { user: mockUser, tokens: mockTokens },
                success: true,
                message: 'Login successful',
                timestamp: '2023-01-01',
            })

            const { result } = renderHook(() => useAuthStore())

            await act(async () => {
                await result.current.login('test@example.com', 'password')
            })

            expect(result.current.user).toEqual(mockUser)
            expect(result.current.tokens).toEqual(mockTokens)
            expect(result.current.isAuthenticated).toBe(true)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
            expect(mockAuthUtils.storeTokens).toHaveBeenCalledWith(mockTokens)
            expect(mockAuthUtils.storeUser).toHaveBeenCalledWith(mockUser)
        })

        it('should handle login error', async () => {
            const errorMessage = 'Invalid credentials'
            mockAuthApi.login.mockRejectedValue({
                response: { data: { message: errorMessage } }
            })

            const { result } = renderHook(() => useAuthStore())

            await act(async () => {
                try {
                    await result.current.login('test@example.com', 'wrong-password')
                } catch (error) {
                    // Expected to throw
                }
            })

            expect(result.current.user).toBeNull()
            expect(result.current.tokens).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe(errorMessage)
        })
    })

    describe('logout', () => {
        it('should logout successfully', async () => {
            // Set initial authenticated state
            useAuthStore.setState({
                user: { id: '1' } as any,
                tokens: { accessToken: 'token', refreshToken: 'refresh' },
                isAuthenticated: true,
            })

            mockAuthApi.logout.mockResolvedValue({
                success: true,
                message: 'Logged out',
                timestamp: '2023-01-01',
            })

            const { result } = renderHook(() => useAuthStore())

            await act(async () => {
                await result.current.logout()
            })

            expect(result.current.user).toBeNull()
            expect(result.current.tokens).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeNull()
            expect(mockAuthUtils.clearAuthData).toHaveBeenCalled()
        })
    })

    describe('initialize', () => {
        it('should initialize with stored user and tokens', () => {
            const mockUser = { id: '1', email: 'test@example.com' } as any
            const mockTokens = { accessToken: 'token', refreshToken: 'refresh' }

            mockAuthUtils.getStoredUser.mockReturnValue(mockUser)
            mockAuthUtils.getStoredTokens.mockReturnValue(mockTokens)

            const { result } = renderHook(() => useAuthStore())

            act(() => {
                result.current.initialize()
            })

            expect(result.current.user).toEqual(mockUser)
            expect(result.current.tokens).toEqual(mockTokens)
            expect(result.current.isAuthenticated).toBe(true)
            expect(result.current.isInitializing).toBe(false)
        })

        it('should initialize without stored data', () => {
            mockAuthUtils.getStoredUser.mockReturnValue(null)
            mockAuthUtils.getStoredTokens.mockReturnValue(null)

            const { result } = renderHook(() => useAuthStore())

            act(() => {
                result.current.initialize()
            })

            expect(result.current.user).toBeNull()
            expect(result.current.tokens).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
            expect(result.current.isInitializing).toBe(false)
        })
    })

    describe('session management', () => {
        it('should update last activity', () => {
            const { result } = renderHook(() => useAuthStore())
            const initialActivity = result.current.lastActivity

            act(() => {
                result.current.updateLastActivity()
            })

            expect(result.current.lastActivity).toBeGreaterThan(initialActivity!)
        })

        it('should check session expiry', () => {
            const { result } = renderHook(() => useAuthStore())

            // Set expired session
            useAuthStore.setState({
                sessionExpiry: Date.now() - 1000, // 1 second ago
            })

            const isExpired = result.current.checkSessionExpiry()
            expect(isExpired).toBe(true)

            // Set valid session
            useAuthStore.setState({
                sessionExpiry: Date.now() + 1000, // 1 second from now
            })

            const isValid = result.current.checkSessionExpiry()
            expect(isValid).toBe(false)
        })
    })

    describe('error handling', () => {
        it('should clear error', () => {
            useAuthStore.setState({ error: 'Some error' })

            const { result } = renderHook(() => useAuthStore())

            act(() => {
                result.current.clearError()
            })

            expect(result.current.error).toBeNull()
        })
    })
})