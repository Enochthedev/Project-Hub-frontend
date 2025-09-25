import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { milestoneApi, type CreateMilestoneData, type UpdateMilestoneData, type MilestoneFilters } from '../api/milestones'
import type { Milestone } from '../api/types'

interface MilestoneState {
    // State
    milestones: Milestone[]
    currentMilestone: Milestone | null
    templates: any[]
    upcomingDeadlines: Milestone[]
    overdueMilestones: Milestone[]
    completedMilestones: Milestone[]
    progressStats: {
        totalMilestones: number
        completedCount: number
        inProgressCount: number
        overdueCount: number
        completionRate: number
    }

    // Loading states
    isLoading: boolean
    isCreating: boolean
    isUpdating: boolean
    isDeleting: boolean

    // Error states
    error: string | null

    // Filters and sorting
    filters: MilestoneFilters
    sortBy: 'dueDate' | 'priority' | 'status' | 'title'
    sortOrder: 'asc' | 'desc'

    // Real-time sync
    lastSyncTime: number | null
    syncError: string | null

    // Actions
    fetchMilestones: (filters?: MilestoneFilters) => Promise<void>
    fetchMilestone: (id: string) => Promise<void>
    createMilestone: (data: CreateMilestoneData) => Promise<Milestone>
    updateMilestone: (id: string, data: UpdateMilestoneData) => Promise<Milestone>
    deleteMilestone: (id: string) => Promise<void>
    updateProgress: (id: string, progress: number, notes?: string) => Promise<void>
    bulkUpdateProgress: (updates: Array<{ id: string; progress: number; notes?: string }>) => Promise<void>
    fetchTemplates: () => Promise<void>
    fetchUpcomingDeadlines: (days?: number) => Promise<void>
    fetchOverdueMilestones: () => Promise<void>
    calculateProgressStats: () => void
    setFilters: (filters: MilestoneFilters) => void
    setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
    syncWithServer: () => Promise<void>
    clearError: () => void
    reset: () => void
}

const initialState = {
    milestones: [],
    currentMilestone: null,
    templates: [],
    upcomingDeadlines: [],
    overdueMilestones: [],
    completedMilestones: [],
    progressStats: {
        totalMilestones: 0,
        completedCount: 0,
        inProgressCount: 0,
        overdueCount: 0,
        completionRate: 0,
    },

    // Loading states
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    // Error states
    error: null,

    // Filters and sorting
    filters: {},
    sortBy: 'dueDate' as const,
    sortOrder: 'asc' as const,

    // Real-time sync
    lastSyncTime: null,
    syncError: null,
}

