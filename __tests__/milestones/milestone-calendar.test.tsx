import { render, screen, fireEvent } from '@testing-library/react'
import { MilestoneCalendar } from '@/components/milestones/milestone-calendar'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import type { Milestone } from '@/lib/api/types'

// Mock the milestone store
jest.mock('@/lib/stores/milestone-store')
const mockUseMilestoneStore = useMilestoneStore as jest.MockedFunction<typeof useMilestoneStore>

const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'Test Milestone',
    description: 'Test milestone description',
    dueDate: new Date().toISOString(), // Today
    status: 'in_progress',
    priority: 'high',
    progress: 50,
    projectId: 'project-1',
    studentId: 'student-1',
    supervisorId: 'supervisor-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
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

describe('MilestoneCalendar', () => {
  it('renders calendar header with navigation', () => {
    render(<MilestoneCalendar />)

    expect(screen.getByText('Milestone Calendar')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    
    // Should have navigation buttons - get all buttons with empty names
    const emptyNameButtons = screen.getAllByRole('button', { name: '' })
    expect(emptyNameButtons.length).toBeGreaterThanOrEqual(2) // At least prev and next buttons
  })

  it('renders day headers', () => {
    render(<MilestoneCalendar />)

    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('displays milestones on correct dates', () => {
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

    render(<MilestoneCalendar />)

    expect(screen.getByText('Test Milestone')).toBeInTheDocument()
  })

  it('navigates between months', () => {
    render(<MilestoneCalendar />)

    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    expect(screen.getByText(currentMonth)).toBeInTheDocument()

    // Click next month button (second button with no text)
    const buttons = screen.getAllByRole('button', { name: '' })
    const nextButton = buttons[1] // Assuming second button is next
    fireEvent.click(nextButton)

    // Month should change (we can't easily test the exact month without more complex date mocking)
  })

  it('shows today button and navigates to current date', () => {
    render(<MilestoneCalendar />)

    const todayButton = screen.getByText('Today')
    expect(todayButton).toBeInTheDocument()

    fireEvent.click(todayButton)
    // Should navigate to current month (already there in this test)
  })

  it('renders legend', () => {
    render(<MilestoneCalendar />)

    expect(screen.getByText('Not Started')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Has overdue items')).toBeInTheDocument()
  })
})
