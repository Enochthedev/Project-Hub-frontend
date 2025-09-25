import { create } from 'zustand'
import {
    supervisorApi,
    SupervisorDashboard,
    StudentProgressSummary,
    AtRiskStudent,
    SupervisorReport,
    SupervisorAnalytics,
    StudentMilestoneOverview,
    ProgressReportFilters,
    ExportableReport,
    ProjectSubmission,
    ProjectApprovalQueue,
    ProjectAnalytics,
    ProjectFeedback,
    ApproveProjectRequest,
    RejectProjectRequest
} from '@/lib/api/supervisor'

interface SupervisorState {
    // Dashboard data
    dashboard: SupervisorDashboard | null
    studentProgress: StudentProgressSummary[]
    atRiskStudents: AtRiskStudent[]

    // Individual student data
    selectedStudent: StudentMilestoneOverview | null

    // Reports and analytics
    currentReport: SupervisorReport | null
    analytics: SupervisorAnalytics | null

    // Project management data
    myProjects: ProjectSubmission[]
    projectApprovalQueue: ProjectApprovalQueue | null
    projectAnalytics: ProjectAnalytics | null
    selectedProject: ProjectSubmission | null
    projectFeedback: ProjectFeedback[]

    // Loading states
    isDashboardLoading: boolean
    isStudentProgressLoading: boolean
    isAtRiskStudentsLoading: boolean
    isStudentDetailsLoading: boolean
    isReportLoading: boolean
    isAnalyticsLoading: boolean
    isExportLoading: boolean
    isProjectsLoading: boolean
    isProjectApprovalQueueLoading: boolean
    isProjectAnalyticsLoading: boolean
    isProjectFeedbackLoading: boolean
    isProjectActionLoading: boolean

    // Error states
    dashboardError: string | null
    studentProgressError: string | null
    atRiskStudentsError: string | null
    studentDetailsError: string | null
    reportError: string | null
    analyticsError: string | null
    exportError: string | null
    projectsError: string | null
    projectApprovalQueueError: string | null
    projectAnalyticsError: string | null
    projectFeedbackError: string | null
    projectActionError: string | null

    // Actions
    fetchDashboard: () => Promise<void>
    fetchStudentProgress: () => Promise<void>
    fetchAtRiskStudents: () => Promise<void>
    fetchStudentDetails: (studentId: string) => Promise<void>
    generateReport: (filters?: ProgressReportFilters) => Promise<void>
    exportReport: (format: 'pdf' | 'csv', filters?: ProgressReportFilters) => Promise<ExportableReport>
    fetchAnalytics: () => Promise<void>
    clearErrors: () => void
    clearSelectedStudent: () => void

    // Project management actions
    fetchMyProjects: (params?: any) => Promise<void>
    fetchProjectApprovalQueue: () => Promise<void>
    fetchProjectAnalytics: () => Promise<void>
    fetchProjectFeedback: (projectId: string) => Promise<void>
    approveProject: (projectId: string, data: ApproveProjectRequest) => Promise<void>
    rejectProject: (projectId: string, data: RejectProjectRequest) => Promise<void>
    selectProject: (project: ProjectSubmission) => void
    clearSelectedProject: () => void
}

