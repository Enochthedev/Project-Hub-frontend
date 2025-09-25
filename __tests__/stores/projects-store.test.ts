import { renderHook, act } from '@testing-library/react'
import { useProjectsStore } from '@/lib/stores/projects-store'
import { projectsApi } from '@/lib/api/projects'
import { Project, ProjectSummary } from '@/lib/api/types'

// Mock the API
jest.mock('@/lib/api/projects', () => ({
    projectsApi: {
        searchProjects: jest.fn(),
        getProjectById: jest.fn(),
        getPopularProjects: jest.fn(),
        getRelatedProjects: jest.fn(),
    },
}))

const mockProjectsApi = projectsApi as jest.Mocked<typeof projectsApi>

const mockProject: Project = {
    id: '1',
    title: 'Test Project',
    abstract: 'Test abstract',
    description: 'Test description',
    specialization: 'Web Development',
    difficultyLevel: 'intermediate',
    tags: ['react', 'typescript'],
    requiredSkills: ['JavaScript', 'React'],
    learningOutcomes: ['Learn React', 'Learn TypeScript'],
    isGroupProject: false,
    estimatedDuration: '3 months',
    supervisor: {
        id: 'sup1',
        name: 'Dr. Smith',
        title: 'Professor',
        department: 'Computer Science',
        specializations: ['Web Development'],
    },
    status: 'approved',
    isAvailable: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    viewCount: 10,
    bookmarkCount: 5,
}

const mockProjectSummary: ProjectSummary = {
    id: '1',
    title: 'Test Project',
    abstract: 'Test abstract',
    specialization: 'Web Development',
    difficultyLevel: 'intermediate',
    tags: ['react', 'typescript'],
    isGroupProject: false,
    supervisor: {
        id: 'sup1',
        name: 'Dr. Smith',
        department: 'Computer Science',
    },
    viewCount: 10,
    bookmarkCount: 5,
    createdAt: '2023-01-01',
}

