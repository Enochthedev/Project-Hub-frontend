import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MessageItem } from '@/components/ai/message-item'
import { useAIAssistantStore } from '@/lib/stores/ai-assistant-store'
import { Message } from '@/lib/api/types'

// Mock the store
jest.mock('@/lib/stores/ai-assistant-store')
const mockUseAIAssistantStore = useAIAssistantStore as jest.MockedFunction<typeof useAIAssistantStore>

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
})

const mockUserMessage: Message = {
  id: 'msg-1',
  conversationId: 'conv-1',
  type: 'user',
  content: 'Hello, I need help with my project',
  isBookmarked: false,
  status: 'sent',
  createdAt: '2024-01-01T12:00:00Z',
}

const mockAIMessage: Message = {
  id: 'msg-2',
  conversationId: 'conv-1',
  type: 'assistant',
  content: 'I\'d be happy to help you with your project! Here are some suggestions...',
  confidenceScore: 0.85,
  sources: ['knowledge-base', 'project-guidelines'],
  isBookmarked: false,
  status: 'delivered',
  averageRating: 4.2,
  ratingCount: 5,
  metadata: {
    requiresHumanReview: false,
  },
  createdAt: '2024-01-01T12:01:00Z',
}

const mockStoreActions = {
  bookmarkMessage: jest.fn(),
  rateMessage: jest.fn(),
}

describe('MessageItem', () => {
  beforeEach(() => {
    mockUseAIAssistantStore.mockReturnValue(mockStoreActions)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders user message correctly', () => {
    render(<MessageItem message={mockUserMessage} />)
    
    expect(screen.getByText('Hello, I need help with my project')).toBeInTheDocument()
    expect(screen.getByText('12:00')).toBeInTheDocument()
    
    // User messages should not have action buttons
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders AI message with confidence score and rating', () => {
    render(<MessageItem message={mockAIMessage} />)
    
    expect(screen.getByText('I\'d be happy to help you with your project! Here are some suggestions...')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument() // Confidence score
    expect(screen.getByText('4.2')).toBeInTheDocument() // Rating
    expect(screen.getByText('(5)')).toBeInTheDocument() // Rating count
  })

  it('displays sources when available', () => {
    render(<MessageItem message={mockAIMessage} />)
    
    expect(screen.getByText('Sources:')).toBeInTheDocument()
    expect(screen.getByText('Source 1')).toBeInTheDocument()
    expect(screen.getByText('Source 2')).toBeInTheDocument()
  })

  it('shows human review warning when needed', () => {
    const messageWithReview = {
      ...mockAIMessage,
      metadata: { requiresHumanReview: true },
    }

    render(<MessageItem message={messageWithReview} />)
    
    // Should show warning icon (AlertTriangle)
    const warningIcon = screen.getByRole('button')
    expect(warningIcon).toBeInTheDocument()
  })

  it('handles copy to clipboard', async () => {
    render(<MessageItem message={mockAIMessage} />)
    
    const copyButton = screen.getByRole('button', { name: /copy message/i })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockAIMessage.content)
    })
  })

  it('handles bookmark functionality', async () => {
    const mockBookmarkMessage = jest.fn().mockResolvedValue({})
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreActions,
      bookmarkMessage: mockBookmarkMessage,
    })

    render(<MessageItem message={mockAIMessage} />)
    
    const bookmarkButton = screen.getByRole('button', { name: /bookmark message/i })
    fireEvent.click(bookmarkButton)

    // Should open bookmark dialog
    expect(screen.getByText('Bookmark Message')).toBeInTheDocument()
    
    // Add a note
    const noteInput = screen.getByPlaceholderText('Why is this message helpful?')
    fireEvent.change(noteInput, { target: { value: 'Great project suggestions' } })

    // Submit bookmark
    const bookmarkSubmitButton = screen.getByRole('button', { name: 'Bookmark' })
    fireEvent.click(bookmarkSubmitButton)

    await waitFor(() => {
      expect(mockBookmarkMessage).toHaveBeenCalledWith(mockAIMessage.id, 'Great project suggestions')
    })
  })

  it('shows bookmarked state', () => {
    const bookmarkedMessage = { ...mockAIMessage, isBookmarked: true }
    render(<MessageItem message={bookmarkedMessage} />)
    
    const bookmarkButton = screen.getByRole('button', { name: /bookmarked/i })
    expect(bookmarkButton).toBeDisabled()
  })

  it('handles rating functionality', async () => {
    const mockRateMessage = jest.fn().mockResolvedValue({})
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreActions,
      rateMessage: mockRateMessage,
    })

    render(<MessageItem message={mockAIMessage} />)
    
    const rateButton = screen.getByRole('button', { name: /rate this response/i })
    fireEvent.click(rateButton)

    // Should open rating popover
    expect(screen.getByText('Rate this response')).toBeInTheDocument()
    
    // Click on 5 stars
    const fiveStarButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.classList.contains('h-4')
    )
    if (fiveStarButton) {
      fireEvent.click(fiveStarButton)
    }

    await waitFor(() => {
      expect(mockRateMessage).toHaveBeenCalledWith(mockAIMessage.id, 5, '')
    })
  })

  it('handles regenerate functionality', () => {
    const mockRegenerate = jest.fn()
    render(<MessageItem message={mockAIMessage} onRegenerate={mockRegenerate} />)
    
    const regenerateButton = screen.getByRole('button', { name: /regenerate response/i })
    fireEvent.click(regenerateButton)

    expect(mockRegenerate).toHaveBeenCalled()
  })

  it('displays correct confidence score colors', () => {
    // High confidence (green)
    const highConfidenceMessage = { ...mockAIMessage, confidenceScore: 0.9 }
    const { rerender } = render(<MessageItem message={highConfidenceMessage} />)
    
    let confidenceBadge = screen.getByText('90%')
    expect(confidenceBadge.closest('.bg-green-100')).toBeInTheDocument()

    // Low confidence (red)
    const lowConfidenceMessage = { ...mockAIMessage, confidenceScore: 0.3 }
    rerender(<MessageItem message={lowConfidenceMessage} />)
    
    confidenceBadge = screen.getByText('30%')
    expect(confidenceBadge.closest('.bg-red-100')).toBeInTheDocument()
  })

  it('formats timestamp correctly', () => {
    render(<MessageItem message={mockAIMessage} />)
    
    // Should show time in HH:MM format
    expect(screen.getByText('12:01')).toBeInTheDocument()
  })

  it('shows delivery status icon', () => {
    render(<MessageItem message={mockAIMessage} />)
    
    // Should show checkmark for delivered status
    const deliveredIcon = screen.getByRole('button').querySelector('svg')
    expect(deliveredIcon).toBeInTheDocument()
  })
})
