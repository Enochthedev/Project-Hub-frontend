import { api, ApiResponse, ApiError } from './client'
import { User, TokenPair, LoginResponse } from './types'

export interface RegisterData {
    email: string
    password: string
    role: 'student' | 'supervisor'
    name: string
    specializations?: string[] // For supervisors
    skills?: string[] // For students
    interests?: string[] // For students
}

export interface LoginData {
    email: string
    password: string
    rememberMe?: boolean
}

export interface ForgotPasswordData {
    email: string
}

export interface ResetPasswordData {
    token: string
    newPassword: string
    confirmPassword: string
}

export interface VerifyEmailData {
    token: string
}

export interface RefreshTokenData {
    refreshToken: string
}

// Authentication API service
export const authApi = {
    // Register a new user
    register: async (data: RegisterData): Promise<ApiResponse<LoginResponse>> => {
        try {
            return await api.post('/auth/register', data)
        } catch (error) {
            if (error instanceof ApiError) {
                // Handle specific registration errors
                if (error.status === 409) {
                    throw new ApiError('Email already exists', error.status, 'EMAIL_EXISTS')
                }
                if (error.status === 400) {
                    throw new ApiError('Invalid registration data', error.status, 'INVALID_DATA')
                }
            }
            throw error
        }
    },

    // Login user
    login: async (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
        try {
            return await api.post('/auth/login', data)
        } catch (error) {
            if (error instanceof ApiError) {
                // Handle specific login errors
                if (error.status === 401) {
                    throw new ApiError('Invalid email or password', error.status, 'INVALID_CREDENTIALS')
                }
                if (error.status === 403) {
                    throw new ApiError('Account is disabled or not verified', error.status, 'ACCOUNT_DISABLED')
                }
                if (error.status === 429) {
                    throw new ApiError('Too many login attempts. Please try again later.', error.status, 'RATE_LIMITED')
                }
            }
            throw error
        }
    },

    // Refresh tokens
    refreshTokens: async (data: RefreshTokenData): Promise<ApiResponse<{ tokens: TokenPair }>> => {
        try {
            return await api.post('/auth/refresh', data, { skipAuth: true })
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                throw new ApiError('Refresh token expired or invalid', error.status, 'REFRESH_TOKEN_INVALID')
            }
            throw error
        }
    },

    // Logout user
    logout: async (refreshToken: string): Promise<ApiResponse<void>> => {
        return api.post('/auth/logout', { refreshToken })
    },

    // Logout from all devices
    logoutFromAllDevices: async (): Promise<ApiResponse<void>> => {
        return api.post('/auth/logout-all')
    },

    // Verify email
    verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
        try {
            return await api.get(`/auth/verify-email?token=${token}`, { skipAuth: true })
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    throw new ApiError('Invalid or expired verification token', error.status, 'INVALID_TOKEN')
                }
                if (error.status === 409) {
                    throw new ApiError('Email already verified', error.status, 'ALREADY_VERIFIED')
                }
            }
            throw error
        }
    },

    // Request password reset
    forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse<void>> => {
        try {
            return await api.post('/auth/forgot-password', data, { skipAuth: true })
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                // Don't reveal if email exists for security
                return { success: true, message: 'If the email exists, a reset link has been sent.' }
            }
            throw error
        }
    },

    // Reset password
    resetPassword: async (data: ResetPasswordData): Promise<ApiResponse<void>> => {
        try {
            return await api.post('/auth/reset-password', data, { skipAuth: true })
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    throw new ApiError('Invalid or expired reset token', error.status, 'INVALID_TOKEN')
                }
                if (error.status === 422) {
                    throw new ApiError('Password does not meet requirements', error.status, 'WEAK_PASSWORD')
                }
            }
            throw error
        }
    },

    // Resend email verification
    resendEmailVerification: async (email: string): Promise<ApiResponse<void>> => {
        try {
            return await api.post('/auth/resend-verification', { email }, { skipAuth: true })
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 409) {
                    throw new ApiError('Email already verified', error.status, 'ALREADY_VERIFIED')
                }
                if (error.status === 429) {
                    throw new ApiError('Please wait before requesting another verification email', error.status, 'RATE_LIMITED')
                }
            }
            throw error
        }
    },

    // Check email availability
    checkEmailAvailability: async (email: string): Promise<ApiResponse<{ available: boolean }>> => {
        return api.get(`/auth/check-email?email=${encodeURIComponent(email)}`, { skipAuth: true })
    },

    // Get current user info
    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        return api.get('/auth/me', { useCache: true, cacheTTL: 2 * 60 * 1000 }) // Cache for 2 minutes
    },

    // Update password
    updatePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
        return api.post('/auth/update-password', { currentPassword, newPassword })
    },
}

