import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { User, TokenPair } from '@/lib/api/types'
import { authApi, authUtils, RegisterData } from '@/lib/api/auth'

interface AuthState {
    // State
    user: User | null
    tokens: TokenPair | null
    isAuthenticated: boolean
    isLoading: boolean
    isInitializing: boolean
    error: string | null
    sessionExpiry: number | null
    lastActivity: number | null

    // Actions
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => Promise<void>
    logoutFromAllDevices: () => Promise<void>
    refreshTokens: () => Promise<void>
    verifyEmail: (token: string) => Promise<void>
    forgotPassword: (email: string) => Promise<void>
    resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<void>
    resendEmailVerification: (email: string) => Promise<void>
    clearError: () => void
    setUser: (user: User) => void
    setTokens: (tokens: TokenPair) => void
    initialize: () => void
    updateLastActivity: () => void
    checkSessionExpiry: () => boolean
    scheduleTokenRefresh: () => void
}

let refreshTimer: NodeJS.Timeout | null = null

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                user: null,
                tokens: null,
                isAuthenticated: false,
                isLoading: false,
                isInitializing: false,
                error: null,
                sessionExpiry: null,
                lastActivity: Date.now(),

                // Actions
                login: async (email: string, password: string, rememberMe = false) => {
                    set({ isLoading: true, error: null })

                    try {
                        const response = await authApi.login({ email, password, rememberMe })
                        const { user, tokens } = response.data!

                        // Store tokens and user data
                        authUtils.storeTokens(tokens)
                        authUtils.storeUser(user)

                        // Calculate session expiry (assuming 15 minutes for access token)
                        const sessionExpiry = Date.now() + (15 * 60 * 1000)

                        set({
                            user,
                            tokens,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                            sessionExpiry,
                            lastActivity: Date.now(),
                        })

                        // Schedule token refresh
                        get().scheduleTokenRefresh()
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Login failed'
                        set({
                            isLoading: false,
                            error: errorMessage,
                            isAuthenticated: false,
                        })
                        throw error
                    }
                },

                register: async (data: RegisterData) => {
                    set({ isLoading: true, error: null })

                    try {
                        const response = await authApi.register(data)
                        const { user, tokens } = response.data!

                        // Store tokens and user data
                        authUtils.storeTokens(tokens)
                        authUtils.storeUser(user)

                        set({
                            user,
                            tokens,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        })
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Registration failed'
                        set({
                            isLoading: false,
                            error: errorMessage,
                            isAuthenticated: false,
                        })
                        throw error
                    }
                },

                logout: async () => {
                    set({ isLoading: true })

                    try {
                        const { tokens } = get()
                        if (tokens?.refreshToken) {
                            await authApi.logout(tokens.refreshToken)
                        }
                    } catch (error) {
                        // Continue with logout even if API call fails
                        console.error('Logout API call failed:', error)
                    } finally {
                        // Clear all auth data
                        authUtils.clearAuthData()
                        set({
                            user: null,
                            tokens: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                        })
                    }
                },

                logoutFromAllDevices: async () => {
                    set({ isLoading: true })

                    try {
                        await authApi.logoutFromAllDevices()
                    } catch (error) {
                        console.error('Logout from all devices failed:', error)
                    } finally {
                        // Clear all auth data
                        authUtils.clearAuthData()
                        set({
                            user: null,
                            tokens: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                        })
                    }
                },

                refreshTokens: async () => {
                    const { tokens } = get()
                    if (!tokens?.refreshToken) {
                        throw new Error('No refresh token available')
                    }

                    try {
                        const response = await authApi.refreshTokens({ refreshToken: tokens.refreshToken })
                        const newTokens = response.data!.tokens

                        // Store new tokens
                        authUtils.storeTokens(newTokens)

                        set({
                            tokens: newTokens,
                            error: null,
                        })
                    } catch (error: any) {
                        // If refresh fails, logout user
                        authUtils.clearAuthData()
                        set({
                            user: null,
                            tokens: null,
                            isAuthenticated: false,
                            error: 'Session expired. Please login again.',
                        })
                        throw error
                    }
                },

                verifyEmail: async (token: string) => {
                    set({ isLoading: true, error: null })

                    try {
                        await authApi.verifyEmail(token)

                        // Update user's email verification status
                        const { user } = get()
                        if (user) {
                            const updatedUser = { ...user, isEmailVerified: true }
                            authUtils.storeUser(updatedUser)
                            set({ user: updatedUser })
                        }

                        set({ isLoading: false })
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Email verification failed'
                        set({
                            isLoading: false,
                            error: errorMessage,
                        })
                        throw error
                    }
                },

                forgotPassword: async (email: string) => {
                    set({ isLoading: true, error: null })

                    try {
                        await authApi.forgotPassword({ email })
                        set({ isLoading: false })
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Password reset request failed'
                        set({
                            isLoading: false,
                            error: errorMessage,
                        })
                        throw error
                    }
                },

                resetPassword: async (token: string, newPassword: string, confirmPassword: string) => {
                    set({ isLoading: true, error: null })

                    try {
                        await authApi.resetPassword({ token, newPassword, confirmPassword })
                        set({ isLoading: false })
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Password reset failed'
                        set({
                            isLoading: false,
                            error: errorMessage,
                        })
                        throw error
                    }
                },

                resendEmailVerification: async (email: string) => {
                    set({ isLoading: true, error: null })

                    try {
                        await authApi.resendEmailVerification(email)
                        set({ isLoading: false })
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Failed to resend verification email'
                        set({
                            isLoading: false,
                            error: errorMessage,
                        })
                        throw error
                    }
                },

                clearError: () => {
                    set({ error: null })
                },

                setUser: (user: User) => {
                    authUtils.storeUser(user)
                    set({ user, isAuthenticated: true })
                },

                setTokens: (tokens: TokenPair) => {
                    authUtils.storeTokens(tokens)
                    set({ tokens })
                },

                initialize: () => {
                    set({ isInitializing: true })

                    // Initialize auth state from localStorage
                    const storedUser = authUtils.getStoredUser()
                    const storedTokens = authUtils.getStoredTokens()

                    if (storedUser && storedTokens) {
                        const sessionExpiry = Date.now() + (15 * 60 * 1000)

                        set({
                            user: storedUser,
                            tokens: storedTokens,
                            isAuthenticated: true,
                            sessionExpiry,
                            lastActivity: Date.now(),
                            isInitializing: false,
                        })

                        // Schedule token refresh
                        get().scheduleTokenRefresh()
                    } else {
                        set({ isInitializing: false })
                    }
                },

                updateLastActivity: () => {
                    set({ lastActivity: Date.now() })
                },

                checkSessionExpiry: () => {
                    const { sessionExpiry } = get()
                    if (!sessionExpiry) return false
                    return Date.now() > sessionExpiry
                },

                scheduleTokenRefresh: () => {
                    // Clear existing timer
                    if (refreshTimer) {
                        clearTimeout(refreshTimer)
                    }

                    // Schedule refresh 2 minutes before expiry
                    const { sessionExpiry } = get()
                    if (sessionExpiry) {
                        const refreshTime = sessionExpiry - Date.now() - (2 * 60 * 1000)
                        if (refreshTime > 0) {
                            refreshTimer = setTimeout(async () => {
                                try {
                                    await get().refreshTokens()
                                } catch (error) {
                                    console.error('Automatic token refresh failed:', error)
                                }
                            }, refreshTime)
                        }
                    }
                },
            }),
            {
                name: 'auth-store',
                partialize: (state) => ({
                    user: state.user,
                    tokens: state.tokens,
                    isAuthenticated: state.isAuthenticated,
                    sessionExpiry: state.sessionExpiry,
                    lastActivity: state.lastActivity,
                }),
            }
        ),
        {
            name: 'auth-store',
        }
    )
)