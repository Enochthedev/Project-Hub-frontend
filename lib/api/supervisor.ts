import { api } from './client'
import { ApiResponse } from './types'

// Supervisor-specific types based on backend DTOs
export interface StudentProgressSummary {
    studentId: string
    studentName: string
    studentEmail: string
    totalMilestones: number
    completedMilestones: number
    inProgressMilestones: number
    overdueMilestones: number
    blockedMilestones: number
    completionRate: number
    riskScore: number
    nextMilestone: {
        id: string
        title: string
        dueDate: string
        priority: 'low' | 'medium' | 'high' | 'critical'
    } | null
    lastActivity: string | null
    projectCount: number
}

export interface AtRiskStudent {
    studentId: string
    studentName: string
    riskLevel: 'low' | 'medium' | 'high'
    riskFactors: string[]
    overdueMilestones: number
    blockedMilestones: number
    lastActivity: string | null
    recommendedActions: string[]
    urgencyScore: number
}

export interface ReportMetrics {
    totalMilestones: number
    completedMilestones: number
    overdueMilestones: number
    blockedMilestones: number
    overallCompletionRate: number
    averageProgressVelocity: number
    atRiskStudentCount: number
}

export interface SupervisorDashboard {
    supervisorId: string
    supervisorName: string
    totalStudents: number
    metrics: ReportMetrics
    studentSummaries: StudentProgressSummary[]
    atRiskStudents: AtRiskStudent[]
    recentActivity: Array<{
        studentId: string
        studentName: string
        activity: string
        timestamp: string
    }>
    upcomingDeadlines: Array<{
        studentId: string
        studentName: string
        milestoneId: string
        milestoneTitle: string
        dueDate: string
        priority: 'low' | 'medium' | 'high' | 'critical'
        daysUntilDue: number
    }>
    lastUpdated: string
}

export interface ProgressReportFilters {
    studentIds?: string[]
    startDate?: string
    endDate?: string
    status?: 'not_started' | 'in_progress' | 'completed' | 'overdue'
    priority?: 'low' | 'medium' | 'high' | 'critical'
}

export interface SupervisorReport {
    reportId: string
    supervisorId: string
    generatedAt: string
    reportPeriod: {
        startDate: string | null
        endDate: string | null
    }
    filters: ProgressReportFilters
    metrics: ReportMetrics
    studentData: Array<{
        studentId: string
        studentName: string
        milestones: Array<{
            id: string
            title: string
            status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
            priority: 'low' | 'medium' | 'high' | 'critical'
            dueDate: string
            isOverdue: boolean
            projectTitle: string
        }>
        progressSummary: StudentProgressSummary
    }>
    summary: {
        totalStudents: number
        totalMilestones: number
        completionRate: number
        atRiskStudents: number
    }
}

export interface StudentMilestoneOverview {
    studentId: string
    studentName: string
    studentEmail: string
    milestones: Array<{
        id: string
        title: string
        description: string
        status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
        priority: 'low' | 'medium' | 'high' | 'critical'
        dueDate: string
        estimatedHours: number
        actualHours: number
        isOverdue: boolean
        projectTitle: string
        notesCount: number
        lastUpdated: string
    }>
    analytics: any // Will be defined based on AnalyticsMetricsDto
    progressSummary: StudentProgressSummary
    lastUpdated: string
}

export interface SupervisorAnalytics {
    supervisorId: string
    totalStudents: number
    overallMetrics: ReportMetrics
    studentPerformance: {
        topPerformers: Array<{
            studentId: string
            studentName: string
            completionRate: number
        }>
        strugglingStudents: Array<{
            studentId: string
            studentName: string
            completionRate: number
        }>
        averageCompletionRate: number
        performanceDistribution: {
            excellent: number
            good: number
            average: number
            poor: number
        }
    }
    trendAnalysis: {
        completionTrend: 'improving' | 'stable' | 'declining'
        velocityTrend: 'improving' | 'stable' | 'declining'
        riskTrend: 'decreasing' | 'stable' | 'increasing'
        monthlyProgress: Array<{
            month: string
            completionRate: number
        }>
    }
    benchmarks: {
        departmentAverage: number
        universityAverage: number
        performanceRanking: 'excellent' | 'above_average' | 'average' | 'below_average'
    }
    insights: string[]
    generatedAt: string
}

export interface ExportableReport {
    reportId: string
    format: 'pdf' | 'csv'
    filename: string
    content: string
    mimeType: string
    size: number
    generatedAt: string
}

