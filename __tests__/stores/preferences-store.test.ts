import { renderHook, act } from '@testing-library/react'
import { usePreferencesStore, UserPreferences } from '@/lib/stores/preferences-store'

describe('PreferencesStore', () => {
    beforeEach(() => {
        // Reset the store state
        usePreferencesStore.setState({
            preferences: {
                theme: 'system',
                colorScheme: 'default',
                fontSize: 'medium',
                compactMode: false,
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
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
                dashboardLayout: 'grid',
                defaultProjectView: 'grid',
                sidebarCollapsed: false,
                showWelcomeMessage: true,
                aiAssistant: {
                    autoSuggestions: true,
                    conversationHistory: true,
                    responseLength: 'medium',
                    confidenceThreshold: 0.7,
                    language: 'en',
                },
                dataSharing: {
                    analytics: true,
                    improvements: true,
                    research: false,
                },
                profileVisibility: 'university',
                accessibility: {
                    highContrast: false,
                    reducedMotion: false,
                    screenReader: false,
                    keyboardNavigation: false,
                    focusIndicators: false,
                },
            },
            isLoading: false,
            isSaving: false,
            error: null,
            hasUnsavedChanges: false,
        })
    })

    describe('updatePreferences', () => {
        it('should update preferences and mark as changed', () => {
            const { result } = renderHook(() => usePreferencesStore())

            act(() => {
                result.current.updatePreferences({
                    theme: 'dark',
                    fontSize: 'large',
                })
            })

            expect(result.current.preferences.theme).toBe('dark')
            expect(result.current.preferences.fontSize).toBe('large')
            expect(result.current.hasUnsavedChanges).toBe(true)
        })

        it('should update nested preferences', () => {
            const { result } = renderHook(() => usePreferencesStore())

            act(() => {
                result.current.updatePreferences({
                    emailNotifications: {
                        milestoneReminders: false,
                        projectUpdates: false,
                        systemAnnouncements: true,
                        weeklyDigest: true,
                        aiAssistantUpdates: true,
                    },
                })
            })

            expect(result.current.preferences.emailNotifications.milestoneReminders).toBe(false)
            expect(result.current.preferences.emailNotifications.weeklyDigest).toBe(true)
            expect(result.current.hasUnsavedChanges).toBe(true)
        })
    })

    describe('savePreferences', () => {
        it('should save preferences successfully', async () => {
            const { result } = renderHook(() => usePreferencesStore())

            // First update preferences
            act(() => {
                result.current.updatePreferences({ theme: 'dark' })
            })

            expect(result.current.hasUnsavedChanges).toBe(true)

            // Then save
            await act(async () => {
                await result.current.savePreferences()
            })

            expect(result.current.isSaving).toBe(false)
            expect(result.current.hasUnsavedChanges).toBe(false)
            expect(result.current.error).toBeNull()
        })
    })

    describe('resetPreferences', () => {
        it('should reset preferences to defaults', () => {
            const { result } = renderHook(() => usePreferencesStore())

            // First change some preferences
            act(() => {
                result.current.updatePreferences({
                    theme: 'dark',
                    fontSize: 'large',
                    compactMode: true,
                })
            })

            expect(result.current.preferences.theme).toBe('dark')

            // Then reset
            act(() => {
                result.current.resetPreferences()
            })

            expect(result.current.preferences.theme).toBe('system')
            expect(result.current.preferences.fontSize).toBe('medium')
            expect(result.current.preferences.compactMode).toBe(false)
            expect(result.current.hasUnsavedChanges).toBe(true)
        })
    })

    describe('exportPreferences', () => {
        it('should export preferences as JSON string', () => {
            const { result } = renderHook(() => usePreferencesStore())

            const exported = result.current.exportPreferences()
            const parsed = JSON.parse(exported)

            expect(parsed).toEqual(result.current.preferences)
            expect(typeof exported).toBe('string')
        })
    })

    describe('importPreferences', () => {
        it('should import valid preferences', async () => {
            const { result } = renderHook(() => usePreferencesStore())

            const testPreferences: Partial<UserPreferences> = {
                theme: 'dark',
                fontSize: 'large',
                language: 'es',
            }

            await act(async () => {
                await result.current.importPreferences(JSON.stringify(testPreferences))
            })

            expect(result.current.preferences.theme).toBe('dark')
            expect(result.current.preferences.fontSize).toBe('large')
            expect(result.current.preferences.language).toBe('es')
            expect(result.current.hasUnsavedChanges).toBe(true)
        })

        it('should handle invalid JSON', async () => {
            const { result } = renderHook(() => usePreferencesStore())

            await act(async () => {
                try {
                    await result.current.importPreferences('invalid json')
                } catch (error) {
                    expect(error).toBeInstanceOf(Error)
                    expect((error as Error).message).toBe('Invalid preferences data format')
                }
            })
        })
    })

    describe('error handling', () => {
        it('should clear error', () => {
            usePreferencesStore.setState({ error: 'Some error' })

            const { result } = renderHook(() => usePreferencesStore())

            act(() => {
                result.current.clearError()
            })

            expect(result.current.error).toBeNull()
        })
    })

    describe('change tracking', () => {
        it('should mark as changed', () => {
            const { result } = renderHook(() => usePreferencesStore())

            act(() => {
                result.current.markAsChanged()
            })

            expect(result.current.hasUnsavedChanges).toBe(true)
        })

        it('should mark as saved', () => {
            usePreferencesStore.setState({ hasUnsavedChanges: true })

            const { result } = renderHook(() => usePreferencesStore())

            act(() => {
                result.current.markAsSaved()
            })

            expect(result.current.hasUnsavedChanges).toBe(false)
        })
    })
})
