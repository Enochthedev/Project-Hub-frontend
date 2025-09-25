import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useSupervisorStore } from '@/lib/stores/supervisor-store'
import SupervisorDashboard from '@/components/supervisor/supervisor-dashboard'

// Mock the stores
jest.mock('@/lib/stores/auth-store')
jest.mock('@/lib/stores/supervisor-store')

// Mock the child components
jest.mock('@/components/supervisor/student-progress-table', () => {
  return function MockStudentProgressTable() {
    return <div data-testid="student-progress-table">Student Progress Table</div>
  }
})

jest.mock('@/components/supervisor/at-risk-student-alert', () => {
  return function MockAtRiskStudentAlert({ student }: any) {
    return <div data-testid="at-risk-alert">{student.studentName} - {student.riskLevel}</div>
  }
})

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>
const mockUseSupervisorStore = useSupervisorStore as jest.MockedFunction<typeof useSupervisorStore>

const mockUser = {
  id: 'supervisor-1',
  email: 'supervisor@test.com',
  role: 'supervisor' as const,
  isEmailVerified: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockDashboard = {
  supervisorId: 'supervisor-1',
  supervisorName: 'Dr. Jane Smith',
  totalStudents: 8,
  metrics: {
    totalMilestones: 96,
    completedMilestones: 68,
    overdueMilestones: 5,
    blockedMilestones: 2,
    overallCompletionRate: 70.8,
    averageProgressVelocity: 1.5,
    atRiskStudentCount: 2,
  },
  studentSummaries: [],
  atRiskStudents: [
    {
      studentId: 'student-1',
      studentName: 'John Doe',
      riskLevel: 'high' as const,
      riskFactors: ['2 overdue milestones', 'No recent activity'],
      overdueMilestones: 2,
      blockedMilestones: 0,
      lastActivity: null,
      recommendedActions: ['Schedule meeting'],
      urgencyScore: 85,
    },
  ],
  recentActivity: [
    {
      studentId: 'student-2',
      studentName: 'Jane Smith',
      activity: 'Updated milestone: Literature Review',
      timestamp: '2024-03-15T10:30:00Z',
    },
  ],
  upcomingDeadlines: [
    {
      studentId: 'student-3',
      studentName: 'Bob Johnson',
      milestoneId: 'milestone-1',
      milestoneTitle: 'System Testing',
      dueDate: '2024-03-20',
      priority: 'high' as const,
      daysUntilDue: 5,
    },
  ],
  lastUpdated: '2024-03-15T10:30:00Z',
}

const mockAtRiskStudents = [
  {
    studentId: 'student-1',
    studentName: 'John Doe',
    riskLevel: 'high' as const,
    riskFactors: ['2 overdue milestones', 'No recent activity'],
    overdueMilestones: 2,
    blockedMilestones: 0,
    lastActivity: null,
    recommendedActions: ['Schedule meeting'],
    urgencyScore: 85,
  },
]

describe('SupervisorDashboard', () => {
  const mockFetchDashboard = jest.fn()
  const mockClearErrors = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      tokens: null,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      logoutFromAllDevices: jest.fn(),
      refreshTokens: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      resendEmailVerification: jest.fn(),
      clearError: jest.fn(),
      setUser: jest.fn(),
      setTokens: jest.fn(),
      initialize: jest.fn(),
    })

    mockUseSupervisorStore.mockReturnValue({
      dashboard: mockDashboard,
      studentProgress: [],
      atRiskStudents: mockAtRiskStudents,
      selectedStudent: null,
      currentReport: null,
      analytics: null,
      isDashboardLoading: false,
      isStudentProgressLoading: false,
      isAtRiskStudentsLoading: false,
      isStudentDetailsLoading: false,
      isReportLoading: false,
      isAnalyticsLoading: false,
      isExportLoading: false,
      dashboardError: null,
      studentProgressError: null,
      atRiskStudentsError: null,
      studentDetailsError: null,
      reportError: null,
      analyticsError: null,
      exportError: null,
      fetchDashboard: mockFetchDashboard,
      fetchStudentProgress: jest.fn(),
      fetchAtRiskStudents: jest.fn(),
      fetchStudentDetails: jest.fn(),
      generateReport: jest.fn(),
      exportReport: jest.fn(),
      fetchAnalytics: jest.fn(),
      clearErrors: mockClearErrors,
      clearSelectedStudent: jest.fn(),
    })
  })

  it('renders dashboard with supervisor name and metrics', () => {
    render(<SupervisorDashboard />)

    expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome back, Dr. Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument() // Total students
    expect(screen.getByText('70.8%')).toBeInTheDocument() // Completion rate
    expect(screen.getByText('2')).toBeInTheDocument() // At risk students
    expect(screen.getByText('5')).toBeInTheDocument() // Overdue milestones
  })

  it('calls fetchDashboard on mount when user is supervisor', () => {
    render(<SupervisorDashboard />)
    expect(mockFetchDashboard).toHaveBeenCalledTimes(1)
  })

  it('displays loading skeleton when dashboard is loading', () => {
    mockUseSupervisorStore.mockReturnValue({
      ...mockUseSupervisorStore(),
      isDashboardLoading: true,
      dashboard: null,
    })

    render(<SupervisorDashboard />)
    
    // Check for absence of main content when loading
    expect(screen.queryByText('Supervisor Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Welcome back, Dr. Jane Smith')).not.toBeInTheDocument()
  })

  it('displays error message when dashboard fails to load', () => {
    mockUseSupervisorStore.mockReturnValue({
      ...mockUseSupervisorStore(),
      dashboardError: 'Failed to load dashboard',
      dashboard: null,
    })

    render(<SupervisorDashboard />)
    
    expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('handles refresh button click', () => {
    render(<SupervisorDashboard />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
    
    expect(mockClearErrors).toHaveBeenCalled()
    expect(mockFetchDashboard).toHaveBeenCalledTimes(2) // Once on mount, once on refresh
  })

  it('displays at-risk students when present', () => {
    render(<SupervisorDashboard />)
    
    expect(screen.getByText('Students Requiring Attention')).toBeInTheDocument()
    expect(screen.getByTestId('at-risk-alert')).toBeInTheDocument()
    expect(screen.getByText('John Doe - high')).toBeInTheDocument()
  })

  it('displays recent activity when present', () => {
    render(<SupervisorDashboard />)
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Updated milestone: Literature Review')).toBeInTheDocument()
  })

  it('displays upcoming deadlines when present', () => {
    render(<SupervisorDashboard />)
    
    expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument()
    expect(screen.getByText('System Testing')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    expect(screen.getByText('5 days')).toBeInTheDocument()
  })

  it('includes student progress table', () => {
    render(<SupervisorDashboard />)
    
    expect(screen.getByText('Student Progress Overview')).toBeInTheDocument()
    expect(screen.getByTestId('student-progress-table')).toBeInTheDocument()
  })

  it('does not call fetchDashboard when user is not supervisor', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      user: { ...mockUser, role: 'student' },
    })

    render(<SupervisorDashboard />)
    expect(mockFetchDashboard).not.toHaveBeenCalled()
  })

  it('shows no data message when dashboard is null', () => {
    mockUseSupervisorStore.mockReturnValue({
      ...mockUseSupervisorStore(),
      dashboard: null,
      isDashboardLoading: false,
      dashboardError: null,
    })

    render(<SupervisorDashboard />)
    
    expect(screen.getByText('No dashboard data available')).toBeInTheDocument()
    expect(screen.getByText('Load Dashboard')).toBeInTheDocument()
  })

  it('handles retry button click in error state', () => {
    mockUseSupervisorStore.mockReturnValue({
      ...mockUseSupervisorStore(),
      dashboardError: 'Network error',
      dashboard: null,
    })

    render(<SupervisorDashboard />)
    
    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)
    
    expect(mockClearErrors).toHaveBeenCalled()
    expect(mockFetchDashboard).toHaveBeenCalled()
  })
})
