import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSupervisorStore } from '@/lib/stores/supervisor-store'
import ProjectApprovalQueue from '@/components/supervisor/project-approval-queue'
import ProjectAnalytics from '@/components/supervisor/project-analytics'

// Mock the store
jest.mock('@/lib/stores/supervisor-store')

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Cell: () => <div data-testid="cell" />,
}))

const mockUseSupervisorStore = useSupervisorStore as jest.MockedFunction<typeof useSupervisorStore>

const mockProjectApprovalQueue = {
  projects: [
    {
      id: 'project-1',
      title: 'AI-Powered Recommendation System',
      abstract: 'A machine learning system for personalized recommendations',
      description: 'Detailed description of the project...',
      specialization: 'Artificial Intelligence',
      difficultyLevel: 'advanced' as const,
      tags: ['AI', 'Machine Learning', 'Python'],
      requiredSkills: ['Python', 'TensorFlow', 'Data Analysis'],
      learningOutcomes: ['ML algorithms', 'Data processing'],
      isGroupProject: false,
      maxGroupSize: undefined,
      estimatedDuration: '6 months',
      technologyStack: ['Python', 'TensorFlow', 'PostgreSQL'],
      status: 'pending_approval' as const,
      approvalStatus: 'pending' as const,
      isAvailable: false,
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z',
      viewCount: 25,
      bookmarkCount: 8,
      supervisor: {
        id: 'supervisor-1',
        name: 'Dr. Jane Smith',
        title: 'Professor',
        department: 'Computer Science'
      }
    },
    {
      id: 'project-2',
      title: 'Blockchain Voting System',
      abstract: 'A secure voting system using blockchain technology',
      description: 'Detailed description of the blockchain project...',
      specialization: 'Cybersecurity',
      difficultyLevel: 'expert' as const,
      tags: ['Blockchain', 'Security', 'Voting'],
      requiredSkills: ['Solidity', 'Web3', 'Cryptography'],
      learningOutcomes: ['Blockchain development', 'Smart contracts'],
      isGroupProject: true,
      maxGroupSize: 3,
      estimatedDuration: '8 months',
      technologyStack: ['Solidity', 'React', 'Node.js'],
      status: 'approved' as const,
      approvalStatus: 'approved' as const,
      isAvailable: true,
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2024-03-10T00:00:00Z',
      approvedAt: '2024-03-10T00:00:00Z',
      approvalNotes: 'Excellent project with clear objectives',
      viewCount: 45,
      bookmarkCount: 15,
      supervisor: {
        id: 'supervisor-2',
        name: 'Dr. Bob Johnson',
        title: 'Associate Professor',
        department: 'Computer Science'
      }
    }
  ],
  total: 2,
  pending: 1,
  approved: 1,
  rejected: 0
}

const mockProjectAnalytics = {
  totalProjects: 10,
  approvedProjects: 7,
  pendingProjects: 2,
  rejectedProjects: 1,
  totalViews: 250,
  totalBookmarks: 85,
  popularityScore: 7.5,
  projectsByYear: {
    '2023': 4,
    '2024': 6
  },
  projectsBySpecialization: {
    'Artificial Intelligence': 3,
    'Web Development': 2,
    'Cybersecurity': 2,
    'Data Science': 2,
    'Mobile Development': 1
  },
  approvalRate: 70.0,
  averageApprovalTime: 5.2
}