export const useMilestoneStore = create<MilestoneState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            fetchMilestones: async (filters?: MilestoneFilters) => {
                set({ isLoading: true, error: null })
                try {
                    const milestones = await milestoneApi.getMilestones(filters)
                    set({
                        milestones,
                        isLoading: false,
                        filters: filters || {}
                    })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch milestones',
                        isLoading: false
                    })
                }
            },

            fetchMilestone: async (id: string) => {
                set({ isLoading: true, error: null })
                try {
                    const milestone = await milestoneApi.getMilestone(id)
                    set({ currentMilestone: milestone, isLoading: false })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch milestone',
                        isLoading: false
                    })
                }
            },

            createMilestone: async (data: CreateMilestoneData) => {
                set({ isLoading: true, error: null })
                try {
                    const newMilestone = await milestoneApi.createMilestone(data)
                    set(state => ({
                        milestones: [...state.milestones, newMilestone],
                        isLoading: false
                    }))
                    return newMilestone
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to create milestone',
                        isLoading: false
                    })
                    throw error
                }
            },

            updateMilestone: async (id: string, data: UpdateMilestoneData) => {
                set({ isLoading: true, error: null })
                try {
                    const updatedMilestone = await milestoneApi.updateMilestone(id, data)
                    set(state => ({
                        milestones: state.milestones.map(m =>
                            m.id === id ? updatedMilestone : m
                        ),
                        currentMilestone: state.currentMilestone?.id === id ? updatedMilestone : state.currentMilestone,
                        isLoading: false
                    }))
                    return updatedMilestone
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update milestone',
                        isLoading: false
                    })
                    throw error
                }
            },

            deleteMilestone: async (id: string) => {
                set({ isLoading: true, error: null })
                try {
                    await milestoneApi.deleteMilestone(id)
                    set(state => ({
                        milestones: state.milestones.filter(m => m.id !== id),
                        currentMilestone: state.currentMilestone?.id === id ? null : state.currentMilestone,
                        isLoading: false
                    }))
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to delete milestone',
                        isLoading: false
                    })
                    throw error
                }
            },

            updateProgress: async (id: string, progress: number, notes?: string) => {
                set({ isUpdating: true, error: null })
                try {
                    const updatedMilestone = await milestoneApi.updateProgress(id, progress)
                    set(state => ({
                        milestones: state.milestones.map(m =>
                            m.id === id ? updatedMilestone : m
                        ),
                        currentMilestone: state.currentMilestone?.id === id ? updatedMilestone : state.currentMilestone,
                        isUpdating: false,
                    }))

                    // Recalculate stats
                    get().calculateProgressStats()
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update progress',
                        isUpdating: false,
                    })
                    throw error
                }
            },

            bulkUpdateProgress: async (updates: Array<{ id: string; progress: number; notes?: string }>) => {
                set({ isUpdating: true, error: null })
                try {
                    // Here you would call a bulk update API
                    // const updatedMilestones = await milestoneApi.bulkUpdateProgress(updates)

                    // For now, update each one individually
                    const promises = updates.map(update =>
                        milestoneApi.updateProgress(update.id, update.progress)
                    )
                    const updatedMilestones = await Promise.all(promises)

                    set(state => {
                        const milestoneMap = new Map(updatedMilestones.map(m => [m.id, m]))
                        return {
                            milestones: state.milestones.map(m => milestoneMap.get(m.id) || m),
                            isUpdating: false,
                        }
                    })

                    // Recalculate stats
                    get().calculateProgressStats()
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to bulk update progress',
                        isUpdating: false,
                    })
                    throw error
                }
            },

            fetchTemplates: async () => {
                set({ isLoading: true, error: null })
                try {
                    const templates = await milestoneApi.getTemplates()
                    set({ templates, isLoading: false })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch templates',
                        isLoading: false
                    })
                }
            },

            setFilters: (filters: MilestoneFilters) => {
                set({ filters })
            },

            clearError: () => {
                set({ error: null })
            },

            reset: () => {
                set(initialState)
            },

            fetchUpcomingDeadlines: async (days = 7) => {
                set({ isLoading: true, error: null })
                try {
                    // Here you would call an API to get upcoming deadlines
                    // const deadlines = await milestoneApi.getUpcomingDeadlines(days)

                    // For now, filter from existing milestones
                    const { milestones } = get()
                    const now = new Date()
                    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

                    const upcoming = milestones.filter(m => {
                        const dueDate = new Date(m.dueDate)
                        return dueDate >= now && dueDate <= futureDate && m.status !== 'completed'
                    })

                    set({
                        upcomingDeadlines: upcoming,
                        isLoading: false
                    })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch upcoming deadlines',
                        isLoading: false
                    })
                }
            },

            fetchOverdueMilestones: async () => {
                set({ isLoading: true, error: null })
                try {
                    // Here you would call an API to get overdue milestones
                    // const overdue = await milestoneApi.getOverdueMilestones()

                    // For now, filter from existing milestones
                    const { milestones } = get()
                    const now = new Date()

                    const overdue = milestones.filter(m => {
                        const dueDate = new Date(m.dueDate)
                        return dueDate < now && m.status !== 'completed'
                    })

                    set({
                        overdueMilestones: overdue,
                        isLoading: false
                    })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch overdue milestones',
                        isLoading: false
                    })
                }
            },

            calculateProgressStats: () => {
                const { milestones } = get()

                const totalMilestones = milestones.length
                const completedCount = milestones.filter(m => m.status === 'completed').length
                const inProgressCount = milestones.filter(m => m.status === 'in_progress').length
                const overdueCount = milestones.filter(m => m.status === 'overdue').length
                const completionRate = totalMilestones > 0 ? (completedCount / totalMilestones) * 100 : 0

                set({
                    progressStats: {
                        totalMilestones,
                        completedCount,
                        inProgressCount,
                        overdueCount,
                        completionRate,
                    }
                })
            },

            setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => {
                set({
                    sortBy: sortBy as any,
                    sortOrder
                })

                // Re-sort milestones
                const { milestones } = get()
                const sorted = [...milestones].sort((a, b) => {
                    let aValue: any = a[sortBy as keyof Milestone]
                    let bValue: any = b[sortBy as keyof Milestone]

                    if (sortBy === 'dueDate') {
                        aValue = new Date(aValue).getTime()
                        bValue = new Date(bValue).getTime()
                    }

                    if (sortOrder === 'asc') {
                        return aValue > bValue ? 1 : -1
                    } else {
                        return aValue < bValue ? 1 : -1
                    }
                })

                set({ milestones: sorted })
            },

            syncWithServer: async () => {
                set({ syncError: null })
                try {
                    // Here you would sync with the server
                    // await milestoneApi.syncMilestones()

                    set({ lastSyncTime: Date.now() })
                } catch (error) {
                    set({
                        syncError: error instanceof Error ? error.message : 'Failed to sync with server'
                    })
                    throw error
                }
            },
        }),
        {
            name: 'milestone-store'
        }
    )
)
