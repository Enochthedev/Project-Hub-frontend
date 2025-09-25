import { render, screen } from '@testing-library/react'
import { MilestoneTimeline } from '@/components/milestones/milestone-timeline'
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

describe('MilestoneTimeline', () => {
  it('renders empty state when no milestones', () => {
    render(<MilestoneTimeline />)

    expect(screen.getByText('No milestones to display')).toBeInTheDocument()
    expect(screen.getByText('Create some milestones to see them on the timeline.')).toBeInTheDocument()
  })

  it('renders timeline with milestones', () => {
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

    render(<MilestoneTimeline />)

    expect(screen.getByText('Milestone Timeline')).toBeInTheDocument()
    expect(screen.getByText('First Milestone')).toBeInTheDocument()
    expect(screen.getByText('Second Milestone')).toBeInTheDocument()
    expect(screen.getByText('First milestone description')).toBeInTheDocument()
    expect(screen.getByText('Second milestone description')).toBeInTheDocument()
  })

  it('groups milestones by month', () => {
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

    render(<MilestoneTimeline />)

    // Should show month headers - the dates are sorted so December comes first
    expect(screen.getByText('December 2024')).toBeInTheDocument()
    expect(screen.getByText('January 2025')).toBeInTheDocument()
  })

  it('displays milestone status and priority correctly', () => {
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

    render(<MilestoneTimeline />)

    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('shows progress indicators', () => {
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

    render(<MilestoneTimeline />)

    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})