describe('ProjectsStore', () => {
    beforeEach(() => {
        // Reset the store state
        useProjectsStore.setState({
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
            isLoading: false,
            isLoadingProject: false,
            isLoadingPopular: false,
            isLoadingRelated: false,
            isBookmarking: false,
            error: null,
            projectCache: {},
            searchCache: {},
            cacheExpiry: 5 * 60 * 1000,
        })

        // Clear all mocks
        jest.clearAllMocks()
    })

    describe('getProjectById', () => {
        it('should fetch project successfully', async () => {
            mockProjectsApi.getProjectById.mockResolvedValue(mockProject)

            const { result } = renderHook(() => useProjectsStore())

            await act(async () => {
                await result.current.getProjectById('1', false) // Skip cache
            })

            expect(result.current.currentProject).toEqual(mockProject)
            expect(result.current.isLoadingProject).toBe(false)
            expect(result.current.error).toBeNull()
            expect(result.current.recentlyViewed).toHaveLength(1)
            expect(mockProjectsApi.getProjectById).toHaveBeenCalledWith('1')
        })

        it('should use cached project when available', async () => {
            const { result } = renderHook(() => useProjectsStore())

            // Set up cache
            const now = Date.now()
            useProjectsStore.setState({
                projectCache: {
                    '1': {
                        data: mockProject,
                        timestamp: now,
                        expiresAt: now + 5 * 60 * 1000,
                    }
                }
            })

            await act(async () => {
                await result.current.getProjectById('1', true) // Use cache
            })

            expect(result.current.currentProject).toEqual(mockProject)
            expect(mockProjectsApi.getProjectById).not.toHaveBeenCalled()
        })

        it('should handle fetch error', async () => {
            const errorMessage = 'Project not found'
            mockProjectsApi.getProjectById.mockRejectedValue({
                response: { data: { message: errorMessage } }
            })

            const { result } = renderHook(() => useProjectsStore())

            await act(async () => {
                try {
                    await result.current.getProjectById('1', false)
                } catch (error) {
                    // Expected to throw
                }
            })

            expect(result.current.currentProject).toBeNull()
            expect(result.current.isLoadingProject).toBe(false)
            expect(result.current.error).toBe(errorMessage)
        })
    })

    describe('bookmarking', () => {
        it('should bookmark project', async () => {
            const { result } = renderHook(() => useProjectsStore())

            await act(async () => {
                await result.current.bookmarkProject('1')
            })

            expect(result.current.bookmarkedProjects).toContain('1')
            expect(result.current.isBookmarking).toBe(false)
        })

        it('should not duplicate bookmarks', async () => {
            const { result } = renderHook(() => useProjectsStore())

            // Set initial bookmark
            useProjectsStore.setState({
                bookmarkedProjects: ['1']
            })

            await act(async () => {
                await result.current.bookmarkProject('1')
            })

            expect(result.current.bookmarkedProjects).toEqual(['1'])
        })

        it('should unbookmark project', async () => {
            const { result } = renderHook(() => useProjectsStore())

            // Set initial bookmark
            useProjectsStore.setState({
                bookmarkedProjects: ['1', '2']
            })

            await act(async () => {
                await result.current.unbookmarkProject('1')
            })

            expect(result.current.bookmarkedProjects).toEqual(['2'])
            expect(result.current.isBookmarking).toBe(false)
        })
    })

    describe('recently viewed', () => {
        it('should add project to recently viewed', () => {
            const { result } = renderHook(() => useProjectsStore())

            act(() => {
                result.current.addToRecentlyViewed(mockProjectSummary)
            })

            expect(result.current.recentlyViewed).toHaveLength(1)
            expect(result.current.recentlyViewed[0]).toEqual(mockProjectSummary)
        })

        it('should not duplicate in recently viewed', () => {
            const { result } = renderHook(() => useProjectsStore())

            act(() => {
                result.current.addToRecentlyViewed(mockProjectSummary)
                result.current.addToRecentlyViewed(mockProjectSummary)
            })

            expect(result.current.recentlyViewed).toHaveLength(1)
        })

        it('should limit recently viewed to 10 items', () => {
            const { result } = renderHook(() => useProjectsStore())

            act(() => {
                // Add 12 projects
                for (let i = 1; i <= 12; i++) {
                    result.current.addToRecentlyViewed({
                        ...mockProjectSummary,
                        id: i.toString(),
                        title: `Project ${i}`,
                    })
                }
            })

            expect(result.current.recentlyViewed).toHaveLength(10)
            expect(result.current.recentlyViewed[0].title).toBe('Project 12') // Most recent first
        })
    })

    describe('cache management', () => {
        it('should get cached project', () => {
            const { result } = renderHook(() => useProjectsStore())

            const now = Date.now()
            useProjectsStore.setState({
                projectCache: {
                    '1': {
                        data: mockProject,
                        timestamp: now,
                        expiresAt: now + 5 * 60 * 1000,
                    }
                }
            })

            const cached = result.current.getCachedProject('1')
            expect(cached).toEqual(mockProject)
        })

        it('should return null for expired cache', () => {
            const { result } = renderHook(() => useProjectsStore())

            const now = Date.now()
            useProjectsStore.setState({
                projectCache: {
                    '1': {
                        data: mockProject,
                        timestamp: now - 10 * 60 * 1000, // 10 minutes ago
                        expiresAt: now - 5 * 60 * 1000, // Expired 5 minutes ago
                    }
                }
            })

            const cached = result.current.getCachedProject('1')
            expect(cached).toBeNull()
        })

        it('should clear cache', () => {
            const { result } = renderHook(() => useProjectsStore())

            useProjectsStore.setState({
                projectCache: { '1': { data: mockProject, timestamp: Date.now(), expiresAt: Date.now() + 1000 } },
                searchCache: { 'test': { data: {} as any, timestamp: Date.now(), expiresAt: Date.now() + 1000 } },
            })

            act(() => {
                result.current.clearCache()
            })

            expect(result.current.projectCache).toEqual({})
            expect(result.current.searchCache).toEqual({})
        })
    })

    describe('error handling', () => {
        it('should clear error', () => {
            useProjectsStore.setState({ error: 'Some error' })

            const { result } = renderHook(() => useProjectsStore())

            act(() => {
                result.current.clearError()
            })

            expect(result.current.error).toBeNull()
        })
    })
})