// Auth utility functions
export const authUtils = {
    // Store tokens in localStorage with expiry
    storeTokens: (tokens: TokenPair) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken)

            // Store token timestamp for expiry checking
            localStorage.setItem('tokenTimestamp', Date.now().toString())
        }
    },

    // Store user data in localStorage
    storeUser: (user: User) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user))
        }
    },

    // Get stored user data
    getStoredUser: (): User | null => {
        if (typeof window !== 'undefined') {
            try {
                const userData = localStorage.getItem('user')
                return userData ? JSON.parse(userData) : null
            } catch (error) {
                console.error('Error parsing stored user data:', error)
                localStorage.removeItem('user')
                return null
            }
        }
        return null
    },

    // Get stored tokens
    getStoredTokens: (): TokenPair | null => {
        if (typeof window !== 'undefined') {
            const accessToken = localStorage.getItem('accessToken')
            const refreshToken = localStorage.getItem('refreshToken')

            if (accessToken && refreshToken) {
                return { accessToken, refreshToken }
            }
        }
        return null
    },

    // Clear all auth data
    clearAuthData: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            localStorage.removeItem('tokenTimestamp')
        }
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        if (typeof window !== 'undefined') {
            const accessToken = localStorage.getItem('accessToken')
            const user = authUtils.getStoredUser()
            return !!(accessToken && user)
        }
        return false
    },

    // Check if tokens are likely expired (client-side estimation)
    areTokensExpired: (): boolean => {
        if (typeof window !== 'undefined') {
            const timestamp = localStorage.getItem('tokenTimestamp')
            if (!timestamp) return true

            // Assume tokens expire after 15 minutes (conservative estimate)
            const tokenAge = Date.now() - parseInt(timestamp)
            const fifteenMinutes = 15 * 60 * 1000

            return tokenAge > fifteenMinutes
        }
        return true
    },

    // Get user role
    getUserRole: (): string | null => {
        const user = authUtils.getStoredUser()
        return user?.role || null
    },

    // Check if user has specific role
    hasRole: (role: string): boolean => {
        const userRole = authUtils.getUserRole()
        return userRole === role
    },

    // Check if user is student
    isStudent: (): boolean => {
        return authUtils.hasRole('student')
    },

    // Check if user is supervisor
    isSupervisor: (): boolean => {
        return authUtils.hasRole('supervisor')
    },

    // Check if user is admin
    isAdmin: (): boolean => {
        return authUtils.hasRole('admin')
    },

    // Get user ID
    getUserId: (): string | null => {
        const user = authUtils.getStoredUser()
        return user?.id || null
    },

    // Get user email
    getUserEmail: (): string | null => {
        const user = authUtils.getStoredUser()
        return user?.email || null
    },

    // Check if email is verified
    isEmailVerified: (): boolean => {
        const user = authUtils.getStoredUser()
        return user?.isEmailVerified || false
    },

    // Validate password strength
    validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = []

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long')
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter')
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter')
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number')
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character')
        }

        return {
            isValid: errors.length === 0,
            errors,
        }
    },

    // Validate email format
    validateEmail: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    },
}