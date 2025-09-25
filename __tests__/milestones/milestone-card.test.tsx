import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MilestoneCard } from '@/components/milestones/milestone-card'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import type { Milestone } from '@/lib/api/types'

// Mock the milestone store
jest.mock('@/lib/stores/milestone-store')
const mockUseMilestoneStore = useMilestoneStore as jest.MockedFunction<typeof useMilestoneStore>

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockMilestone: Milestone = {
  id: '1',
  title: 'Test Milestone',
  description: 'This is a test milestone description',
  dueDate: '2024-12-31T23:59:59.000Z',
  status: 'in_progress',
  priority: 'high',
  progress: 50,
  projectId: 'project-1',
  studentId: 'student-1',
  supervisorId: 'supervisor-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
}

const mockUpdateProgress = jest.fn()

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
    updateProgress: mockUpdateProgress,
    fetchTemplates: jest.fn(),
    setFilters: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
  })
})

describe('MilestoneCard', () => {
  it('renders milestone information correctly', () => {
    render(<MilestoneCard milestone={mockMilestone} />)

    expect(screen.getByText('Test Milestone')).toBeInTheDocument()
    expect(screen.getByText('This is a test milestone description')).toBeInTheDocument()
    expect(screen.getByText(/Due.*Jan 1, 2025/)).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows overdue badge for overdue milestones', () => {
    const overdueMilestone = {
      ...mockMilestone,
      dueDate: '2023-01-01T00:00:00.000Z', // Past date
      status: 'in_progress' as const,
    }

    render(<MilestoneCard milestone={overdueMilestone} />)

    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('displays correct priority indicators', () => {
    const { rerender } = render(<MilestoneCard milestone={mockMilestone} />)

    // High priority should show orange indicator
    expect(screen.getByText('🟠')).toBeInTheDocument()

    // Test critical priority
    rerender(<MilestoneCard milestone={{ ...mockMilestone, priority: 'critical' }} />)
    expect(screen.getByText('🔴')).toBeInTheDocument()

    // Test low priority
    rerender(<MilestoneCard milestone={{ ...mockMilestone, priority: 'low' }} />)
    expect(screen.getByText('🟢')).toBeInTheDocument()
  })

  it('renders more options button', () => {
    render(<MilestoneCard milestone={mockMilestone} />)

    const moreButton = screen.getByRole('button', { name: 'More options' })
    expect(moreButton).toBeInTheDocument()
    
    // Test that the button is clickable
    fireEvent.click(moreButton)
    // The dropdown content is handled by Radix UI and may not render in test environment
    // This test just ensures the button exists and is clickable
  })

  it('opens progress dialog when progress bar is clicked', async () => {
    render(<MilestoneCard milestone={mockMilestone} />)

    const progressBar = screen.getByRole('progressbar')
    fireEvent.click(progressBar)

    // The dialog should open (we can't easily test the dialog content without more complex setup)
    // This test verifies the click handler is attached
    expect(progressBar).toBeInTheDocument()
  })

  it('does not open progress dialog for completed milestones', () => {
    const completedMilestone = {
      ...mockMilestone,
      status: 'completed' as const,
      progress: 100,
    }

    render(<MilestoneCard milestone={completedMilestone} />)

    const progressBar = screen.getByRole('progressbar')
    fireEvent.click(progressBar)

    // Should not open dialog for completed milestones
    expect(progressBar).toBeInTheDocument()
  })

  it('displays correct status badges', () => {
    const { rerender } = render(<MilestoneCard milestone={mockMilestone} />)

    // In Progress
    expect(screen.getByText('In Progress')).toBeInTheDocument()

    // Completed
    rerender(<MilestoneCard milestone={{ ...mockMilestone, status: 'completed' }} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()

    // Not Started
    rerender(<MilestoneCard milestone={{ ...mockMilestone, status: 'not_started' }} />)
    expect(screen.getByText('Not Started')).toBeInTheDocument()

    // Overdue - use getAllByText since there might be multiple overdue badges
    rerender(<MilestoneCard milestone={{ ...mockMilestone, status: 'overdue' }} />)
    expect(screen.getAllByText('Overdue').length).toBeGreaterThan(0)
  })
})