// Project Management Types
export interface ProjectSubmission {
    id: string
    title: string
    abstract: string
    description: string
    specialization: string
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    tags: string[]
    requiredSkills: string[]
    learningOutcomes: string[]
    isGroupProject: boolean
    maxGroupSize?: number
    estimatedDuration: string
    technologyStack: string[]
    status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived'
    approvalStatus: 'pending' | 'approved' | 'rejected'
    isAvailable: boolean
    applicationDeadline?: string
    createdAt: string
    updatedAt: string
    approvedAt?: string
    rejectedAt?: string
    approvalNotes?: string
    rejectionReason?: string
    viewCount: number
    bookmarkCount: number
    supervisor?: {
        id: string
        name: string
        title: string
        department: string
    }
}

export interface ProjectApprovalQueue {
    projects: ProjectSubmission[]
    total: number
    pending: number
    approved: number
    rejected: number
}

export interface ProjectFeedback {
    id: string
    projectId: string
    adminId: string
    adminName: string
    type: 'approval' | 'rejection' | 'revision_request'
    message: string
    suggestions?: string[]
    createdAt: string
}

export interface ProjectAnalytics {
    totalProjects: number
    approvedProjects: number
    pendingProjects: number
    rejectedProjects: number
    totalViews: number
    totalBookmarks: number
    popularityScore: number
    projectsByYear: Record<string, number>
    projectsBySpecialization: Record<string, number>
    approvalRate: number
    averageApprovalTime: number
}

export interface ApproveProjectRequest {
    notes?: string
}

export interface RejectProjectRequest {
    reason: string
    suggestions?: string[]
}

// API functions
export const supervisorApi = {
    // Get supervisor dashboard
    getDashboard: (): Promise<ApiResponse<SupervisorDashboard>> =>
        api.get('/supervisor/dashboard'),

    // Get students progress overview
    getStudentsProgress: (): Promise<ApiResponse<StudentProgressSummary[]>> =>
        api.get('/supervisor/students/progress'),

    // Get detailed student milestone overview
    getStudentMilestoneOverview: (studentId: string): Promise<ApiResponse<StudentMilestoneOverview>> =>
        api.get(`/supervisor/students/${studentId}/overview`),

    // Get at-risk student alerts
    getAtRiskStudentAlerts: (): Promise<ApiResponse<AtRiskStudent[]>> =>
        api.get('/supervisor/alerts'),

    // Generate progress reports
    generateProgressReport: (filters?: ProgressReportFilters): Promise<ApiResponse<SupervisorReport>> =>
        api.get('/supervisor/reports', { params: filters }),

    // Export progress reports
    exportProgressReport: (
        format: 'pdf' | 'csv',
        filters?: ProgressReportFilters
    ): Promise<ApiResponse<ExportableReport>> =>
        api.get('/supervisor/reports/export', { params: { format, ...filters } }),

    // Get supervisor analytics
    getSupervisorAnalytics: (): Promise<ApiResponse<SupervisorAnalytics>> =>
        api.get('/supervisor/analytics'),

    // Project Management APIs
    // Get supervisor's projects
    getMyProjects: (params?: {
        status?: 'pending' | 'approved' | 'rejected'
        year?: number
        specialization?: string
        limit?: number
        offset?: number
        sortBy?: 'date' | 'title' | 'status'
        sortOrder?: 'asc' | 'desc'
    }): Promise<ApiResponse<{ projects: ProjectSubmission[], total: number }>> =>
        api.get('/projects/my-projects', { params }),

    // Get project analytics for supervisor
    getMyProjectAnalytics: (): Promise<ApiResponse<ProjectAnalytics>> =>
        api.get('/projects/my-projects/analytics'),

    // Get project approval queue (for supervisors to see their pending projects)
    getProjectApprovalQueue: (): Promise<ApiResponse<ProjectApprovalQueue>> =>
        api.get('/admin/projects/pending'),

    // Get project feedback
    getProjectFeedback: (projectId: string): Promise<ApiResponse<ProjectFeedback[]>> =>
        api.get(`/admin/projects/${projectId}/feedback`),

    // Approve project (admin only)
    approveProject: (projectId: string, data: ApproveProjectRequest): Promise<ApiResponse<ProjectSubmission>> =>
        api.patch(`/admin/projects/${projectId}/approve`, data),

    // Reject project (admin only)
    rejectProject: (projectId: string, data: RejectProjectRequest): Promise<ApiResponse<{ message: string }>> =>
        api.patch(`/admin/projects/${projectId}/reject`, data),

    // Get project details for review
    getProjectForReview: (projectId: string): Promise<ApiResponse<ProjectSubmission>> =>
        api.get(`/admin/projects/${projectId}`),
}