describe('ProjectApprovalQueue', () => {
  const mockFetchProjectApprovalQueue = jest.fn()
  const mockApproveProject = jest.fn()
  const mockRejectProject = jest.fn()
  const mockSelectProject = jest.fn()
  const mockClearErrors = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseSupervisorStore.mockReturnValue({
      dashboard: null,
      studentProgress: [],
      atRiskStudents: [],
      selectedStudent: null,
      currentReport: null,
      analytics: null,
      myProjects: [],
      projectApprovalQueue: mockProjectApprovalQueue,
      projectAnalytics: null,
      selectedProject: null,
      projectFeedback: [],
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
      fetchDashboard: jest.fn(),
      fetchStudentProgress: jest.fn(),
      fetchAtRiskStudents: jest.fn(),
      fetchStudentDetails: jest.fn(),
      generateReport: jest.fn(),
      exportReport: jest.fn(),
      fetchAnalytics: jest.fn(),
      clearErrors: mockClearErrors,
      clearSelectedStudent: jest.fn(),
      fetchMyProjects: jest.fn(),
      fetchProjectApprovalQueue: mockFetchProjectApprovalQueue,
      fetchProjectAnalytics: jest.fn(),
      fetchProjectFeedback: jest.fn(),
      approveProject: mockApproveProject,
      rejectProject: mockRejectProject,
      selectProject: mockSelectProject,
      clearSelectedProject: jest.fn(),
    })
  })

  it('renders approval queue with project statistics', () => {
    render(<ProjectApprovalQueue />)

    // Use more specific queries for the statistics
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('Pending Review')).toBeInTheDocument()
    expect(screen.getAllByText('Approved')).toHaveLength(2) // One in header, one in badge
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('displays project cards with correct information', () => {
    render(<ProjectApprovalQueue />)

    expect(screen.getByText('AI-Powered Recommendation System')).toBeInTheDocument()
    expect(screen.getByText('Blockchain Voting System')).toBeInTheDocument()
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Dr. Bob Johnson')).toBeInTheDocument()
    expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Cybersecurity')).toBeInTheDocument()
  })

  it('shows pending status for pending projects', () => {
    render(<ProjectApprovalQueue />)

    const pendingBadges = screen.getAllByText('Pending')
    expect(pendingBadges.length).toBeGreaterThan(0)
  })

  it('shows approved status for approved projects', () => {
    render(<ProjectApprovalQueue />)

    const approvedBadges = screen.getAllByText('Approved')
    expect(approvedBadges.length).toBeGreaterThan(0)
  })

  it('displays approval notes for approved projects', () => {
    render(<ProjectApprovalQueue />)

    expect(screen.getByText('Excellent project with clear objectives')).toBeInTheDocument()
  })

  it('shows approve and reject buttons for pending projects', () => {
    render(<ProjectApprovalQueue />)

    const approveButtons = screen.getAllByText('Approve')
    const rejectButtons = screen.getAllByText('Reject')
    
    expect(approveButtons.length).toBeGreaterThan(0)
    expect(rejectButtons.length).toBeGreaterThan(0)
  })

  it('opens approval dialog when approve button is clicked', async () => {
    render(<ProjectApprovalQueue />)

    const approveButton = screen.getAllByText('Approve')[0]
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Approval Notes (Optional)')).toBeInTheDocument()
    })
  })

  it('opens rejection dialog when reject button is clicked', async () => {
    render(<ProjectApprovalQueue />)

    const rejectButton = screen.getAllByText('Reject')[0]
    fireEvent.click(rejectButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Rejection Reason *')).toBeInTheDocument()
    })
  })

  it('calls approveProject when approval is confirmed', async () => {
    render(<ProjectApprovalQueue />)

    const approveButton = screen.getAllByText('Approve')[0]
    fireEvent.click(approveButton)

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /approve project/i })
      fireEvent.click(confirmButton)
    })

    expect(mockApproveProject).toHaveBeenCalledWith('project-1', { notes: undefined })
  })

  it('calls rejectProject when rejection is confirmed with reason', async () => {
    render(<ProjectApprovalQueue />)

    const rejectButton = screen.getAllByText('Reject')[0]
    fireEvent.click(rejectButton)

    await waitFor(() => {
      const reasonTextarea = screen.getByPlaceholderText('Explain why this project is being rejected...')
      fireEvent.change(reasonTextarea, { target: { value: 'Insufficient detail in requirements' } })

      const confirmButton = screen.getByRole('button', { name: /reject project/i })
      fireEvent.click(confirmButton)
    })

    expect(mockRejectProject).toHaveBeenCalledWith('project-1', {
      reason: 'Insufficient detail in requirements',
      suggestions: undefined
    })
  })

  it('calls selectProject when view details is clicked', () => {
    render(<ProjectApprovalQueue />)

    const viewDetailsButtons = screen.getAllByText('View Details')
    fireEvent.click(viewDetailsButtons[0])

    expect(mockSelectProject).toHaveBeenCalledWith(mockProjectApprovalQueue.projects[0])
  })

  it('fetches approval queue on mount', () => {
    render(<ProjectApprovalQueue />)
    expect(mockFetchProjectApprovalQueue).toHaveBeenCalledTimes(1)
  })

  it('displays loading state', () => {
    mockUseSupervisorStore.mockReturnValue({
      ...mockUseSupervisorStore(),
      isProjectApprovalQueueLoading: true,
      projectApprovalQueue: null,
    })

    render(<ProjectApprovalQueue />)
    
    // Should show skeleton loading state
    expect(screen.queryByText('AI-Powered Recommendation System')).not.toBeInTheDocument()
  })

  it('displays error state with retry button', () => {
    mockUseSupervisorStore.mockReturnValue({
      ...mockUseSupervisorStore(),
      projectApprovalQueueError: 'Failed to load approval queue',
      projectApprovalQueue: null,
    })

    render(<ProjectApprovalQueue />)
    
    expect(screen.getByText('Failed to load approval queue')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })
})

