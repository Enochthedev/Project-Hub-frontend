import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAIAssistantStore } from '@/lib/stores/ai-assistant-store'
import AssistantManagePage from '@/app/assistant/manage/page'

// Mock the store
jest.mock('@/lib/stores/ai-assistant-store')
const mockUseAIAssistantStore = useAIAssistantStore as jest.MockedFunction<typeof useAIAssistantStore>

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => date.toLocaleDateString(),
}))

const mockStoreState = {
  conversations: [
    {
      id: 'conv-1',
      studentId: 'student-1',
      title: 'Project Planning Help',
      status: 'active',
      language: 'en',
      messageCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lastMessageAt: '2024-01-01T12:00:00Z',
    },
  ],
  bookmarkedMessages: [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      type: 'assistant',
      content: 'This is a helpful response about project planning.',
      confidenceScore: 0.9,
      sources: ['knowledge-base'],
      isBookmarked: true,
      status: 'delivered',
      averageRating: 4.5,
      ratingCount: 2,
      createdAt: '2024-01-01T12:00:00Z',
      metadata: {
        category: 'project-help',
        note: 'Very helpful for timeline planning',
      },
    },
  ],
  searchConversations: jest.fn(),
  loadBookmarkedMessages: jest.fn(),
  isLoadingBookmarks: false,
}

describe('AssistantManagePage', () => {
  beforeEach(() => {
    mockUseAIAssistantStore.mockReturnValue(mockStoreState)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the management page with all tabs', () => {
    render(<AssistantManagePage />)
    
    expect(screen.getByText('AI Assistant Management')).toBeInTheDocument()
    expect(screen.getByText('Search & Filter')).toBeInTheDocument()
    expect(screen.getByText('Bookmarks')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Export & Share')).toBeInTheDocument()
  })

  it('displays quick stats correctly', () => {
    render(<AssistantManagePage />)
    
    expect(screen.getByText('24')).toBeInTheDocument() // Conversations
    expect(screen.getByText('18')).toBeInTheDocument() // Bookmarks
    expect(screen.getByText('4.2')).toBeInTheDocument() // Avg Rating
    expect(screen.getByText('5')).toBeInTheDocument() // Exports
  })

  it('switches between tabs correctly', () => {
    render(<AssistantManagePage />)
    
    // Default tab should be search
    expect(screen.getByText('Search Conversations')).toBeInTheDocument()
    
    // Switch to bookmarks tab
    fireEvent.click(screen.getByRole('tab', { name: /bookmarks/i }))
    expect(screen.getByText('Bookmarked Messages')).toBeInTheDocument()
    
    // Switch to analytics tab
    fireEvent.click(screen.getByRole('tab', { name: /analytics/i }))
    expect(screen.getByText('Conversation Analytics')).toBeInTheDocument()
    
    // Switch to export tab
    fireEvent.click(screen.getByRole('tab', { name: /export & share/i }))
    expect(screen.getByText('Export & Share Conversations')).toBeInTheDocument()
  })

  it('renders search functionality', () => {
    render(<AssistantManagePage />)
    
    expect(screen.getByPlaceholderText('Search conversations, messages, or topics...')).toBeInTheDocument()
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
  })

  it('renders bookmarks section', () => {
    render(<AssistantManagePage />)
    
    // Switch to bookmarks tab
    fireEvent.click(screen.getByRole('tab', { name: /bookmarks/i }))
    
    expect(screen.getByPlaceholderText('Search bookmarked messages...')).toBeInTheDocument()
    expect(screen.getByText('All Categories')).toBeInTheDocument()
  })

  it('renders analytics charts', () => {
    render(<AssistantManagePage />)
    
    // Switch to analytics tab
    fireEvent.click(screen.getByRole('tab', { name: /analytics/i }))
    
    expect(screen.getByText('Total Conversations')).toBeInTheDocument()
    expect(screen.getByText('Average Rating')).toBeInTheDocument()
    expect(screen.getByText('Response Time')).toBeInTheDocument()
    expect(screen.getByText('Satisfaction')).toBeInTheDocument()
  })

  it('renders export functionality', () => {
    render(<AssistantManagePage />)
    
    // Switch to export tab
    fireEvent.click(screen.getByRole('tab', { name: /export & share/i }))
    
    expect(screen.getByText('Sample Conversation: Project Planning Discussion')).toBeInTheDocument()
    expect(screen.getByText('Recent Exports')).toBeInTheDocument()
    expect(screen.getByText('Export Conversation')).toBeInTheDocument()
  })

  it('handles search input', async () => {
    const mockSearchConversations = jest.fn()
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      searchConversations: mockSearchConversations,
    })

    render(<AssistantManagePage />)
    
    const searchInput = screen.getByPlaceholderText('Search conversations, messages, or topics...')
    fireEvent.change(searchInput, { target: { value: 'project planning' } })

    // Wait for debounced search
    await waitFor(() => {
      expect(mockSearchConversations).toHaveBeenCalledWith({
        search: 'project planning',
      })
    }, { timeout: 500 })
  })

  it('loads bookmarked messages on mount', () => {
    const mockLoadBookmarkedMessages = jest.fn()
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      loadBookmarkedMessages: mockLoadBookmarkedMessages,
    })

    render(<AssistantManagePage />)
    
    // Switch to bookmarks tab to trigger loading
    fireEvent.click(screen.getByRole('tab', { name: /bookmarks/i }))
    
    expect(mockLoadBookmarkedMessages).toHaveBeenCalled()
  })

  it('displays loading state for bookmarks', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      isLoadingBookmarks: true,
      bookmarkedMessages: [],
    })

    render(<AssistantManagePage />)
    
    // Switch to bookmarks tab
    fireEvent.click(screen.getByRole('tab', { name: /bookmarks/i }))
    
    expect(screen.getByText('Loading bookmarks...')).toBeInTheDocument()
  })

  it('shows empty state when no bookmarks', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      bookmarkedMessages: [],
      isLoadingBookmarks: false,
    })

    render(<AssistantManagePage />)
    
    // Switch to bookmarks tab
    fireEvent.click(screen.getByRole('tab', { name: /bookmarks/i }))
    
    expect(screen.getByText('No bookmarked messages yet')).toBeInTheDocument()
  })

  it('handles export format selection', () => {
    render(<AssistantManagePage />)
    
    // Switch to export tab
    fireEvent.click(screen.getByRole('tab', { name: /export & share/i }))
    
    // Should have export format selector
    expect(screen.getByText('Export Format')).toBeInTheDocument()
    expect(screen.getByText('PDF Document')).toBeInTheDocument()
  })

  it('displays recent exports', () => {
    render(<AssistantManagePage />)
    
    // Switch to export tab
    fireEvent.click(screen.getByRole('tab', { name: /export & share/i }))
    
    expect(screen.getByText('Project Planning Discussion.pdf')).toBeInTheDocument()
    expect(screen.getByText('Technical Questions.html')).toBeInTheDocument()
    expect(screen.getByText('Research Methods Chat.txt')).toBeInTheDocument()
  })

  it('shows badge counts correctly', () => {
    render(<AssistantManagePage />)
    
    // Should show bookmark count in tab
    const bookmarksTab = screen.getByRole('tab', { name: /bookmarks/i })
    expect(bookmarksTab).toHaveTextContent('18')
  })
})
