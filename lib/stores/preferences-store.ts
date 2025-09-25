import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export interface UserPreferences {
    // Theme and appearance
    theme: 'light' | 'dark' | 'system'
    colorScheme: 'default' | 'blue' | 'green' | 'purple' | 'orange'
    fontSize: 'small' | 'medium' | 'large'
    compactMode: boolean

    // Language and localization
    language: 'en' | 'es' | 'fr' | 'de' | 'zh'
    timezone: string
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
    timeFormat: '12h' | '24h'

    // Notifications
    emailNotifications: {
        milestoneReminders: boolean
        projectUpdates: boolean
        systemAnnouncements: boolean
        weeklyDigest: boolean
        aiAssistantUpdates: boolean
    }
    pushNotifications: {
        enabled: boolean
        milestoneDeadlines: boolean
        newMessages: boolean
        projectApprovals: boolean
        systemAlerts: boolean
    }
    notificationSound: boolean

    // Dashboard and layout
    dashboardLayout: 'grid' | 'list' | 'compact'
    defaultProjectView: 'grid' | 'list' | 'table'
    sidebarCollapsed: boolean
    showWelcomeMessage: boolean

    // AI Assistant preferences
    aiAssistant: {
        autoSuggestions: boolean
        conversationHistory: boolean
        responseLength: 'short' | 'medium' | 'detailed'
        confidenceThreshold: number
        language: string
    }

    // Privacy and data
    dataSharing: {
        analytics: boolean
        improvements: boolean
        research: boolean
    }
    profileVisibility: 'public' | 'university' | 'private'

    // Accessibility
    accessibility: {
        highContrast: boolean
        reducedMotion: boolean
        screenReader: boolean
        keyboardNavigation: boolean
        focusIndicators: boolean
    }
}

interface PreferencesState {
    // State
    preferences: UserPreferences
    isLoading: boolean
    isSaving: boolean
    error: string | null
    hasUnsavedChanges: boolean

    // Actions
    updatePreferences: (updates: Partial<UserPreferences>) => void
    savePreferences: () => Promise<void>
    resetPreferences: () => void
    loadPreferences: () => Promise<void>
    exportPreferences: () => string
    importPreferences: (data: string) => Promise<void>
    clearError: () => void
    markAsChanged: () => void
    markAsSaved: () => void
}

const defaultPreferences: UserPreferences = {
    // Theme and appearance
    theme: 'system',
    colorScheme: 'default',
    fontSize: 'medium',
    compactMode: false,

    // Language and localization
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',

    // Notifications
    emailNotifications: {
        milestoneReminders: true,
        projectUpdates: true,
        systemAnnouncements: true,
        weeklyDigest: false,
        aiAssistantUpdates: false,
    },
    pushNotifications: {
        enabled: true,
        milestoneDeadlines: true,
        newMessages: true,
        projectApprovals: true,
        systemAlerts: true,
    },
    notificationSound: true,

    // Dashboard and layout
    dashboardLayout: 'grid',
    defaultProjectView: 'grid',
    sidebarCollapsed: false,
    showWelcomeMessage: true,

    // AI Assistant preferences
    aiAssistant: {
        autoSuggestions: true,
        conversationHistory: true,
        responseLength: 'medium',
        confidenceThreshold: 0.7,
        language: 'en',
    },

    // Privacy and data
    dataSharing: {
        analytics: true,
        improvements: true,
        research: false,
    },
    profileVisibility: 'university',

    // Accessibility
    accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        keyboardNavigation: false,
        focusIndicators: false,
    },
}

export const usePreferencesStore = create<PreferencesState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                preferences: defaultPreferences,
                isLoading: false,
                isSaving: false,
                error: null,
                hasUnsavedChanges: false,

                // Actions
                updatePreferences: (updates: Partial<UserPreferences>) => {
                    set(state => ({
                        preferences: { ...state.preferences, ...updates },
                        hasUnsavedChanges: true,
                    }))
                },

                savePreferences: async () => {
                    set({ isSaving: true, error: null })

                    try {
                        const { preferences } = get()

                        // Here you would typically save to backend
                        // await preferencesApi.savePreferences(preferences)

                        // For now, just simulate API call
                        await new Promise(resolve => setTimeout(resolve, 500))

                        set({
                            isSaving: false,
                            hasUnsavedChanges: false,
                        })
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Failed to save preferences'
                        set({
                            isSaving: false,
                            error: errorMessage,
                        })
                        throw error
                    }
                },

                resetPreferences: () => {
                    set({
                        preferences: defaultPreferences,
                        hasUnsavedChanges: true,
                    })
                },

                loadPreferences: async () => {
                    set({ isLoading: true, error: null })

                    try {
                        // Here you would typically load from backend
                        // const response = await preferencesApi.getPreferences()
                        // const preferences = response.data

                        // For now, use stored preferences or defaults
                        set({ isLoading: false })
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Failed to load preferences'
                        set({
                            isLoading: false,
                            error: errorMessage,
                        })
                        throw error
                    }
                },

                exportPreferences: () => {
                    const { preferences } = get()
                    return JSON.stringify(preferences, null, 2)
                },

                importPreferences: async (data: string) => {
                    try {
                        const importedPreferences = JSON.parse(data) as UserPreferences

                        // Validate imported preferences structure
                        const validatedPreferences = { ...defaultPreferences, ...importedPreferences }

                        set({
                            preferences: validatedPreferences,
                            hasUnsavedChanges: true,
                        })
                    } catch (error) {
                        throw new Error('Invalid preferences data format')
                    }
                },

                clearError: () => {
                    set({ error: null })
                },

                markAsChanged: () => {
                    set({ hasUnsavedChanges: true })
                },

                markAsSaved: () => {
                    set({ hasUnsavedChanges: false })
                },
            }),
            {
                name: 'user-preferences',
                partialize: (state) => ({
                    preferences: state.preferences,
                }),
            }
        ),
        {
            name: 'preferences-store',
        }
    )
)