describe('ProjectAnalytics', () => {
  const mockFetchProjectAnalytics = jest.fn()
  const mockClearErrors = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseSupervisorStore.mockReturnValue({
      dashboard: null,
      studentProgress: [],
      atRiskStudents: [],
      selectedStudent: null,
      currentReport: null,
      analytics: null,
      myProjects: [],
      projectApprovalQueue: null,
      projectAnalytics: mockProjectAnalytics,
      selectedProject: null,
      projectFeedback: [],
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
      fetchDashboard: jest.fn(),
      fetchStudentProgress: jest.fn(),
      fetchAtRiskStudents: jest.fn(),
      fetchStudentDetails: jest.fn(),
      generateReport: jest.fn(),
      exportReport: jest.fn(),
      fetchAnalytics: jest.fn(),
      clearErrors: mockClearErrors,
      clearSelectedStudent: jest.fn(),
      fetchMyProjects: jest.fn(),
      fetchProjectApprovalQueue: jest.fn(),
      fetchProjectAnalytics: mockFetchProjectAnalytics,
      fetchProjectFeedback: jest.fn(),
      approveProject: jest.fn(),
      rejectProject: jest.fn(),
      selectProject: jest.fn(),
      clearSelectedProject: jest.fn(),
    })
  })

  it('renders analytics with key metrics', () => {
    render(<ProjectAnalytics />)

    expect(screen.getByText('Project Analytics')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument() // Total projects
    expect(screen.getByText('70.0%')).toBeInTheDocument() // Approval rate
    expect(screen.getByText('250')).toBeInTheDocument() // Total views
    expect(screen.getByText('85')).toBeInTheDocument() // Total bookmarks
  })

  it('displays additional metrics', () => {
    render(<ProjectAnalytics />)

    expect(screen.getByText('2')).toBeInTheDocument() // Pending projects
    expect(screen.getByText('7.5')).toBeInTheDocument() // Popularity score
    expect(screen.getByText('5.2')).toBeInTheDocument() // Average approval time
  })

  it('shows performance insights for high approval rate', () => {
    render(<ProjectAnalytics />)

    // Should not show excellent approval rate message since rate is 70%
    expect(screen.queryByText('Excellent Approval Rate')).not.toBeInTheDocument()
  })

  it('shows improvement suggestion for low approval rate', () => {
    const lowApprovalAnalytics = {
      ...mockProjectAnalytics,
      approvalRate: 45.0
    }

    mockUseSupervisorStore.mockReturnValue({
      ...mockUseSupervisorStore(),
      projectAnalytics: lowApprovalAnalytics,
    })

    render(<ProjectAnalytics />)

    expect(screen.getByText('Room for Improvement')).toBeInTheDocument()
  })

  it('shows pending projects insight when there are pending projects', () => {
    render(<ProjectAnalytics />)

    expect(screen.getByText('Pending Reviews')).toBeInTheDocument()
    expect(screen.getByText('You have 2 projects awaiting approval.')).toBeInTheDocument()
  })

  it('renders charts', () => {
    render(<ProjectAnalytics />)

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2) // Year chart and specialization chart
  })

  it('fetches analytics on mount', () => {
    render(<ProjectAnalytics />)
    expect(mockFetchProjectAnalytics).toHaveBeenCalledTimes(1)
  })

  it('displays loading state', () => {
    mockUseSupervisorStore.mockReturnValue({
      ...mockUseSupervisorStore(),
      isProjectAnalyticsLoading: true,
      projectAnalytics: null,
    })

    render(<ProjectAnalytics />)
    
    // Should show skeleton loading state
    expect(screen.queryByText('Project Analytics')).not.toBeInTheDocument()
  })

  it('displays error state with retry button', () => {
    mockUseSupervisorStore.mockReturnValue({
      ...mockUseSupervisorStore(),
      projectAnalyticsError: 'Failed to load analytics',
      projectAnalytics: null,
    })

    render(<ProjectAnalytics />)
    
    expect(screen.getByText('Failed to load analytics')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('handles refresh button click', () => {
    render(<ProjectAnalytics />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
    
    expect(mockClearErrors).toHaveBeenCalled()
    expect(mockFetchProjectAnalytics).toHaveBeenCalledTimes(2) // Once on mount, once on refresh
  })
})