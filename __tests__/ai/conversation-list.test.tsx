import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConversationList } from '@/components/ai/conversation-list'
import { useAIAssistantStore } from '@/lib/stores/ai-assistant-store'
import { Conversation } from '@/lib/api/types'

// Mock the store
jest.mock('@/lib/stores/ai-assistant-store')
const mockUseAIAssistantStore = useAIAssistantStore as jest.MockedFunction<typeof useAIAssistantStore>

const mockConversations: Conversation[] = [
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
  {
    id: 'conv-2',
    studentId: 'student-1',
    title: 'Research Methods Discussion',
    status: 'archived',
    language: 'en',
    messageCount: 12,
    projectId: 'project-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastMessageAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'conv-3',
    studentId: 'student-1',
    title: 'Urgent: Deadline Issues',
    status: 'escalated',
    language: 'en',
    messageCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastMessageAt: '2024-01-01T08:00:00Z',
  },
]

const mockStoreState = {
  conversations: mockConversations,
  isLoadingConversations: false,
  conversationError: null,
  conversationFilters: {},
  loadConversations: jest.fn(),
  searchConversations: jest.fn(),
}

describe('ConversationList', () => {
  const mockOnConversationSelect = jest.fn()
  const mockOnNewConversation = jest.fn()

  beforeEach(() => {
    mockUseAIAssistantStore.mockReturnValue(mockStoreState)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders conversation list with conversations', () => {
    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    expect(screen.getByText('Conversations')).toBeInTheDocument()
    expect(screen.getByText('Project Planning Help')).toBeInTheDocument()
    expect(screen.getByText('Research Methods Discussion')).toBeInTheDocument()
    expect(screen.getByText('Urgent: Deadline Issues')).toBeInTheDocument()
  })

  it('displays conversation status badges with correct colors', () => {
    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    // Active conversation should have green badge
    const activeStatus = screen.getByText('Active')
    expect(activeStatus.closest('.bg-green-100')).toBeInTheDocument()

    // Archived conversation should have gray badge
    const archivedStatus = screen.getByText('Archived')
    expect(archivedStatus.closest('.bg-gray-100')).toBeInTheDocument()

    // Escalated conversation should have red badge
    const escalatedStatus = screen.getByText('Escalated')
    expect(escalatedStatus.closest('.bg-red-100')).toBeInTheDocument()
  })

  it('shows message counts and project indicators', () => {
    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    expect(screen.getByText('5 messages')).toBeInTheDocument()
    expect(screen.getByText('12 messages')).toBeInTheDocument()
    expect(screen.getByText('3 messages')).toBeInTheDocument()
    
    // Should show project badge for conversation with projectId
    expect(screen.getByText('Project')).toBeInTheDocument()
  })

  it('handles conversation selection', () => {
    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
        selectedConversationId="conv-1"
      />
    )
    
    const conversation = screen.getByText('Project Planning Help').closest('div')
    fireEvent.click(conversation!)

    expect(mockOnConversationSelect).toHaveBeenCalledWith(mockConversations[0])
  })

  it('highlights selected conversation', () => {
    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
        selectedConversationId="conv-1"
      />
    )
    
    const selectedConversation = screen.getByText('Project Planning Help').closest('div')
    expect(selectedConversation).toHaveClass('bg-[#1B998B]/10')
  })

  it('handles new conversation button click', () => {
    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    const newButton = screen.getByText('New')
    fireEvent.click(newButton)

    expect(mockOnNewConversation).toHaveBeenCalled()
  })

  it('handles search functionality', async () => {
    const mockSearchConversations = jest.fn()
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      searchConversations: mockSearchConversations,
    })

    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search conversations...')
    fireEvent.change(searchInput, { target: { value: 'project' } })

    await waitFor(() => {
      expect(mockSearchConversations).toHaveBeenCalledWith({
        search: 'project',
      })
    })
  })

  it('handles status filter', async () => {
    const mockSearchConversations = jest.fn()
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      searchConversations: mockSearchConversations,
    })

    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    // Open status filter dropdown
    const filterTrigger = screen.getByRole('combobox')
    fireEvent.click(filterTrigger)

    // Select "Active" filter
    const activeOption = screen.getByText('Active')
    fireEvent.click(activeOption)

    await waitFor(() => {
      expect(mockSearchConversations).toHaveBeenCalledWith({
        status: 'active',
      })
    })
  })

  it('displays loading state', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      isLoadingConversations: true,
    })

    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    expect(screen.getByText('Loading conversations...')).toBeInTheDocument()
  })

  it('displays error state', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      conversationError: 'Failed to load conversations',
    })

    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    expect(screen.getByText('Failed to load conversations')).toBeInTheDocument()
  })

  it('displays empty state when no conversations', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      conversations: [],
    })

    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    expect(screen.getByText('No conversations yet')).toBeInTheDocument()
    expect(screen.getByText('Start a new conversation to get help')).toBeInTheDocument()
  })

  it('formats last message time correctly', () => {
    // Mock current time to be 2024-01-01T13:00:00Z (1 hour after last message)
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01T13:00:00Z'))

    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    expect(screen.getByText('1h ago')).toBeInTheDocument()
    expect(screen.getByText('3h ago')).toBeInTheDocument()
    expect(screen.getByText('5h ago')).toBeInTheDocument()

    jest.useRealTimers()
  })

  it('loads conversations on mount when empty', () => {
    const mockLoadConversations = jest.fn()
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      conversations: [],
      loadConversations: mockLoadConversations,
    })

    render(
      <ConversationList
        onConversationSelect={mockOnConversationSelect}
        onNewConversation={mockOnNewConversation}
      />
    )
    
    expect(mockLoadConversations).toHaveBeenCalled()
  })
})