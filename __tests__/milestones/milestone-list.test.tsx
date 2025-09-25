import { render, screen, waitFor } from '@testing-library/react'
import { MilestoneList } from '@/components/milestones/milestone-list'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import type { Milestone } from '@/lib/api/types'

// Mock the milestone store
jest.mock('@/lib/stores/milestone-store')
const mockUseMilestoneStore = useMilestoneStore as jest.MockedFunction<typeof useMilestoneStore>

// Mock the MilestoneCard component
jest.mock('@/components/milestones/milestone-card', () => ({
  MilestoneCard: ({ milestone }: { milestone: Milestone }) => (
    <div data-testid={`milestone-card-${milestone.id}`}>
      {milestone.title}
    </div>
  ),
}))

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

const mockFetchMilestones = jest.fn()
const mockClearError = jest.fn()

describe('MilestoneList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: [],
      currentMilestone: null,
      templates: [],
      isLoading: true,
      error: null,
      filters: {},
      fetchMilestones: mockFetchMilestones,
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: mockClearError,
      reset: jest.fn(),
    })

    const { container } = render(<MilestoneList />)

    // Should show loading skeletons - check for skeleton cards by class
    const skeletonCards = container.querySelectorAll('.border.rounded-lg.p-6')
    expect(skeletonCards).toHaveLength(6)
  })

  it('renders error state correctly', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: [],
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: 'Failed to fetch milestones',
      filters: {},
      fetchMilestones: mockFetchMilestones,
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: mockClearError,
      reset: jest.fn(),
    })

    render(<MilestoneList />)

    expect(screen.getByText('Failed to fetch milestones')).toBeInTheDocument()
    expect(screen.getByText('Dismiss')).toBeInTheDocument()
  })

  it('renders empty state when no milestones', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: [],
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: {},
      fetchMilestones: mockFetchMilestones,
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: mockClearError,
      reset: jest.fn(),
    })

    render(<MilestoneList />)

    expect(screen.getByText('No milestones found')).toBeInTheDocument()
    expect(screen.getByText('Get started by creating your first milestone to track your project progress.')).toBeInTheDocument()
  })

  it('renders milestones correctly', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: mockMilestones,
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: {},
      fetchMilestones: mockFetchMilestones,
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: mockClearError,
      reset: jest.fn(),
    })

    render(<MilestoneList />)

    expect(screen.getByTestId('milestone-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('milestone-card-2')).toBeInTheDocument()
    expect(screen.getByText('First Milestone')).toBeInTheDocument()
    expect(screen.getByText('Second Milestone')).toBeInTheDocument()
  })

  it('fetches milestones on mount', async () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: [],
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: { status: ['in_progress'] },
      fetchMilestones: mockFetchMilestones,
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: mockClearError,
      reset: jest.fn(),
    })

    render(<MilestoneList />)

    await waitFor(() => {
      expect(mockFetchMilestones).toHaveBeenCalledWith({ status: ['in_progress'] })
    })
  })

  it('refetches milestones when filters change', async () => {
    const { rerender } = render(<MilestoneList />)

    // Initial render
    mockUseMilestoneStore.mockReturnValue({
      milestones: [],
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: { status: ['completed'] },
      fetchMilestones: mockFetchMilestones,
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: jest.fn(),
      clearError: mockClearError,
      reset: jest.fn(),
    })

    // Rerender with new filters
    rerender(<MilestoneList />)

    await waitFor(() => {
      expect(mockFetchMilestones).toHaveBeenCalledWith({ status: ['completed'] })
    })
  })
})
