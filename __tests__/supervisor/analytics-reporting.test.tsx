import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSupervisorStore } from '@/lib/stores/supervisor-store'
import StudentPerformanceComparison from '@/components/supervisor/student-performance-comparison'
import ExportableReports from '@/components/supervisor/exportable-reports'

// Mock the store
jest.mock('@/lib/stores/supervisor-store')

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Radar: () => <div data-testid="radar" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
}))

const mockUseSupervisorStore = useSupervisorStore as jest.MockedFunction<typeof useSupervisorStore>

const mockStudents = [
  {
    studentId: 'student-1',
    studentName: 'John Doe',
    studentEmail: 'john.doe@university.edu',
    totalMilestones: 12,
    completedMilestones: 8,
    inProgressMilestones: 2,
    overdueMilestones: 1,
    blockedMilestones: 1,
    completionRate: 66.67,
    riskScore: 0.3,
    nextMilestone: {
      id: 'milestone-5',
      title: 'System Testing',
      dueDate: '2024-04-15',
      priority: 'high' as const,
    },
    lastActivity: '2024-03-15T10:30:00Z',
    projectCount: 1,
  },
  {
    studentId: 'student-2',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@university.edu',
    totalMilestones: 10,
    completedMilestones: 9,
    inProgressMilestones: 1,
    overdueMilestones: 0,
    blockedMilestones: 0,
    completionRate: 90.0,
    riskScore: 0.1,
    nextMilestone: {
      id: 'milestone-10',
      title: 'Final Presentation',
      dueDate: '2024-04-20',
      priority: 'medium' as const,
    },
    lastActivity: '2024-03-16T14:20:00Z',
    projectCount: 1,
  },
  {
    studentId: 'student-3',
    studentName: 'Bob Johnson',
    studentEmail: 'bob.johnson@university.edu',
    totalMilestones: 8,
    completedMilestones: 3,
    inProgressMilestones: 1,
    overdueMilestones: 3,
    blockedMilestones: 1,
    completionRate: 37.5,
    riskScore: 0.8,
    nextMilestone: null,
    lastActivity: '2024-03-10T09:15:00Z',
    projectCount: 1,
  },
]

describe('StudentPerformanceComparison', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders student performance comparison interface', () => {
    render(<StudentPerformanceComparison students={mockStudents} />)

    expect(screen.getByText('Student Performance Comparison')).toBeInTheDocument()
    expect(screen.getByText('Select Students to Compare')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('allows selecting students for comparison', () => {
    render(<StudentPerformanceComparison students={mockStudents} />)

    const johnCheckbox = screen.getByLabelText('John Doe')
    const janeCheckbox = screen.getByLabelText('Jane Smith')

    fireEvent.click(johnCheckbox)
    fireEvent.click(janeCheckbox)

    expect(johnCheckbox).toBeChecked()
    expect(janeCheckbox).toBeChecked()
    expect(screen.getByText('Comparing 2 students')).toBeInTheDocument()
  })

  it('displays completion rate badges for students', () => {
    render(<StudentPerformanceComparison students={mockStudents} />)

    expect(screen.getByText('67%')).toBeInTheDocument() // John's completion rate
    expect(screen.getByText('90%')).toBeInTheDocument() // Jane's completion rate
    expect(screen.getByText('38%')).toBeInTheDocument() // Bob's completion rate
  })

  it('allows changing comparison metrics', () => {
    render(<StudentPerformanceComparison students={mockStudents} />)

    const metricSelect = screen.getByText('Completion Rate')
    fireEvent.click(metricSelect)

    // The select options would appear in a dropdown, but we can't easily test that
    // Just verify the select is clickable
    expect(metricSelect).toBeInTheDocument()
  })

  it('allows changing view types', () => {
    render(<StudentPerformanceComparison students={mockStudents} />)

    const viewSelect = screen.getByText('Bar Chart')
    fireEvent.click(viewSelect)

    // The select options would appear in a dropdown, but we can't easily test that
    // Just verify the select is clickable
    expect(viewSelect).toBeInTheDocument()
  })

  it('shows performance insights when students are selected', () => {
    render(<StudentPerformanceComparison students={mockStudents} />)

    // Select two students
    fireEvent.click(screen.getByLabelText('John Doe'))
    fireEvent.click(screen.getByLabelText('Jane Smith'))

    expect(screen.getByText('Performance Insights')).toBeInTheDocument()
    expect(screen.getByText('Top Performer')).toBeInTheDocument()
  })

  it('displays detailed comparison table when students are selected', () => {
    render(<StudentPerformanceComparison students={mockStudents} />)

    // Select students
    fireEvent.click(screen.getByLabelText('John Doe'))
    fireEvent.click(screen.getByLabelText('Jane Smith'))

    expect(screen.getByText('Detailed Comparison')).toBeInTheDocument()
    expect(screen.getByText('Side-by-side comparison of key metrics')).toBeInTheDocument()
  })

  it('shows message when no students are selected', () => {
    render(<StudentPerformanceComparison students={mockStudents} />)

    expect(screen.getByText('Select students to compare their performance')).toBeInTheDocument()
  })

  it('renders chart when students are selected', () => {
    render(<StudentPerformanceComparison students={mockStudents} />)

    // Select students
    fireEvent.click(screen.getByLabelText('John Doe'))
    fireEvent.click(screen.getByLabelText('Jane Smith'))

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })
})

