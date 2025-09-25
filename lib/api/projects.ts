import { api, ApiResponse } from './client'
import { Project, ProjectSummary, PaginatedProjects, SearchFilters } from './types'

// Projects API service
export const projectsApi = {
    // Search and browse projects
    searchProjects: async (filters: SearchFilters = {}): Promise<PaginatedProjects> => {
        const params = new URLSearchParams()

        // Add search parameters
        if (filters.query) params.append('query', filters.query)
        if (filters.specializations?.length) {
            filters.specializations.forEach(spec => params.append('specializations', spec))
        }
        if (filters.difficultyLevels?.length) {
            filters.difficultyLevels.forEach(level => params.append('difficultyLevels', level))
        }
        if (filters.tags?.length) {
            filters.tags.forEach(tag => params.append('tags', tag))
        }
        if (filters.isGroupProject !== undefined) {
            params.append('isGroupProject', filters.isGroupProject.toString())
        }
        if (filters.yearFrom) params.append('yearFrom', filters.yearFrom.toString())
        if (filters.yearTo) params.append('yearTo', filters.yearTo.toString())
        if (filters.sortBy) params.append('sortBy', filters.sortBy)
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.offset) params.append('offset', filters.offset.toString())

        const response = await api.get<PaginatedProjects>(`/projects?${params.toString()}`)
        return response.data!
    },

    // Get popular/trending projects
    getPopularProjects: async (limit: number = 10): Promise<ProjectSummary[]> => {
        const response = await api.get<ProjectSummary[]>(`/projects/popular?limit=${limit}`)
        return response.data!
    },

    // Get project details by ID
    getProjectById: async (id: string): Promise<Project> => {
        const response = await api.get<Project>(`/projects/${id}`)
        return response.data!
    },

    // Get related project suggestions
    getRelatedProjects: async (id: string, limit: number = 5): Promise<ProjectSummary[]> => {
        const response = await api.get<ProjectSummary[]>(`/projects/${id}/suggestions?limit=${limit}`)
        return response.data!
    },
}

// Project utility functions
export const projectUtils = {
    // Format difficulty level for display
    formatDifficultyLevel: (level: string): string => {
        const levels: Record<string, string> = {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced',
            expert: 'Expert',
        }
        return levels[level] || level
    },

    // Get difficulty color
    getDifficultyColor: (level: string): string => {
        const colors: Record<string, string> = {
            beginner: 'green',
            intermediate: 'yellow',
            advanced: 'orange',
            expert: 'red',
        }
        return colors[level] || 'gray'
    },

    // Format specialization for display
    formatSpecialization: (specialization: string): string => {
        const specializations: Record<string, string> = {
            'AI': 'Artificial Intelligence',
            'ML': 'Machine Learning',
            'WebDev': 'Web Development',
            'MobileDev': 'Mobile Development',
            'DataScience': 'Data Science',
            'Cybersecurity': 'Cybersecurity',
            'IoT': 'Internet of Things',
            'Blockchain': 'Blockchain',
            'GameDev': 'Game Development',
            'DevOps': 'DevOps',
        }
        return specializations[specialization] || specialization
    },

    // Check if project is group project
    isGroupProject: (project: Project | ProjectSummary): boolean => {
        return project.isGroupProject
    },

    // Get project status color
    getStatusColor: (status: string): string => {
        const colors: Record<string, string> = {
            draft: 'gray',
            pending_approval: 'yellow',
            approved: 'green',
            rejected: 'red',
            archived: 'gray',
        }
        return colors[status] || 'gray'
    },

    // Format project status for display
    formatStatus: (status: string): string => {
        const statuses: Record<string, string> = {
            draft: 'Draft',
            pending_approval: 'Pending Approval',
            approved: 'Approved',
            rejected: 'Rejected',
            archived: 'Archived',
        }
        return statuses[status] || status
    },

    // Calculate reading time for project description
    calculateReadingTime: (text: string): number => {
        const wordsPerMinute = 200
        const wordCount = text.split(/\s+/).length
        return Math.ceil(wordCount / wordsPerMinute)
    },

    // Extract keywords from project
    extractKeywords: (project: Project): string[] => {
        const keywords = [
            ...project.tags,
            ...project.requiredSkills,
            project.specialization,
            project.difficultyLevel,
        ]
        return [...new Set(keywords)].filter(Boolean)
    },

    // Check if project matches search query
    matchesSearchQuery: (project: Project | ProjectSummary, query: string): boolean => {
        const searchText = query.toLowerCase()
        const projectText = [
            project.title,
            project.abstract,
            project.specialization,
            ...project.tags,
        ].join(' ').toLowerCase()

        return projectText.includes(searchText)
    },
}