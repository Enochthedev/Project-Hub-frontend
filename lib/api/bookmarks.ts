import { api, ApiResponse } from './client'
import { Bookmark, BookmarkCategory } from './types'

export interface CreateBookmarkData {
    projectId: string
    notes?: string
    tags?: string[]
    categoryId?: string
}

export interface UpdateBookmarkData {
    notes?: string
    tags?: string[]
    categoryId?: string
}

export interface CreateCategoryData {
    name: string
    description?: string
    color: string
}

export interface UpdateCategoryData {
    name?: string
    description?: string
    color?: string
}

export interface BookmarkSearchFilters {
    categoryId?: string
    tags?: string[]
    search?: string
    sortBy?: 'createdAt' | 'updatedAt' | 'title'
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
    offset?: number
}

export interface BookmarkExportData {
    format: 'json' | 'csv' | 'pdf'
    includeNotes?: boolean
    includeTags?: boolean
    categoryIds?: string[]
}

// Bookmarks API service
export const bookmarksApi = {
    // Bookmark Management
    createBookmark: async (data: CreateBookmarkData): Promise<Bookmark> => {
        const response = await api.post<Bookmark>('/bookmarks', data)
        return response.data!
    },

    getBookmarks: async (filters: BookmarkSearchFilters = {}): Promise<{
        bookmarks: Bookmark[]
        total: number
        hasMore: boolean
    }> => {
        const params = new URLSearchParams()

        if (filters.categoryId) params.append('categoryId', filters.categoryId)
        if (filters.tags?.length) {
            filters.tags.forEach(tag => params.append('tags', tag))
        }
        if (filters.search) params.append('search', filters.search)
        if (filters.sortBy) params.append('sortBy', filters.sortBy)
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.offset) params.append('offset', filters.offset.toString())

        const response = await api.get(`/bookmarks?${params.toString()}`)
        return response.data!
    },

    getBookmarkById: async (id: string): Promise<Bookmark> => {
        const response = await api.get<Bookmark>(`/bookmarks/${id}`)
        return response.data!
    },

    updateBookmark: async (id: string, data: UpdateBookmarkData): Promise<Bookmark> => {
        const response = await api.put<Bookmark>(`/bookmarks/${id}`, data)
        return response.data!
    },

    deleteBookmark: async (id: string): Promise<void> => {
        await api.delete(`/bookmarks/${id}`)
    },

    // Check if project is bookmarked
    isProjectBookmarked: async (projectId: string): Promise<boolean> => {
        try {
            const response = await api.get(`/bookmarks/check/${projectId}`)
            return response.data?.isBookmarked || false
        } catch {
            return false
        }
    },

    // Category Management
    createCategory: async (data: CreateCategoryData): Promise<BookmarkCategory> => {
        const response = await api.post<BookmarkCategory>('/bookmarks/categories', data)
        return response.data!
    },

    getCategories: async (): Promise<BookmarkCategory[]> => {
        const response = await api.get<BookmarkCategory[]>('/bookmarks/categories')
        return response.data!
    },

    getCategoryById: async (id: string): Promise<BookmarkCategory> => {
        const response = await api.get<BookmarkCategory>(`/bookmarks/categories/${id}`)
        return response.data!
    },

    updateCategory: async (id: string, data: UpdateCategoryData): Promise<BookmarkCategory> => {
        const response = await api.put<BookmarkCategory>(`/bookmarks/categories/${id}`, data)
        return response.data!
    },

    deleteCategory: async (id: string): Promise<void> => {
        await api.delete(`/bookmarks/categories/${id}`)
    },

    // Bulk Operations
    bulkDeleteBookmarks: async (bookmarkIds: string[]): Promise<void> => {
        await api.post('/bookmarks/bulk-delete', { bookmarkIds })
    },

    bulkUpdateBookmarks: async (
        bookmarkIds: string[],
        updates: Partial<UpdateBookmarkData>
    ): Promise<void> => {
        await api.post('/bookmarks/bulk-update', { bookmarkIds, updates })
    },

    // Export and Import
    exportBookmarks: async (options: BookmarkExportData): Promise<Blob> => {
        const response = await api.post('/bookmarks/export', options, {
            responseType: 'blob',
        })
        return response.data!
    },

    // Statistics
    getBookmarkStats: async (): Promise<{
        totalBookmarks: number
        categoriesCount: number
        tagsCount: number
        recentBookmarks: number
        topCategories: Array<{ name: string; count: number }>
        topTags: Array<{ name: string; count: number }>
    }> => {
        const response = await api.get('/bookmarks/stats')
        return response.data!
    },
}

