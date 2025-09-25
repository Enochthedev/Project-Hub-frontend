import { create } from 'zustand'
import { User, StudentProfile, SupervisorProfile } from '@/lib/api/types'
import {
    profileApi,
    UpdateStudentProfileData,
    UpdateSupervisorProfileData,
    ChangePasswordData,
    profileUtils
} from '@/lib/api/profile'

interface ProfileState {
    // State
    profile: User | null
    isLoading: boolean
    isUpdating: boolean
    isUploadingPicture: boolean
    error: string | null
    completionPercentage: number
    missingFields: string[]

    // Actions
    fetchProfile: () => Promise<void>
    updateStudentProfile: (data: UpdateStudentProfileData) => Promise<void>
    updateSupervisorProfile: (data: UpdateSupervisorProfileData) => Promise<void>
    uploadProfilePicture: (file: File) => Promise<string>
    deleteProfilePicture: () => Promise<void>
    changePassword: (data: ChangePasswordData) => Promise<void>
    deleteAccount: (password: string) => Promise<void>
    calculateCompletion: () => void
    clearError: () => void
    setProfile: (profile: User) => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
    // Initial state
    profile: null,
    isLoading: false,
    isUpdating: false,
    isUploadingPicture: false,
    error: null,
    completionPercentage: 0,
    missingFields: [],

    // Actions
    fetchProfile: async () => {
        set({ isLoading: true, error: null })

        try {
            const response = await profileApi.getProfile()
            const profile = response.data!

            set({
                profile,
                isLoading: false,
                error: null
            })

            // Calculate completion after setting profile
            get().calculateCompletion()
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch profile'
            set({
                isLoading: false,
                error: errorMessage,
            })
            throw error
        }
    },

    updateStudentProfile: async (data: UpdateStudentProfileData) => {
        set({ isUpdating: true, error: null })

        try {
            const response = await profileApi.updateStudentProfile(data)
            const updatedProfile = response.data!

            // Update the profile with the new student profile data
            const { profile } = get()
            if (profile) {
                const newProfile = {
                    ...profile,
                    studentProfile: updatedProfile
                }

                set({
                    profile: newProfile,
                    isUpdating: false,
                    error: null
                })

                // Recalculate completion
                get().calculateCompletion()
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile'
            set({
                isUpdating: false,
                error: errorMessage,
            })
            throw error
        }
    },

    updateSupervisorProfile: async (data: UpdateSupervisorProfileData) => {
        set({ isUpdating: true, error: null })

        try {
            const response = await profileApi.updateSupervisorProfile(data)
            const updatedProfile = response.data!

            // Update the profile with the new supervisor profile data
            const { profile } = get()
            if (profile) {
                const newProfile = {
                    ...profile,
                    supervisorProfile: updatedProfile
                }

                set({
                    profile: newProfile,
                    isUpdating: false,
                    error: null
                })

                // Recalculate completion
                get().calculateCompletion()
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile'
            set({
                isUpdating: false,
                error: errorMessage,
            })
            throw error
        }
    },

    uploadProfilePicture: async (file: File): Promise<string> => {
        set({ isUploadingPicture: true, error: null })

        try {
            // Validate file first
            const validation = profileUtils.validateProfilePicture(file)
            if (!validation.isValid) {
                throw new Error(validation.error)
            }

            const response = await profileApi.uploadProfilePicture(file)
            const { url } = response.data!

            // Update the profile with the new picture URL
            const { profile } = get()
            if (profile) {
                const updatedProfile = { ...profile }

                if (profile.role === 'student' && profile.studentProfile) {
                    updatedProfile.studentProfile = {
                        ...profile.studentProfile,
                        profilePicture: url
                    }
                } else if (profile.role === 'supervisor' && profile.supervisorProfile) {
                    updatedProfile.supervisorProfile = {
                        ...profile.supervisorProfile,
                        profilePicture: url
                    }
                }

                set({
                    profile: updatedProfile,
                    isUploadingPicture: false,
                    error: null
                })

                // Recalculate completion
                get().calculateCompletion()
            }

            return url
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload profile picture'
            set({
                isUploadingPicture: false,
                error: errorMessage,
            })
            throw error
        }
    },

    deleteProfilePicture: async () => {
        set({ isUploadingPicture: true, error: null })

        try {
            await profileApi.deleteProfilePicture()

            // Update the profile to remove the picture URL
            const { profile } = get()
            if (profile) {
                const updatedProfile = { ...profile }

                if (profile.role === 'student' && profile.studentProfile) {
                    updatedProfile.studentProfile = {
                        ...profile.studentProfile,
                        profilePicture: null
                    }
                } else if (profile.role === 'supervisor' && profile.supervisorProfile) {
                    updatedProfile.supervisorProfile = {
                        ...profile.supervisorProfile,
                        profilePicture: null
                    }
                }

                set({
                    profile: updatedProfile,
                    isUploadingPicture: false,
                    error: null
                })

                // Recalculate completion
                get().calculateCompletion()
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete profile picture'
            set({
                isUploadingPicture: false,
                error: errorMessage,
            })
            throw error
        }
    },

    changePassword: async (data: ChangePasswordData) => {
        set({ isUpdating: true, error: null })

        try {
            await profileApi.changePassword(data)
            set({
                isUpdating: false,
                error: null
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to change password'
            set({
                isUpdating: false,
                error: errorMessage,
            })
            throw error
        }
    },

    deleteAccount: async (password: string) => {
        set({ isUpdating: true, error: null })

        try {
            await profileApi.deleteAccount(password)

            // Clear profile data after successful deletion
            set({
                profile: null,
                isUpdating: false,
                error: null,
                completionPercentage: 0,
                missingFields: []
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete account'
            set({
                isUpdating: false,
                error: errorMessage,
            })
            throw error
        }
    },

    calculateCompletion: () => {
        const { profile } = get()
        if (!profile) {
            set({ completionPercentage: 0, missingFields: [] })
            return
        }

        let completionPercentage = 0
        let missingFields: string[] = []

        if (profile.role === 'student' && profile.studentProfile) {
            completionPercentage = profileUtils.calculateStudentProfileCompletion(profile.studentProfile)
            missingFields = profileUtils.getStudentProfileMissingFields(profile.studentProfile)
        } else if (profile.role === 'supervisor' && profile.supervisorProfile) {
            completionPercentage = profileUtils.calculateSupervisorProfileCompletion(profile.supervisorProfile)
            missingFields = profileUtils.getSupervisorProfileMissingFields(profile.supervisorProfile)
        }

        set({ completionPercentage, missingFields })
    },

    clearError: () => {
        set({ error: null })
    },

    setProfile: (profile: User) => {
        set({ profile })
        get().calculateCompletion()
    },
}))
