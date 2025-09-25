import { api, ApiResponse } from './client'
import { User, StudentProfile, SupervisorProfile } from './types'

// Profile update data interfaces
export interface UpdateStudentProfileData {
    name: string
    skills: string[]
    interests: string[]
    preferredSpecializations: string[]
    currentYear?: number | null
    gpa?: number | null
    bio?: string
    profilePicture?: string | null
}

export interface UpdateSupervisorProfileData {
    name: string
    title: string
    department: string
    specializations: string[]
    researchInterests: string[]
    bio?: string
    profilePicture?: string | null
    contactEmail?: string | null
    officeLocation?: string | null
    maxStudents: number
    isAvailable: boolean
}

export interface ChangePasswordData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export interface ProfilePictureUploadResponse {
    url: string
    filename: string
}

// Profile API service
export const profileApi = {
    // Get current user profile
    getProfile: async (): Promise<ApiResponse<User>> => {
        return api.get('/profile')
    },

    // Update student profile
    updateStudentProfile: async (data: UpdateStudentProfileData): Promise<ApiResponse<StudentProfile>> => {
        return api.put('/profile/student', data)
    },

    // Update supervisor profile
    updateSupervisorProfile: async (data: UpdateSupervisorProfileData): Promise<ApiResponse<SupervisorProfile>> => {
        return api.put('/profile/supervisor', data)
    },

    // Upload profile picture
    uploadProfilePicture: async (file: File): Promise<ApiResponse<ProfilePictureUploadResponse>> => {
        const formData = new FormData()
        formData.append('profilePicture', file)

        return api.post('/profile/upload-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    // Delete profile picture
    deleteProfilePicture: async (): Promise<ApiResponse<void>> => {
        return api.delete('/profile/picture')
    },

    // Change password
    changePassword: async (data: ChangePasswordData): Promise<ApiResponse<void>> => {
        return api.post('/profile/change-password', data)
    },

    // Get profile completion status
    getProfileCompletion: async (): Promise<ApiResponse<{
        isComplete: boolean
        completionPercentage: number
        missingFields: string[]
    }>> => {
        return api.get('/profile/completion')
    },

    // Delete account
    deleteAccount: async (password: string): Promise<ApiResponse<void>> => {
        return api.delete('/profile/account', {
            data: { password }
        })
    },
}

// Profile utility functions
export const profileUtils = {
    // Calculate profile completion percentage
    calculateStudentProfileCompletion: (profile: StudentProfile): number => {
        const requiredFields = ['name', 'skills', 'interests', 'preferredSpecializations']
        const optionalFields = ['currentYear', 'gpa', 'bio', 'profilePicture']

        let completedRequired = 0
        let completedOptional = 0

        // Check required fields
        requiredFields.forEach(field => {
            const value = profile[field as keyof StudentProfile]
            if (Array.isArray(value) ? value.length > 0 : value) {
                completedRequired++
            }
        })

        // Check optional fields
        optionalFields.forEach(field => {
            const value = profile[field as keyof StudentProfile]
            if (value !== null && value !== undefined && value !== '') {
                completedOptional++
            }
        })

        // Required fields are worth 70%, optional fields 30%
        const requiredPercentage = (completedRequired / requiredFields.length) * 70
        const optionalPercentage = (completedOptional / optionalFields.length) * 30

        return Math.round(requiredPercentage + optionalPercentage)
    },

    // Calculate supervisor profile completion percentage
    calculateSupervisorProfileCompletion: (profile: SupervisorProfile): number => {
        const requiredFields = ['name', 'title', 'department', 'specializations', 'researchInterests']
        const optionalFields = ['bio', 'profilePicture', 'contactEmail', 'officeLocation']

        let completedRequired = 0
        let completedOptional = 0

        // Check required fields
        requiredFields.forEach(field => {
            const value = profile[field as keyof SupervisorProfile]
            if (Array.isArray(value) ? value.length > 0 : value) {
                completedRequired++
            }
        })

        // Check optional fields
        optionalFields.forEach(field => {
            const value = profile[field as keyof SupervisorProfile]
            if (value !== null && value !== undefined && value !== '') {
                completedOptional++
            }
        })

        // Required fields are worth 80%, optional fields 20%
        const requiredPercentage = (completedRequired / requiredFields.length) * 80
        const optionalPercentage = (completedOptional / optionalFields.length) * 20

        return Math.round(requiredPercentage + optionalPercentage)
    },

    // Get missing required fields for student profile
    getStudentProfileMissingFields: (profile: StudentProfile): string[] => {
        const requiredFields = [
            { key: 'name', label: 'Full Name' },
            { key: 'skills', label: 'Skills' },
            { key: 'interests', label: 'Interests' },
            { key: 'preferredSpecializations', label: 'Preferred Specializations' },
        ]

        return requiredFields
            .filter(field => {
                const value = profile[field.key as keyof StudentProfile]
                return Array.isArray(value) ? value.length === 0 : !value
            })
            .map(field => field.label)
    },

    // Get missing required fields for supervisor profile
    getSupervisorProfileMissingFields: (profile: SupervisorProfile): string[] => {
        const requiredFields = [
            { key: 'name', label: 'Full Name' },
            { key: 'title', label: 'Title' },
            { key: 'department', label: 'Department' },
            { key: 'specializations', label: 'Specializations' },
            { key: 'researchInterests', label: 'Research Interests' },
        ]

        return requiredFields
            .filter(field => {
                const value = profile[field.key as keyof SupervisorProfile]
                return Array.isArray(value) ? value.length === 0 : !value
            })
            .map(field => field.label)
    },

    // Format profile picture URL
    formatProfilePictureUrl: (url: string | null | undefined): string => {
        if (!url) return '/placeholder-user.jpg'

        // If it's already a full URL, return as is
        if (url.startsWith('http')) return url

        // If it's a relative path, prepend the API base URL
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`
    },

    // Validate file for profile picture upload
    validateProfilePicture: (file: File): { isValid: boolean; error?: string } => {
        const maxSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

        if (file.size > maxSize) {
            return { isValid: false, error: 'File size must be less than 5MB' }
        }

        if (!allowedTypes.includes(file.type)) {
            return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
        }

        return { isValid: true }
    },
}