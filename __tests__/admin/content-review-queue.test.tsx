import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentReviewQueue, ContentItem } from '@/components/admin/content-moderation/content-review-queue'

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 days ago'),
}))

const mockContentItems: ContentItem[] = [
  {
    id: '1',
    type: 'project',
    title: 'Machine Learning Project',
    content: 'This is a comprehensive machine learning project focusing on...',
    author: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@test.com',
      profilePicture: 'avatar1.jpg',
    },
    status: 'pending',
    priority: 'high',
    submittedAt: '2024-01-01T00:00:00Z',
    metadata: {
      specialization: 'Machine Learning',
      difficultyLevel: 'advanced',
      tags: ['AI', 'Python', 'TensorFlow'],
    },
  },
  {
    id: '2',
    type: 'comment',
    title: 'Comment on Project ABC',
    content: 'This project looks interesting but needs more details...',
    author: {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@test.com',
    },
    status: 'flagged',
    priority: 'medium',
    submittedAt: '2024-01-02T00:00:00Z',
    flagReason: 'Inappropriate language',
  },
]

const defaultProps = {
  items: mockContentItems,
  isLoading: false,
  onApprove: jest.fn(),
  onReject: jest.fn(),
  onFlag: jest.fn(),
  onBulkAction: jest.fn(),
  onViewDetails: jest.fn(),
}

describe('ContentReviewQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders content items with correct data', () => {
    render(<ContentReviewQueue {...defaultProps} />)

    expect(screen.getByText('Machine Learning Project')).toBeInTheDocument()
    expect(screen.getByText('Comment on Project ABC')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays correct content types and statuses', () => {
    render(<ContentReviewQueue {...defaultProps} />)

    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.getByText('Comment')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Flagged')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('filters content by search query', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText(/search content/i)
    await user.type(searchInput, 'Machine Learning')

    expect(screen.getByText('Machine Learning Project')).toBeInTheDocument()
    expect(screen.queryByText('Comment on Project ABC')).not.toBeInTheDocument()
  })

  it('filters content by type', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const typeFilter = screen.getByDisplayValue('All Types')
    await user.click(typeFilter)
    await user.click(screen.getByText('Project'))

    expect(screen.getByText('Machine Learning Project')).toBeInTheDocument()
    expect(screen.queryByText('Comment on Project ABC')).not.toBeInTheDocument()
  })

  it('filters content by status', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const statusFilter = screen.getByDisplayValue('Pending')
    await user.click(statusFilter)
    await user.click(screen.getByText('Flagged'))

    expect(screen.queryByText('Machine Learning Project')).not.toBeInTheDocument()
    expect(screen.getByText('Comment on Project ABC')).toBeInTheDocument()
  })

  it('filters content by priority', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const priorityFilter = screen.getByDisplayValue('All Priority')
    await user.click(priorityFilter)
    await user.click(screen.getByText('High'))

    expect(screen.getByText('Machine Learning Project')).toBeInTheDocument()
    expect(screen.queryByText('Comment on Project ABC')).not.toBeInTheDocument()
  })

  it('sorts content by different fields', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const typeHeader = screen.getByText('Type')
    await user.click(typeHeader)

    // Should sort by type - comment comes before project alphabetically
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Comment on Project ABC')
    expect(rows[2]).toHaveTextContent('Machine Learning Project')
  })

  it('selects and deselects content items', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const checkboxes = screen.getAllByRole('checkbox')
    const firstItemCheckbox = checkboxes[1] // Skip header checkbox

    await user.click(firstItemCheckbox)
    expect(firstItemCheckbox).toBeChecked()

    await user.click(firstItemCheckbox)
    expect(firstItemCheckbox).not.toBeChecked()
  })

  it('selects all items with header checkbox', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const headerCheckbox = screen.getAllByRole('checkbox')[0]
    await user.click(headerCheckbox)

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.slice(1).forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })

  it('shows bulk actions when items are selected', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const firstItemCheckbox = screen.getAllByRole('checkbox')[1]
    await user.click(firstItemCheckbox)

    expect(screen.getByText('1 item selected')).toBeInTheDocument()
    expect(screen.getByText('Approve')).toBeInTheDocument()
    expect(screen.getByText('Reject')).toBeInTheDocument()
    expect(screen.getByText('Flag')).toBeInTheDocument()
  })

  it('calls onViewDetails when view details action is clicked', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const viewDetailsButton = screen.getByText('View Details')
    await user.click(viewDetailsButton)

    expect(defaultProps.onViewDetails).toHaveBeenCalledWith(mockContentItems[0])
  })

  it('opens review dialog when approve action is clicked', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const approveButton = screen.getByText('Approve')
    await user.click(approveButton)

    expect(screen.getByText('Approve Content')).toBeInTheDocument()
  })

  it('opens review dialog when reject action is clicked', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const rejectButton = screen.getByText('Reject')
    await user.click(rejectButton)

    expect(screen.getByText('Reject Content')).toBeInTheDocument()
  })

  it('opens review dialog when flag action is clicked', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const flagButton = screen.getByText('Flag for Review')
    await user.click(flagButton)

    expect(screen.getByText('Flag Content')).toBeInTheDocument()
  })

  it('submits review with notes', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const approveButton = screen.getByText('Approve')
    await user.click(approveButton)

    const notesTextarea = screen.getByPlaceholderText(/add any notes/i)
    await user.type(notesTextarea, 'Looks good to me')

    const submitButton = screen.getByText('Approve')
    await user.click(submitButton)

    expect(defaultProps.onApprove).toHaveBeenCalledWith('1', 'Looks good to me')
  })

  it('calls onBulkAction when bulk action is performed', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const firstItemCheckbox = screen.getAllByRole('checkbox')[1]
    await user.click(firstItemCheckbox)

    const approveButton = screen.getByText('Approve')
    await user.click(approveButton)

    expect(defaultProps.onBulkAction).toHaveBeenCalledWith('approve', ['1'])
  })

  it('shows loading state', () => {
    render(<ContentReviewQueue {...defaultProps} isLoading={true} />)

    const loadingRows = screen.getAllByRole('row').slice(1) // Skip header
    expect(loadingRows).toHaveLength(5) // Should show 5 skeleton rows
  })

  it('shows empty state when no items match filters', async () => {
    const user = userEvent.setup()
    render(<ContentReviewQueue {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText(/search content/i)
    await user.type(searchInput, 'nonexistent')

    expect(screen.getByText('No content items found matching your criteria')).toBeInTheDocument()
  })

  it('displays correct results summary', () => {
    render(<ContentReviewQueue {...defaultProps} />)

    expect(screen.getByText('Showing 2 of 2 items')).toBeInTheDocument()
  })

  it('truncates long content in table', () => {
    const longContentItem = {
      ...mockContentItems[0],
      content: 'A'.repeat(150), // Long content that should be truncated
    }

    render(<ContentReviewQueue {...defaultProps} items={[longContentItem]} />)

    const truncatedContent = screen.getByText(/A{100}\.\.\./)
    expect(truncatedContent).toBeInTheDocument()
  })
})