export const useSupervisorStore = create<SupervisorState>((set, get) => ({
    // Initial state
    dashboard: null,
    studentProgress: [],
    atRiskStudents: [],
    selectedStudent: null,
    currentReport: null,
    analytics: null,

    // Project management initial state
    myProjects: [],
    projectApprovalQueue: null,
    projectAnalytics: null,
    selectedProject: null,
    projectFeedback: [],

    // Loading states
    isDashboardLoading: false,
    isStudentProgressLoading: false,
    isAtRiskStudentsLoading: false,
    isStudentDetailsLoading: false,
    isReportLoading: false,
    isAnalyticsLoading: false,
    isExportLoading: false,
    isProjectsLoading: false,
    isProjectApprovalQueueLoading: false,
    isProjectAnalyticsLoading: false,
    isProjectFeedbackLoading: false,
    isProjectActionLoading: false,

    // Error states
    dashboardError: null,
    studentProgressError: null,
    atRiskStudentsError: null,
    studentDetailsError: null,
    reportError: null,
    analyticsError: null,
    exportError: null,
    projectsError: null,
    projectApprovalQueueError: null,
    projectAnalyticsError: null,
    projectFeedbackError: null,
    projectActionError: null,

    // Actions
    fetchDashboard: async () => {
        set({ isDashboardLoading: true, dashboardError: null })

        try {
            const response = await supervisorApi.getDashboard()
            set({
                dashboard: response.data!,
                isDashboardLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard'
            set({
                dashboardError: errorMessage,
                isDashboardLoading: false
            })
            throw error
        }
    },

    fetchStudentProgress: async () => {
        set({ isStudentProgressLoading: true, studentProgressError: null })

        try {
            const response = await supervisorApi.getStudentsProgress()
            set({
                studentProgress: response.data!,
                isStudentProgressLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch student progress'
            set({
                studentProgressError: errorMessage,
                isStudentProgressLoading: false
            })
            throw error
        }
    },

    fetchAtRiskStudents: async () => {
        set({ isAtRiskStudentsLoading: true, atRiskStudentsError: null })

        try {
            const response = await supervisorApi.getAtRiskStudentAlerts()
            set({
                atRiskStudents: response.data!,
                isAtRiskStudentsLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch at-risk students'
            set({
                atRiskStudentsError: errorMessage,
                isAtRiskStudentsLoading: false
            })
            throw error
        }
    },

    fetchStudentDetails: async (studentId: string) => {
        set({ isStudentDetailsLoading: true, studentDetailsError: null })

        try {
            const response = await supervisorApi.getStudentMilestoneOverview(studentId)
            set({
                selectedStudent: response.data!,
                isStudentDetailsLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch student details'
            set({
                studentDetailsError: errorMessage,
                isStudentDetailsLoading: false
            })
            throw error
        }
    },

    generateReport: async (filters?: ProgressReportFilters) => {
        set({ isReportLoading: true, reportError: null })

        try {
            const response = await supervisorApi.generateProgressReport(filters)
            set({
                currentReport: response.data!,
                isReportLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to generate report'
            set({
                reportError: errorMessage,
                isReportLoading: false
            })
            throw error
        }
    },

    exportReport: async (format: 'pdf' | 'csv', filters?: ProgressReportFilters) => {
        set({ isExportLoading: true, exportError: null })

        try {
            const response = await supervisorApi.exportProgressReport(format, filters)
            set({ isExportLoading: false })
            return response.data!
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to export report'
            set({
                exportError: errorMessage,
                isExportLoading: false
            })
            throw error
        }
    },

    fetchAnalytics: async () => {
        set({ isAnalyticsLoading: true, analyticsError: null })

        try {
            const response = await supervisorApi.getSupervisorAnalytics()
            set({
                analytics: response.data!,
                isAnalyticsLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch analytics'
            set({
                analyticsError: errorMessage,
                isAnalyticsLoading: false
            })
            throw error
        }
    },

    clearErrors: () => {
        set({
            dashboardError: null,
            studentProgressError: null,
            atRiskStudentsError: null,
            studentDetailsError: null,
            reportError: null,
            analyticsError: null,
            exportError: null,
            projectsError: null,
            projectApprovalQueueError: null,
            projectAnalyticsError: null,
            projectFeedbackError: null,
            projectActionError: null,
        })
    },

    clearSelectedStudent: () => {
        set({ selectedStudent: null })
    },

    // Project management actions
    fetchMyProjects: async (params?: any) => {
        set({ isProjectsLoading: true, projectsError: null })

        try {
            const response = await supervisorApi.getMyProjects(params)
            set({
                myProjects: response.data!.projects,
                isProjectsLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch projects'
            set({
                projectsError: errorMessage,
                isProjectsLoading: false
            })
            throw error
        }
    },

    fetchProjectApprovalQueue: async () => {
        set({ isProjectApprovalQueueLoading: true, projectApprovalQueueError: null })

        try {
            const response = await supervisorApi.getProjectApprovalQueue()
            set({
                projectApprovalQueue: response.data!,
                isProjectApprovalQueueLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch approval queue'
            set({
                projectApprovalQueueError: errorMessage,
                isProjectApprovalQueueLoading: false
            })
            throw error
        }
    },

    fetchProjectAnalytics: async () => {
        set({ isProjectAnalyticsLoading: true, projectAnalyticsError: null })

        try {
            const response = await supervisorApi.getMyProjectAnalytics()
            set({
                projectAnalytics: response.data!,
                isProjectAnalyticsLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch project analytics'
            set({
                projectAnalyticsError: errorMessage,
                isProjectAnalyticsLoading: false
            })
            throw error
        }
    },

    fetchProjectFeedback: async (projectId: string) => {
        set({ isProjectFeedbackLoading: true, projectFeedbackError: null })

        try {
            const response = await supervisorApi.getProjectFeedback(projectId)
            set({
                projectFeedback: response.data!,
                isProjectFeedbackLoading: false
            })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch project feedback'
            set({
                projectFeedbackError: errorMessage,
                isProjectFeedbackLoading: false
            })
            throw error
        }
    },

    approveProject: async (projectId: string, data: ApproveProjectRequest) => {
        set({ isProjectActionLoading: true, projectActionError: null })

        try {
            const response = await supervisorApi.approveProject(projectId, data)

            // Update the project in the approval queue
            const { projectApprovalQueue } = get()
            if (projectApprovalQueue) {
                const updatedProjects = projectApprovalQueue.projects.map(project =>
                    project.id === projectId
                        ? { ...project, approvalStatus: 'approved' as const, approvalNotes: data.notes }
                        : project
                )
                set({
                    projectApprovalQueue: {
                        ...projectApprovalQueue,
                        projects: updatedProjects,
                        approved: projectApprovalQueue.approved + 1,
                        pending: projectApprovalQueue.pending - 1
                    }
                })
            }

            set({ isProjectActionLoading: false })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to approve project'
            set({
                projectActionError: errorMessage,
                isProjectActionLoading: false
            })
            throw error
        }
    },

    rejectProject: async (projectId: string, data: RejectProjectRequest) => {
        set({ isProjectActionLoading: true, projectActionError: null })

        try {
            await supervisorApi.rejectProject(projectId, data)

            // Update the project in the approval queue
            const { projectApprovalQueue } = get()
            if (projectApprovalQueue) {
                const updatedProjects = projectApprovalQueue.projects.map(project =>
                    project.id === projectId
                        ? { ...project, approvalStatus: 'rejected' as const, rejectionReason: data.reason }
                        : project
                )
                set({
                    projectApprovalQueue: {
                        ...projectApprovalQueue,
                        projects: updatedProjects,
                        rejected: projectApprovalQueue.rejected + 1,
                        pending: projectApprovalQueue.pending - 1
                    }
                })
            }

            set({ isProjectActionLoading: false })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to reject project'
            set({
                projectActionError: errorMessage,
                isProjectActionLoading: false
            })
            throw error
        }
    },

    selectProject: (project: ProjectSubmission) => {
        set({ selectedProject: project })
    },

    clearSelectedProject: () => {
        set({ selectedProject: null })
    },
}))
