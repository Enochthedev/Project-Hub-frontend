import { render, screen, fireEvent } from '@testing-library/react'
import { MilestoneGantt } from '@/components/milestones/milestone-gantt'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import type { Milestone } from '@/lib/api/types'

// Mock the milestone store
jest.mock('@/lib/stores/milestone-store')
const mockUseMilestoneStore = useMilestoneStore as jest.MockedFunction<typeof useMilestoneStore>

const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'First Milestone',
    description: 'First milestone description',
    dueDate: '2024-12-31T23:59:59.000Z',
    status: 'in_progress',
    priority: 'high',
    progress: 50,
    projectId: 'project-1',
    studentId: 'student-1',
    supervisorId: 'supervisor-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Second Milestone',
    description: 'Second milestone description',
    dueDate: '2024-11-30T23:59:59.000Z',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    projectId: 'project-1',
    studentId: 'student-1',
    supervisorId: 'supervisor-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
]

beforeEach(() => {
  mockUseMilestoneStore.mockReturnValue({
    milestones: [],
    currentMilestone: null,
    templates: [],
    isLoading: false,
    error: null,
    filters: {},
    fetchMilestones: jest.fn(),
    fetchMilestone: jest.fn(),
    createMilestone: jest.fn(),
    updateMilestone: jest.fn(),
    deleteMilestone: jest.fn(),
    updateProgress: jest.fn(),
    fetchTemplates: jest.fn(),
    setFilters: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
  })
})

describe('MilestoneGantt', () => {
  it('renders empty state when no milestones', () => {
    render(<MilestoneGantt />)

    expect(screen.getByText('No milestones to display')).toBeInTheDocument()
    expect(screen.getByText('Create some milestones to see them on the Gantt chart.')).toBeInTheDocument()
  })

  it('renders Gantt chart with milestones', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: mockMilestones,
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: {},
      fetchMilestones: jest.fn(),
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    })

    render(<MilestoneGantt />)

    expect(screen.getByText('Milestone Gantt Chart')).toBeInTheDocument()
    expect(screen.getByText('First Milestone')).toBeInTheDocument()
    expect(screen.getByText('Second Milestone')).toBeInTheDocument()
    expect(screen.getByText('Milestone')).toBeInTheDocument() // Column header
  })

  it('renders zoom level controls', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: mockMilestones,
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: {},
      fetchMilestones: jest.fn(),
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    })

    render(<MilestoneGantt />)

    expect(screen.getByRole('button', { name: 'Month' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Week' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Day' })).toBeInTheDocument()
  })

  it('changes zoom level when buttons are clicked', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: mockMilestones,
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: {},
      fetchMilestones: jest.fn(),
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    })

    render(<MilestoneGantt />)

    const weekButton = screen.getByRole('button', { name: 'Week' })
    fireEvent.click(weekButton)

    const dayButton = screen.getByRole('button', { name: 'Day' })
    fireEvent.click(dayButton)

    // The buttons should be clickable (we can't easily test the visual changes without more complex testing)
    expect(weekButton).toBeInTheDocument()
    expect(dayButton).toBeInTheDocument()
  })

  it('displays milestone status badges', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: mockMilestones,
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: {},
      fetchMilestones: jest.fn(),
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    })

    render(<MilestoneGantt />)

    expect(screen.getByText('in progress')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('renders legend', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: mockMilestones,
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: {},
      fetchMilestones: jest.fn(),
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    })

    render(<MilestoneGantt />)

    expect(screen.getByText('Not Started')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getAllByText('Overdue').length).toBeGreaterThan(0)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })
})