// Bookmark utility functions
export const bookmarkUtils = {
    // Get default bookmark colors
    getDefaultColors: (): string[] => {
        return [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Yellow
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#F97316', // Orange
            '#06B6D4', // Cyan
            '#84CC16', // Lime
            '#EC4899', // Pink
            '#6B7280', // Gray
        ]
    },

    // Format bookmark tags for display
    formatTags: (tags: string[]): string => {
        return tags.join(', ')
    },

    // Extract unique tags from bookmarks
    extractUniqueTags: (bookmarks: Bookmark[]): string[] => {
        const allTags = bookmarks.flatMap(bookmark => bookmark.tags)
        return [...new Set(allTags)].sort()
    },

    // Group bookmarks by category
    groupByCategory: (bookmarks: Bookmark[]): Record<string, Bookmark[]> => {
        return bookmarks.reduce((groups, bookmark) => {
            const categoryName = bookmark.category?.name || 'Uncategorized'
            if (!groups[categoryName]) {
                groups[categoryName] = []
            }
            groups[categoryName].push(bookmark)
            return groups
        }, {} as Record<string, Bookmark[]>)
    },

    // Filter bookmarks by tags
    filterByTags: (bookmarks: Bookmark[], tags: string[]): Bookmark[] => {
        if (tags.length === 0) return bookmarks

        return bookmarks.filter(bookmark =>
            tags.some(tag => bookmark.tags.includes(tag))
        )
    },

    // Search bookmarks by text
    searchBookmarks: (bookmarks: Bookmark[], query: string): Bookmark[] => {
        const searchText = query.toLowerCase()

        return bookmarks.filter(bookmark => {
            const searchableText = [
                bookmark.project.title,
                bookmark.project.abstract,
                bookmark.notes || '',
                ...bookmark.tags,
                bookmark.category?.name || '',
            ].join(' ').toLowerCase()

            return searchableText.includes(searchText)
        })
    },

    // Sort bookmarks
    sortBookmarks: (
        bookmarks: Bookmark[],
        sortBy: 'createdAt' | 'updatedAt' | 'title',
        sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Bookmark[] => {
        return [...bookmarks].sort((a, b) => {
            let aValue: string | Date
            let bValue: string | Date

            switch (sortBy) {
                case 'title':
                    aValue = a.project.title
                    bValue = b.project.title
                    break
                case 'updatedAt':
                    aValue = new Date(a.updatedAt)
                    bValue = new Date(b.updatedAt)
                    break
                case 'createdAt':
                default:
                    aValue = new Date(a.createdAt)
                    bValue = new Date(b.createdAt)
                    break
            }

            if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1
            if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1
            return 0
        })
    },

    // Get bookmark statistics
    getBookmarkStatistics: (bookmarks: Bookmark[]): {
        totalBookmarks: number
        categoriesCount: number
        tagsCount: number
        averageTagsPerBookmark: number
        mostUsedTags: Array<{ tag: string; count: number }>
        bookmarksByCategory: Array<{ category: string; count: number }>
    } => {
        const allTags = bookmarks.flatMap(b => b.tags)
        const uniqueTags = [...new Set(allTags)]
        const categories = [...new Set(bookmarks.map(b => b.category?.name || 'Uncategorized'))]

        // Count tag usage
        const tagCounts: Record<string, number> = {}
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })

        // Count bookmarks by category
        const categoryCounts: Record<string, number> = {}
        bookmarks.forEach(bookmark => {
            const categoryName = bookmark.category?.name || 'Uncategorized'
            categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1
        })

        return {
            totalBookmarks: bookmarks.length,
            categoriesCount: categories.length,
            tagsCount: uniqueTags.length,
            averageTagsPerBookmark: bookmarks.length > 0 ? allTags.length / bookmarks.length : 0,
            mostUsedTags: Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([tag, count]) => ({ tag, count })),
            bookmarksByCategory: Object.entries(categoryCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => ({ category, count })),
        }
    },

    // Validate bookmark data
    validateBookmarkData: (data: CreateBookmarkData | UpdateBookmarkData): string[] => {
        const errors: string[] = []

        if ('projectId' in data && !data.projectId) {
            errors.push('Project ID is required')
        }

        if (data.tags && data.tags.some(tag => tag.trim().length === 0)) {
            errors.push('Tags cannot be empty')
        }

        if (data.notes && data.notes.length > 1000) {
            errors.push('Notes cannot exceed 1000 characters')
        }

        return errors
    },

    // Generate bookmark export filename
    generateExportFilename: (format: string): string => {
        const timestamp = new Date().toISOString().split('T')[0]
        return `bookmarks-${timestamp}.${format}`
    },
}