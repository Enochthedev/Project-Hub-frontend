import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Project, ProjectSummary, PaginatedProjects, SearchFilters } from '@/lib/api/types'
import { projectsApi } from '@/lib/api/projects'

interface ProjectCache {
    [key: string]: {
        data: Project
        timestamp: number
        expiresAt: number
    }
}

interface SearchCache {
    [key: string]: {
        data: PaginatedProjects
        timestamp: number
        expiresAt: number
    }
}

interface ProjectsState {
    // State
    projects: ProjectSummary[]
    currentProject: Project | null
    popularProjects: ProjectSummary[]
    relatedProjects: ProjectSummary[]
    searchResults: PaginatedProjects | null
    searchFilters: SearchFilters
    bookmarkedProjects: string[]
    recentlyViewed: ProjectSummary[]

    // Loading states
    isLoading: boolean
    isLoadingProject: boolean
    isLoadingPopular: boolean
    isLoadingRelated: boolean
    isBookmarking: boolean

    // Error states
    error: string | null

    // Cache
    projectCache: ProjectCache
    searchCache: SearchCache
    cacheExpiry: number // 5 minutes default

    // Actions
    searchProjects: (filters?: SearchFilters) => Promise<void>
    loadMoreProjects: () => Promise<void>
    getProjectById: (id: string, useCache?: boolean) => Promise<void>
    getPopularProjects: (limit?: number) => Promise<void>
    getRelatedProjects: (id: string, limit?: number) => Promise<void>
    bookmarkProject: (projectId: string) => Promise<void>
    unbookmarkProject: (projectId: string) => Promise<void>
    addToRecentlyViewed: (project: ProjectSummary) => void
    setSearchFilters: (filters: SearchFilters) => void
    clearSearchResults: () => void
    clearCurrentProject: () => void
    clearCache: () => void
    clearError: () => void
    getCachedProject: (id: string) => Project | null
    getCachedSearch: (filters: SearchFilters) => PaginatedProjects | null
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

export const useProjectsStore = create<ProjectsState>()(
    devtools(
        (set, get) => ({
            // Initial state
            projects: [],
            currentProject: null,
            popularProjects: [],
            relatedProjects: [],
            searchResults: null,
            searchFilters: {
                limit: 20,
                offset: 0,
                sortBy: 'relevance',
                sortOrder: 'desc',
            },
            bookmarkedProjects: [],
            recentlyViewed: [],

            // Loading states
            isLoading: false,
            isLoadingProject: false,
            isLoadingPopular: false,
            isLoadingRelated: false,
            isBookmarking: false,

            // Error states
            error: null,

            // Cache
            projectCache: {},
            searchCache: {},
            cacheExpiry: CACHE_EXPIRY_MS,

            // Actions
            searchProjects: async (filters?: SearchFilters) => {
                set({ isLoading: true, error: null })

                try {
                    const searchFilters = { ...get().searchFilters, ...filters }
                    const results = await projectsApi.searchProjects(searchFilters)

                    set({
                        searchResults: results,
                        projects: results.projects,
                        searchFilters,
                        isLoading: false,
                    })
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to search projects'
                    set({
                        isLoading: false,
                        error: errorMessage,
                    })
                    throw error
                }
            },

            loadMoreProjects: async () => {
                const { searchResults, searchFilters, isLoading } = get()

                if (isLoading || !searchResults?.hasMore) return

                set({ isLoading: true })

                try {
                    const nextFilters = {
                        ...searchFilters,
                        offset: (searchFilters.offset || 0) + (searchFilters.limit || 20),
                    }

                    const results = await projectsApi.searchProjects(nextFilters)

                    set({
                        searchResults: {
                            ...results,
                            projects: [...searchResults.projects, ...results.projects],
                        },
                        projects: [...searchResults.projects, ...results.projects],
                        searchFilters: nextFilters,
                        isLoading: false,
                    })
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to load more projects'
                    set({
                        isLoading: false,
                        error: errorMessage,
                    })
                    throw error
                }
            },

            getProjectById: async (id: string, useCache = true) => {
                // Check cache first
                if (useCache) {
                    const cachedProject = get().getCachedProject(id)
                    if (cachedProject) {
                        set({ currentProject: cachedProject })

                        // Add to recently viewed
                        const projectSummary: ProjectSummary = {
                            id: cachedProject.id,
                            title: cachedProject.title,
                            abstract: cachedProject.abstract,
                            specialization: cachedProject.specialization,
                            difficultyLevel: cachedProject.difficultyLevel,
                            tags: cachedProject.tags,
                            isGroupProject: cachedProject.isGroupProject,
                            supervisor: {
                                id: cachedProject.supervisor.id,
                                name: cachedProject.supervisor.name,
                                department: cachedProject.supervisor.department,
                            },
                            viewCount: cachedProject.viewCount || 0,
                            bookmarkCount: cachedProject.bookmarkCount || 0,
                            createdAt: cachedProject.createdAt,
                        }
                        get().addToRecentlyViewed(projectSummary)
                        return
                    }
                }

                set({ isLoadingProject: true, error: null })

                try {
                    const project = await projectsApi.getProjectById(id)

                    // Cache the project
                    const { projectCache } = get()
                    const now = Date.now()
                    const updatedCache = {
                        ...projectCache,
                        [id]: {
                            data: project,
                            timestamp: now,
                            expiresAt: now + CACHE_EXPIRY_MS,
                        }
                    }

                    set({
                        currentProject: project,
                        isLoadingProject: false,
                        projectCache: updatedCache,
                    })

                    // Add to recently viewed
                    const projectSummary: ProjectSummary = {
                        id: project.id,
                        title: project.title,
                        abstract: project.abstract,
                        specialization: project.specialization,
                        difficultyLevel: project.difficultyLevel,
                        tags: project.tags,
                        isGroupProject: project.isGroupProject,
                        supervisor: {
                            id: project.supervisor.id,
                            name: project.supervisor.name,
                            department: project.supervisor.department,
                        },
                        viewCount: project.viewCount || 0,
                        bookmarkCount: project.bookmarkCount || 0,
                        createdAt: project.createdAt,
                    }
                    get().addToRecentlyViewed(projectSummary)
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to load project'
                    set({
                        isLoadingProject: false,
                        error: errorMessage,
                    })
                    throw error
                }
            },

            getPopularProjects: async (limit = 10) => {
                set({ isLoadingPopular: true, error: null })

                try {
                    const projects = await projectsApi.getPopularProjects(limit)

                    set({
                        popularProjects: projects,
                        isLoadingPopular: false,
                    })
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to load popular projects'
                    set({
                        isLoadingPopular: false,
                        error: errorMessage,
                    })
                    throw error
                }
            },

            getRelatedProjects: async (id: string, limit = 5) => {
                set({ isLoadingRelated: true, error: null })

                try {
                    const projects = await projectsApi.getRelatedProjects(id, limit)

                    set({
                        relatedProjects: projects,
                        isLoadingRelated: false,
                    })
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to load related projects'
                    set({
                        isLoadingRelated: false,
                        error: errorMessage,
                    })
                    throw error
                }
            },

            setSearchFilters: (filters: SearchFilters) => {
                set({
                    searchFilters: { ...get().searchFilters, ...filters },
                })
            },

            clearSearchResults: () => {
                set({
                    searchResults: null,
                    projects: [],
                    searchFilters: {
                        limit: 20,
                        offset: 0,
                        sortBy: 'relevance',
                        sortOrder: 'desc',
                    },
                })
            },

            clearCurrentProject: () => {
                set({
                    currentProject: null,
                    relatedProjects: [],
                })
            },

            clearError: () => {
                set({ error: null })
            },

            bookmarkProject: async (projectId: string) => {
                set({ isBookmarking: true, error: null })

                try {
                    // Here you would call the bookmarks API
                    // await bookmarksApi.bookmarkProject(projectId)

                    // For now, just update local state
                    const { bookmarkedProjects } = get()
                    if (!bookmarkedProjects.includes(projectId)) {
                        set({
                            bookmarkedProjects: [...bookmarkedProjects, projectId],
                            isBookmarking: false,
                        })
                    }
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to bookmark project'
                    set({
                        isBookmarking: false,
                        error: errorMessage,
                    })
                    throw error
                }
            },

            unbookmarkProject: async (projectId: string) => {
                set({ isBookmarking: true, error: null })

                try {
                    // Here you would call the bookmarks API
                    // await bookmarksApi.unbookmarkProject(projectId)

                    // For now, just update local state
                    const { bookmarkedProjects } = get()
                    set({
                        bookmarkedProjects: bookmarkedProjects.filter(id => id !== projectId),
                        isBookmarking: false,
                    })
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to unbookmark project'
                    set({
                        isBookmarking: false,
                        error: errorMessage,
                    })
                    throw error
                }
            },

            addToRecentlyViewed: (project: ProjectSummary) => {
                const { recentlyViewed } = get()

                // Remove if already exists to avoid duplicates
                const filtered = recentlyViewed.filter(p => p.id !== project.id)

                // Add to beginning and limit to 10 items
                const updated = [project, ...filtered].slice(0, 10)

                set({ recentlyViewed: updated })
            },

            clearCache: () => {
                set({
                    projectCache: {},
                    searchCache: {},
                })
            },

            getCachedProject: (id: string) => {
                const { projectCache } = get()
                const cached = projectCache[id]

                if (cached && Date.now() < cached.expiresAt) {
                    return cached.data
                }

                return null
            },

            getCachedSearch: (filters: SearchFilters) => {
                const { searchCache } = get()
                const cacheKey = JSON.stringify(filters)
                const cached = searchCache[cacheKey]

                if (cached && Date.now() < cached.expiresAt) {
                    return cached.data
                }

                return null
            },
        }),
        {
            name: 'projects-store',
        }
    )
)