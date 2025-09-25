import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EnhancedChatInterface } from '@/components/ai/enhanced-chat-interface'
import { useAIAssistantStore } from '@/lib/stores/ai-assistant-store'
import { Conversation, Message } from '@/lib/api/types'

// Mock the store
jest.mock('@/lib/stores/ai-assistant-store')
const mockUseAIAssistantStore = useAIAssistantStore as jest.MockedFunction<typeof useAIAssistantStore>

// Mock mobile hook
jest.mock('@/hooks/use-mobile', () => ({
  useMobile: () => ({ isMobile: false })
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

const mockConversation: Conversation = {
  id: 'conv-1',
  studentId: 'student-1',
  title: 'Test Conversation',
  status: 'active',
  language: 'en',
  messageCount: 2,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastMessageAt: '2024-01-01T00:00:00Z',
}

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    type: 'user',
    content: 'Hello, I need help with my project',
    isBookmarked: false,
    status: 'sent',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    type: 'assistant',
    content: 'I\'d be happy to help you with your project!',
    confidenceScore: 0.9,
    sources: ['knowledge-base'],
    isBookmarked: false,
    status: 'delivered',
    createdAt: '2024-01-01T00:01:00Z',
  },
]

const mockStoreState = {
  conversations: [mockConversation],
  currentConversation: mockConversation,
  messages: mockMessages,
  isLoadingMessages: false,
  isGeneratingResponse: false,
  messagesError: null,
  responseError: null,
  conversationFilters: {},
  messageFilters: {},
  bookmarkedMessages: [],
  isLoadingBookmarks: false,
  selectConversation: jest.fn(),
  createConversation: jest.fn(),
  askQuestion: jest.fn(),
  loadMessages: jest.fn(),
  clearError: jest.fn(),
}

describe('EnhancedChatInterface', () => {
  beforeEach(() => {
    mockUseAIAssistantStore.mockReturnValue(mockStoreState)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders chat interface with conversation and messages', () => {
    render(<EnhancedChatInterface />)
    
    // Use getAllByText since the conversation title appears in both sidebar and header
    const conversationTitles = screen.getAllByText('Test Conversation')
    expect(conversationTitles.length).toBeGreaterThan(0)
    expect(screen.getByText('Hello, I need help with my project')).toBeInTheDocument()
    expect(screen.getByText('I\'d be happy to help you with your project!')).toBeInTheDocument()
  })

  it('displays welcome screen when no conversation is selected', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      currentConversation: null,
      messages: [],
    })

    render(<EnhancedChatInterface />)
    
    expect(screen.getByText('Welcome to AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('Start New Conversation')).toBeInTheDocument()
  })

  it('handles message submission', async () => {
    const mockAskQuestion = jest.fn().mockResolvedValue({})
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      askQuestion: mockAskQuestion,
    })

    render(<EnhancedChatInterface />)
    
    const input = screen.getByPlaceholderText('Ask a question...')
    const submitButton = screen.getByLabelText('Send message')

    fireEvent.change(input, { target: { value: 'What is machine learning?' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAskQuestion).toHaveBeenCalledWith('What is machine learning?', 'conv-1')
    })
  })

  it('creates new conversation when none exists', async () => {
    const mockCreateConversation = jest.fn().mockResolvedValue(mockConversation)
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      currentConversation: null,
      createConversation: mockCreateConversation,
    })

    render(<EnhancedChatInterface />)
    
    const input = screen.getByPlaceholderText('Start a conversation...')
    const submitButton = screen.getByLabelText('Send message')

    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockCreateConversation).toHaveBeenCalledWith({
        title: 'Hello',
        projectId: undefined,
        initialQuery: 'Hello',
      })
    })
  })

  it('displays loading state when generating response', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      isGeneratingResponse: true,
    })

    render(<EnhancedChatInterface />)
    
    expect(screen.getByText('Thinking...')).toBeInTheDocument()
  })

  it('displays error message when there is a response error', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      responseError: 'Failed to generate response',
    })

    render(<EnhancedChatInterface />)
    
    expect(screen.getByText('Failed to generate response')).toBeInTheDocument()
  })

  it('handles suggestion clicks', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      currentConversation: { ...mockConversation, messageCount: 0 },
      messages: [],
    })

    render(<EnhancedChatInterface />)
    
    const suggestion = screen.getByText('How do I choose a good project topic?')
    fireEvent.click(suggestion)

    const input = screen.getByPlaceholderText('Ask a question...')
    expect(input).toHaveValue('How do I choose a good project topic?')
  })

  it('disables input when generating response', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      isGeneratingResponse: true,
    })

    render(<EnhancedChatInterface />)
    
    const input = screen.getByPlaceholderText('Ask a question...')
    const submitButton = screen.getByLabelText('Send message')

    expect(input).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('shows message count in header', () => {
    render(<EnhancedChatInterface />)
    
    // Use getAllByText since the message count appears in both sidebar and header
    const messageCountElements = screen.getAllByText('2 messages')
    expect(messageCountElements.length).toBeGreaterThan(0)
  })

  it('handles new conversation dialog', async () => {
    const mockCreateConversation = jest.fn().mockResolvedValue(mockConversation)
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      currentConversation: null, // No current conversation to show the welcome screen
      createConversation: mockCreateConversation,
    })

    render(<EnhancedChatInterface />)
    
    // Open new conversation dialog from welcome screen
    const newButton = screen.getByRole('button', { name: 'Start New Conversation' })
    fireEvent.click(newButton)

    // Fill in title
    const titleInput = screen.getByPlaceholderText('e.g., Project Planning Help')
    fireEvent.change(titleInput, { target: { value: 'My New Conversation' } })

    // Submit
    const startButton = screen.getByRole('button', { name: 'Start Conversation' })
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(mockCreateConversation).toHaveBeenCalledWith({
        title: 'My New Conversation',
        projectId: undefined,
      })
    })
  })
})