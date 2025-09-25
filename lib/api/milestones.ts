import apiClient from './client'
import type { Milestone } from './types'

export interface CreateMilestoneData {
    title: string
    description: string
    dueDate: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    projectId?: string
}

export interface UpdateMilestoneData {
    title?: string
    description?: string
    dueDate?: string
    status?: 'not_started' | 'in_progress' | 'completed' | 'overdue'
    priority?: 'low' | 'medium' | 'high' | 'critical'
    progress?: number
}

export interface MilestoneFilters {
    status?: string[]
    priority?: string[]
    projectId?: string
    dateFrom?: string
    dateTo?: string
    sortBy?: 'dueDate' | 'createdAt' | 'priority' | 'title'
    sortOrder?: 'asc' | 'desc'
}

export const milestoneApi = {
    // Get all milestones for the current user
    getMilestones: async (filters?: MilestoneFilters): Promise<Milestone[]> => {
        const response = await apiClient.get('/milestones', { params: filters })
        return response.data
    },

    // Get a specific milestone by ID
    getMilestone: async (id: string): Promise<Milestone> => {
        const response = await apiClient.get(`/milestones/${id}`)
        return response.data
    },

    // Create a new milestone
    createMilestone: async (data: CreateMilestoneData): Promise<Milestone> => {
        const response = await apiClient.post('/milestones', data)
        return response.data
    },

    // Update an existing milestone
    updateMilestone: async (id: string, data: UpdateMilestoneData): Promise<Milestone> => {
        const response = await apiClient.patch(`/milestones/${id}`, data)
        return response.data
    },

    // Delete a milestone
    deleteMilestone: async (id: string): Promise<void> => {
        await apiClient.delete(`/milestones/${id}`)
    },

    // Update milestone progress
    updateProgress: async (id: string, progress: number): Promise<Milestone> => {
        const response = await apiClient.patch(`/milestones/${id}/progress`, { progress })
        return response.data
    },

    // Get milestone templates
    getTemplates: async (): Promise<any[]> => {
        const response = await apiClient.get('/milestones/templates')
        return response.data
    }
}