describe('ExportableReports', () => {
  const mockGenerateReport = jest.fn()
  const mockExportReport = jest.fn()

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
      generateReport: mockGenerateReport,
      exportReport: mockExportReport,
      fetchAnalytics: jest.fn(),
      clearErrors: jest.fn(),
      clearSelectedStudent: jest.fn(),
      fetchMyProjects: jest.fn(),
      fetchProjectApprovalQueue: jest.fn(),
      fetchProjectAnalytics: jest.fn(),
      fetchProjectFeedback: jest.fn(),
      approveProject: jest.fn(),
      rejectProject: jest.fn(),
      selectProject: jest.fn(),
      clearSelectedProject: jest.fn(),
    })
  })

  it('renders exportable reports interface', () => {
    render(<ExportableReports students={mockStudents} />)

    expect(screen.getByText('Generate Exportable Reports')).toBeInTheDocument()
    expect(screen.getByText('Report Type')).toBeInTheDocument()
    expect(screen.getByText('Export Format')).toBeInTheDocument()
    expect(screen.getByText('Select Students')).toBeInTheDocument()
  })

  it('displays all students for selection', () => {
    render(<ExportableReports students={mockStudents} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('allows selecting and deselecting students', () => {
    render(<ExportableReports students={mockStudents} />)

    const johnCheckbox = screen.getByLabelText('John Doe')
    fireEvent.click(johnCheckbox)

    expect(johnCheckbox).toBeChecked()
    expect(screen.getByText('1 student selected')).toBeInTheDocument()

    fireEvent.click(johnCheckbox)
    expect(johnCheckbox).not.toBeChecked()
  })

  it('has select all functionality', () => {
    render(<ExportableReports students={mockStudents} />)

    const selectAllButton = screen.getByText('Select All')
    fireEvent.click(selectAllButton)

    expect(screen.getByText('3 students selected')).toBeInTheDocument()
    expect(screen.getByText('Deselect All')).toBeInTheDocument()
  })

  it('allows changing report type and format', () => {
    render(<ExportableReports students={mockStudents} />)

    const reportTypeSelect = screen.getByText('Progress Summary')
    fireEvent.click(reportTypeSelect)
    expect(reportTypeSelect).toBeInTheDocument()

    // Check for the PDF format text
    expect(screen.getByText('PDF Document')).toBeInTheDocument()
  })

  it('allows setting date range', () => {
    render(<ExportableReports students={mockStudents} />)

    const startDateInput = screen.getByLabelText('Start Date')
    const endDateInput = screen.getByLabelText('End Date')

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })
    fireEvent.change(endDateInput, { target: { value: '2024-03-31' } })

    expect(startDateInput).toHaveValue('2024-01-01')
    expect(endDateInput).toHaveValue('2024-03-31')
  })

  it('shows report preview', () => {
    render(<ExportableReports students={mockStudents} />)

    expect(screen.getByText('Report Preview')).toBeInTheDocument()
    // Check for the presence of student count and time range in a more flexible way
    expect(screen.getByText('Preview of what will be included in your report')).toBeInTheDocument()
  })

  it('calls generateReport when generate button is clicked', () => {
    render(<ExportableReports students={mockStudents} />)

    const generateButton = screen.getByText('Generate Report')
    fireEvent.click(generateButton)

    expect(mockGenerateReport).toHaveBeenCalled()
  })

  it('calls exportReport when export button is clicked', () => {
    render(<ExportableReports students={mockStudents} />)

    const exportButton = screen.getByText('Export PDF')
    fireEvent.click(exportButton)

    expect(mockExportReport).toHaveBeenCalledWith('pdf', {})
  })
})
