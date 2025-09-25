import { authApi, authUtils, RegisterData, LoginData } from '@/lib/api/auth'
import { api, ApiError } from '@/lib/api/client'
import { User, TokenPair } from '@/lib/api/types'

// Mock the API client
jest.mock('@/lib/api/client', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn(),
    },
    ApiError: class MockApiError extends Error {
        constructor(message: string, public status?: number, public code?: string) {
            super(message)
            this.name = 'ApiError'
        }
    },
}))

const mockApi = api as jest.Mocked<typeof api>

const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    role: 'student',
    isEmailVerified: true,
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
}

const mockTokens: TokenPair = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
}

describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Mock localStorage
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

    describe('authApi', () => {
        describe('register', () => {
            it('should register successfully', async () => {
                const registerData: RegisterData = {
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'student',
                    name: 'Test User',
                }

                const mockResponse = {
                    success: true,
                    data: { user: mockUser, tokens: mockTokens },
                    message: 'Registration successful',
                }

                mockApi.post.mockResolvedValue(mockResponse)

                const result = await authApi.register(registerData)

                expect(mockApi.post).toHaveBeenCalledWith('/auth/register', registerData)
                expect(result).toEqual(mockResponse)
            })

            it('should handle email exists error', async () => {
                const registerData: RegisterData = {
                    email: 'existing@example.com',
                    password: 'password123',
                    role: 'student',
                    name: 'Test User',
                }

                mockApi.post.mockRejectedValue(new ApiError('Email already exists', 409))

                await expect(authApi.register(registerData)).rejects.toThrow('Email already exists')
            })
        })

        describe('login', () => {
            it('should login successfully', async () => {
                const loginData: LoginData = {
                    email: 'test@example.com',
                    password: 'password123',
                }

                const mockResponse = {
                    success: true,
                    data: { user: mockUser, tokens: mockTokens },
                    message: 'Login successful',
                }

                mockApi.post.mockResolvedValue(mockResponse)

                const result = await authApi.login(loginData)

                expect(mockApi.post).toHaveBeenCalledWith('/auth/login', loginData)
                expect(result).toEqual(mockResponse)
            })

            it('should handle invalid credentials', async () => {
                const loginData: LoginData = {
                    email: 'test@example.com',
                    password: 'wrongpassword',
                }

                mockApi.post.mockRejectedValue(new ApiError('Invalid credentials', 401))

                await expect(authApi.login(loginData)).rejects.toThrow('Invalid email or password')
            })

            it('should handle rate limiting', async () => {
                const loginData: LoginData = {
                    email: 'test@example.com',
                    password: 'password123',
                }

                mockApi.post.mockRejectedValue(new ApiError('Too many attempts', 429))

                await expect(authApi.login(loginData)).rejects.toThrow('Too many login attempts')
            })
        })

        describe('refreshTokens', () => {
            it('should refresh tokens successfully', async () => {
                const mockResponse = {
                    success: true,
                    data: { tokens: mockTokens },
                    message: 'Tokens refreshed',
                }

                mockApi.post.mockResolvedValue(mockResponse)

                const result = await authApi.refreshTokens({ refreshToken: 'old-refresh-token' })

                expect(mockApi.post).toHaveBeenCalledWith(
                    '/auth/refresh',
                    { refreshToken: 'old-refresh-token' },
                    { skipAuth: true }
                )
                expect(result).toEqual(mockResponse)
            })

            it('should handle invalid refresh token', async () => {
                mockApi.post.mockRejectedValue(new ApiError('Invalid token', 401))

                await expect(authApi.refreshTokens({ refreshToken: 'invalid-token' }))
                    .rejects.toThrow('Refresh token expired or invalid')
            })
        })

        describe('verifyEmail', () => {
            it('should verify email successfully', async () => {
                const mockResponse = {
                    success: true,
                    message: 'Email verified',
                }

                mockApi.get.mockResolvedValue(mockResponse)

                const result = await authApi.verifyEmail('verification-token')

                expect(mockApi.get).toHaveBeenCalledWith(
                    '/auth/verify-email?token=verification-token',
                    { skipAuth: true }
                )
                expect(result).toEqual(mockResponse)
            })

            it('should handle invalid verification token', async () => {
                mockApi.get.mockRejectedValue(new ApiError('Invalid token', 400))

                await expect(authApi.verifyEmail('invalid-token'))
                    .rejects.toThrow('Invalid or expired verification token')
            })
        })

        describe('forgotPassword', () => {
            it('should handle forgot password request', async () => {
                const mockResponse = {
                    success: true,
                    message: 'Reset email sent',
                }

                mockApi.post.mockResolvedValue(mockResponse)

                const result = await authApi.forgotPassword({ email: 'test@example.com' })

                expect(mockApi.post).toHaveBeenCalledWith(
                    '/auth/forgot-password',
                    { email: 'test@example.com' },
                    { skipAuth: true }
                )
                expect(result).toEqual(mockResponse)
            })

            it('should handle non-existent email gracefully', async () => {
                mockApi.post.mockRejectedValue(new ApiError('User not found', 404))

                const result = await authApi.forgotPassword({ email: 'nonexistent@example.com' })

                expect(result.success).toBe(true)
                expect(result.message).toContain('If the email exists')
            })
        })

        describe('checkEmailAvailability', () => {
            it('should check email availability', async () => {
                const mockResponse = {
                    success: true,
                    data: { available: true },
                }

                mockApi.get.mockResolvedValue(mockResponse)

                const result = await authApi.checkEmailAvailability('new@example.com')

                expect(mockApi.get).toHaveBeenCalledWith(
                    '/auth/check-email?email=new%40example.com',
                    { skipAuth: true }
                )
                expect(result).toEqual(mockResponse)
            })
        })

        describe('getCurrentUser', () => {
            it('should get current user with caching', async () => {
                const mockResponse = {
                    success: true,
                    data: mockUser,
                }

                mockApi.get.mockResolvedValue(mockResponse)

                const result = await authApi.getCurrentUser()

                expect(mockApi.get).toHaveBeenCalledWith(
                    '/auth/me',
                    { useCache: true, cacheTTL: 2 * 60 * 1000 }
                )
                expect(result).toEqual(mockResponse)
            })
        })
    })

    describe('authUtils', () => {
        describe('token management', () => {
            it('should store and retrieve tokens', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>

                authUtils.storeTokens(mockTokens)

                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', mockTokens.accessToken)
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken)
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tokenTimestamp', expect.any(String))
            })

            it('should retrieve stored tokens', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
                mockLocalStorage.getItem.mockImplementation((key) => {
                    if (key === 'accessToken') return mockTokens.accessToken
                    if (key === 'refreshToken') return mockTokens.refreshToken
                    return null
                })

                const tokens = authUtils.getStoredTokens()

                expect(tokens).toEqual(mockTokens)
            })

            it('should return null when no tokens stored', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
                mockLocalStorage.getItem.mockReturnValue(null)

                const tokens = authUtils.getStoredTokens()

                expect(tokens).toBeNull()
            })
        })

        describe('user management', () => {
            it('should store and retrieve user', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>

                authUtils.storeUser(mockUser)

                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
            })

            it('should retrieve stored user', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
                mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))

                const user = authUtils.getStoredUser()

                expect(user).toEqual(mockUser)
            })

            it('should handle corrupted user data', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
                mockLocalStorage.getItem.mockReturnValue('invalid json')

                const user = authUtils.getStoredUser()

                expect(user).toBeNull()
                expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
            })
        })

        describe('authentication checks', () => {
            it('should check if user is authenticated', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
                mockLocalStorage.getItem.mockImplementation((key) => {
                    if (key === 'accessToken') return 'token'
                    if (key === 'user') return JSON.stringify(mockUser)
                    return null
                })

                const isAuth = authUtils.isAuthenticated()

                expect(isAuth).toBe(true)
            })

            it('should return false when not authenticated', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
                mockLocalStorage.getItem.mockReturnValue(null)

                const isAuth = authUtils.isAuthenticated()

                expect(isAuth).toBe(false)
            })
        })

        describe('role checks', () => {
            beforeEach(() => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>
                mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
            })

            it('should check user role', () => {
                expect(authUtils.getUserRole()).toBe('student')
                expect(authUtils.hasRole('student')).toBe(true)
                expect(authUtils.hasRole('supervisor')).toBe(false)
                expect(authUtils.isStudent()).toBe(true)
                expect(authUtils.isSupervisor()).toBe(false)
                expect(authUtils.isAdmin()).toBe(false)
            })
        })

        describe('validation', () => {
            it('should validate password strength', () => {
                const weakPassword = authUtils.validatePassword('123')
                expect(weakPassword.isValid).toBe(false)
                expect(weakPassword.errors.length).toBeGreaterThan(0)

                const strongPassword = authUtils.validatePassword('StrongPass123!')
                expect(strongPassword.isValid).toBe(true)
                expect(strongPassword.errors.length).toBe(0)
            })

            it('should validate email format', () => {
                expect(authUtils.validateEmail('valid@example.com')).toBe(true)
                expect(authUtils.validateEmail('invalid-email')).toBe(false)
                expect(authUtils.validateEmail('missing@domain')).toBe(false)
            })
        })

        describe('token expiry', () => {
            it('should check if tokens are expired', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>

                // Set old timestamp (20 minutes ago)
                const oldTimestamp = (Date.now() - 20 * 60 * 1000).toString()
                mockLocalStorage.getItem.mockReturnValue(oldTimestamp)

                const isExpired = authUtils.areTokensExpired()
                expect(isExpired).toBe(true)
            })

            it('should return false for fresh tokens', () => {
                const mockLocalStorage = window.localStorage as jest.Mocked<Storage>

                // Set recent timestamp (5 minutes ago)
                const recentTimestamp = (Date.now() - 5 * 60 * 1000).toString()
                mockLocalStorage.getItem.mockReturnValue(recentTimestamp)

                const isExpired = authUtils.areTokensExpired()
                expect(isExpired).toBe(false)
            })
        })
    })
})
