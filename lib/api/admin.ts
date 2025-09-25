import { api } from './client'

// Admin Analytics Types
export interface DashboardMetrics {
    totalUsers: number
    activeUsers: number
    totalProjects: number
    pendingApprovals: number
    systemHealth: number
    userGrowthRate: number
    projectCompletionRate: number
    averageResponseTime: number
}

export interface UserGrowthData {
    date: string
    students: number
    supervisors: number
    total: number
}

export interface ProjectStatusData {
    status: string
    count: number
    percentage: number
}

export interface SupervisorWorkloadData {
    supervisorId: string
    name: string
    department: string
    currentStudents: number
    maxCapacity: number
    utilizationRate: number
}

export interface SystemHealthData {
    timestamp: string
    cpuUsage: number
    memoryUsage: number
    responseTime: number
    errorRate: number
}

export interface AnalyticsFilters {
    dateRange: {
        start: string
        end: string
    }
    granularity?: 'hour' | 'day' | 'week' | 'month'
    category?: string
}

export interface DrillDownData {
    metric: string
    filters: Record<string, any>
    data: any[]
    total: number
    breakdown: Record<string, number>
}

// User Management Types
export interface UserStats {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    unverifiedUsers: number
    newUsersThisMonth: number
    growthRate: number
    studentCount: number
    supervisorCount: number
    adminCount: number
}

export interface CreateUserData {
    email: string
    password: string
    role: 'student' | 'supervisor' | 'admin'
    isActive: boolean
    isEmailVerified: boolean
    profile?: any
}

export interface UpdateUserData {
    email?: string
    role?: 'student' | 'supervisor' | 'admin'
    isActive?: boolean
    isEmailVerified?: boolean
    profile?: any
}

// Admin API Functions
export const adminApi = {
    // Dashboard Metrics
    getDashboardMetrics: () =>
        api.get<DashboardMetrics>('/admin/dashboard/metrics'),

    // User Analytics
    getUserGrowthData: (filters: AnalyticsFilters) =>
        api.get<UserGrowthData[]>('/admin/analytics/user-growth', { params: filters }),

    getUserAnalytics: (filters: AnalyticsFilters) =>
        api.get<any>('/admin/analytics/users', { params: filters }),

    // Project Analytics
    getProjectStatusData: (filters: AnalyticsFilters) =>
        api.get<ProjectStatusData[]>('/admin/analytics/project-status', { params: filters }),

    getProjectAnalytics: (filters: AnalyticsFilters) =>
        api.get<any>('/admin/analytics/projects', { params: filters }),

    // Supervisor Analytics
    getSupervisorWorkloadData: (filters: AnalyticsFilters) =>
        api.get<SupervisorWorkloadData[]>('/admin/analytics/supervisor-workload', { params: filters }),

    // System Health
    getSystemHealthData: (filters: AnalyticsFilters) =>
        api.get<SystemHealthData[]>('/admin/analytics/system-health', { params: filters }),

    // Drill-down Data
    getDrillDownData: (metric: string, filters: Record<string, any>) =>
        api.get<DrillDownData>(`/admin/analytics/drill-down/${metric}`, { params: filters }),

    // Export Data
    exportAnalytics: (type: string, filters: AnalyticsFilters, format: 'csv' | 'excel' | 'pdf') =>
        api.get(`/admin/analytics/export/${type}`, {
            params: { ...filters, format },
            responseType: 'blob'
        }),

    // User Management
    getUsers: () =>
        api.get<any[]>('/admin/users'),

    getUserStats: () =>
        api.get<UserStats>('/admin/users/stats'),

    createUser: (userData: CreateUserData) =>
        api.post<any>('/admin/users', userData),

    updateUser: (userId: string, userData: UpdateUserData) =>
        api.put<any>(`/admin/users/${userId}`, userData),

    deleteUser: (userId: string) =>
        api.delete(`/admin/users/${userId}`),

    toggleUserStatus: (userId: string, isActive: boolean) =>
        api.patch(`/admin/users/${userId}/status`, { isActive }),

    sendVerificationEmail: (userId: string) =>
        api.post(`/admin/users/${userId}/send-verification`),

    bulkUserAction: (action: string, userIds: string[]) =>
        api.post('/admin/users/bulk-action', { action, userIds }),

    exportUsers: (format: 'csv' | 'excel') =>
        api.get('/admin/users/export', {
            params: { format },
            responseType: 'blob'
        }),

    // Content Moderation
    getContentItems: () =>
        api.get<any[]>('/admin/content'),

    getContentStats: () =>
        api.get<any>('/admin/content/stats'),

    approveContent: (itemId: string, notes?: string) =>
        api.post(`/admin/content/${itemId}/approve`, { notes }),

    rejectContent: (itemId: string, reason: string) =>
        api.post(`/admin/content/${itemId}/reject`, { reason }),

    flagContent: (itemId: string, reason: string) =>
        api.post(`/admin/content/${itemId}/flag`, { reason }),

    bulkContentAction: (action: string, itemIds: string[], notes?: string) =>
        api.post('/admin/content/bulk-action', { action, itemIds, notes }),

    exportContentReport: (format: 'csv' | 'excel') =>
        api.get('/admin/content/export', {
            params: { format },
            responseType: 'blob'
        }),

    // System Configuration
    getSystemSettings: () =>
        api.get<any>('/admin/system/settings'),

    updateSystemSettings: (settings: any) =>
        api.put('/admin/system/settings', settings),

    resetSystemSettings: () =>
        api.post('/admin/system/settings/reset'),

    getSystemStatus: () =>
        api.get<any>('/admin/system/status'),

    // Academic Calendar
    getAcademicEvents: () =>
        api.get<any[]>('/admin/academic-calendar/events'),

    createAcademicEvent: (event: any) =>
        api.post<any>('/admin/academic-calendar/events', event),

    updateAcademicEvent: (eventId: string, event: any) =>
        api.put<any>(`/admin/academic-calendar/events/${eventId}`, event),

    deleteAcademicEvent: (eventId: string) =>
        api.delete(`/admin/academic-calendar/events/${eventId}`),

    importAcademicCalendar: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/admin/academic-calendar/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    exportAcademicCalendar: () =>
        api.get('/admin/academic-calendar/export', {
            responseType: 'blob'
        }),

    // Notification Settings
    getNotificationSettings: () =>
        api.get<any>('/admin/notifications/settings'),

    updateNotificationSettings: (settings: any) =>
        api.put('/admin/notifications/settings', settings),
}
