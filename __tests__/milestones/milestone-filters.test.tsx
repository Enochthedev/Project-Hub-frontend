import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MilestoneFilters } from '@/components/milestones/milestone-filters'
import { useMilestoneStore } from '@/lib/stores/milestone-store'

// Mock the milestone store
jest.mock('@/lib/stores/milestone-store')
const mockUseMilestoneStore = useMilestoneStore as jest.MockedFunction<typeof useMilestoneStore>

const mockSetFilters = jest.fn()
const mockFetchMilestones = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  
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
    setFilters: mockSetFilters,
    clearError: jest.fn(),
    reset: jest.fn(),
  })
})

describe('MilestoneFilters', () => {
  it('renders all filter options', () => {
    render(<MilestoneFilters />)

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Due Date')).toBeInTheDocument() // Sort by dropdown
    expect(screen.getByText('Asc')).toBeInTheDocument() // Sort order dropdown
  })

  it('opens status filter popover when clicked', async () => {
    render(<MilestoneFilters />)

    const statusButton = screen.getByRole('button', { name: /status/i })
    fireEvent.click(statusButton)

    await waitFor(() => {
      expect(screen.getByText('Filter by Status')).toBeInTheDocument()
      expect(screen.getByText('Not Started')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Overdue')).toBeInTheDocument()
    })
  })

  it('opens priority filter popover when clicked', async () => {
    render(<MilestoneFilters />)

    const priorityButton = screen.getByRole('button', { name: /priority/i })
    fireEvent.click(priorityButton)

    await waitFor(() => {
      expect(screen.getByText('Filter by Priority')).toBeInTheDocument()
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Critical')).toBeInTheDocument()
    })
  })

  it('updates filters when status checkbox is changed', async () => {
    render(<MilestoneFilters />)

    // Open status filter
    const statusButton = screen.getByRole('button', { name: /status/i })
    fireEvent.click(statusButton)

    await waitFor(() => {
      const inProgressCheckbox = screen.getByLabelText('In Progress')
      fireEvent.click(inProgressCheckbox)
    })

    expect(mockSetFilters).toHaveBeenCalledWith({ status: ['in_progress'] })
    expect(mockFetchMilestones).toHaveBeenCalledWith({ status: ['in_progress'] })
  })

  it('updates filters when priority checkbox is changed', async () => {
    render(<MilestoneFilters />)

    // Open priority filter
    const priorityButton = screen.getByRole('button', { name: /priority/i })
    fireEvent.click(priorityButton)

    await waitFor(() => {
      const highCheckbox = screen.getByLabelText('High')
      fireEvent.click(highCheckbox)
    })

    expect(mockSetFilters).toHaveBeenCalledWith({ priority: ['high'] })
    expect(mockFetchMilestones).toHaveBeenCalledWith({ priority: ['high'] })
  })

  it('shows active filter count badges', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: [],
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: { 
        status: ['in_progress', 'completed'],
        priority: ['high']
      },
      fetchMilestones: mockFetchMilestones,
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: mockSetFilters,
      clearError: jest.fn(),
      reset: jest.fn(),
    })

    render(<MilestoneFilters />)

    // Should show badge with count for status (2 selected)
    expect(screen.getByText('2')).toBeInTheDocument()
    // Should show badge with count for priority (1 selected)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows clear filters button when filters are active', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: [],
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: { 
        status: ['in_progress'],
        priority: ['high']
      },
      fetchMilestones: mockFetchMilestones,
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: mockSetFilters,
      clearError: jest.fn(),
      reset: jest.fn(),
    })

    render(<MilestoneFilters />)

    expect(screen.getByText('Clear (2)')).toBeInTheDocument()
  })

  it('clears all filters when clear button is clicked', () => {
    mockUseMilestoneStore.mockReturnValue({
      milestones: [],
      currentMilestone: null,
      templates: [],
      isLoading: false,
      error: null,
      filters: { 
        status: ['in_progress'],
        priority: ['high']
      },
      fetchMilestones: mockFetchMilestones,
      fetchMilestone: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestone: jest.fn(),
      deleteMilestone: jest.fn(),
      updateProgress: jest.fn(),
      fetchTemplates: jest.fn(),
      setFilters: mockSetFilters,
      clearError: jest.fn(),
      reset: jest.fn(),
    })

    render(<MilestoneFilters />)

    const clearButton = screen.getByText('Clear (2)')
    fireEvent.click(clearButton)

    expect(mockSetFilters).toHaveBeenCalledWith({})
    expect(mockFetchMilestones).toHaveBeenCalledWith({})
  })

  it('updates sort options correctly', async () => {
    render(<MilestoneFilters />)

    // Change sort by - find the first combobox (sort by)
    const comboboxes = screen.getAllByRole('combobox')
    const sortBySelect = comboboxes[0] // First combobox is sort by
    fireEvent.click(sortBySelect)
    
    await waitFor(() => {
      const titleOption = screen.getByText('Title')
      fireEvent.click(titleOption)
    })

    expect(mockSetFilters).toHaveBeenCalledWith({ sortBy: 'title' })
    expect(mockFetchMilestones).toHaveBeenCalledWith({ sortBy: 'title' })
  })
})
