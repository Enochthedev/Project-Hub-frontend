import { render, screen, fireEvent } from '@testing-library/react'
import { FollowUpSuggestions } from '@/components/ai/follow-up-suggestions'

describe('FollowUpSuggestions', () => {
  const mockSuggestions = [
    'How do I implement authentication?',
    'What are the best practices for database design?',
    'Can you explain the project timeline?',
  ]

  const mockOnSuggestionClick = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders suggestions correctly', () => {
    render(
      <FollowUpSuggestions
        suggestions={mockSuggestions}
        onSuggestionClick={mockOnSuggestionClick}
      />
    )

    expect(screen.getByText('Follow-up suggestions')).toBeInTheDocument()
    expect(screen.getByText('How do I implement authentication?')).toBeInTheDocument()
    expect(screen.getByText('What are the best practices for database design?')).toBeInTheDocument()
    expect(screen.getByText('Can you explain the project timeline?')).toBeInTheDocument()
  })

  it('handles suggestion clicks', () => {
    render(
      <FollowUpSuggestions
        suggestions={mockSuggestions}
        onSuggestionClick={mockOnSuggestionClick}
      />
    )

    const firstSuggestion = screen.getByText('How do I implement authentication?')
    fireEvent.click(firstSuggestion)

    expect(mockOnSuggestionClick).toHaveBeenCalledWith('How do I implement authentication?')
  })

  it('renders nothing when no suggestions provided', () => {
    const { container } = render(
      <FollowUpSuggestions
        suggestions={[]}
        onSuggestionClick={mockOnSuggestionClick}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when suggestions is undefined', () => {
    const { container } = render(
      <FollowUpSuggestions
        suggestions={undefined as any}
        onSuggestionClick={mockOnSuggestionClick}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('displays help text', () => {
    render(
      <FollowUpSuggestions
        suggestions={mockSuggestions}
        onSuggestionClick={mockOnSuggestionClick}
      />
    )

    expect(screen.getByText('Click on any suggestion to continue the conversation')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <FollowUpSuggestions
        suggestions={mockSuggestions}
        onSuggestionClick={mockOnSuggestionClick}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders correct number of suggestions', () => {
    render(
      <FollowUpSuggestions
        suggestions={mockSuggestions}
        onSuggestionClick={mockOnSuggestionClick}
      />
    )

    const suggestionButtons = screen.getAllByRole('button').filter(button => 
      mockSuggestions.some(suggestion => button.textContent?.includes(suggestion))
    )
    
    expect(suggestionButtons).toHaveLength(mockSuggestions.length)
  })

  it('handles empty suggestion text', () => {
    const suggestionsWithEmpty = ['Valid suggestion', '', 'Another valid suggestion']
    
    render(
      <FollowUpSuggestions
        suggestions={suggestionsWithEmpty}
        onSuggestionClick={mockOnSuggestionClick}
      />
    )

    expect(screen.getByText('Valid suggestion')).toBeInTheDocument()
    expect(screen.getByText('Another valid suggestion')).toBeInTheDocument()
    
    // Should still render 3 buttons (including empty one)
    const suggestionButtons = screen.getAllByRole('button').filter(button => 
      suggestionsWithEmpty.some(suggestion => 
        button.textContent?.includes(suggestion) || suggestion === ''
      )
    )
    expect(suggestionButtons).toHaveLength(3)
  })
})
