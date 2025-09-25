import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserManagementTable } from '@/components/admin/user-management/user-management-table'
import { User } from '@/lib/api/types'

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 days ago'),
}))

const mockUsers: User[] = [
  {
    id: '1',
    email: 'student@test.com',
    role: 'student',
    isEmailVerified: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    studentProfile: {
      id: '1',
      userId: '1',
      name: 'John Doe',
      studentId: 'CS2024001',
      level: 'Year 3',
      department: 'Computer Science',
      skills: ['JavaScript', 'React'],
      interests: ['Web Development'],
      preferredSpecializations: ['Software Engineering'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: '2',
    email: 'supervisor@test.com',
    role: 'supervisor',
    isEmailVerified: false,
    isActive: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    supervisorProfile: {
      id: '2',
      userId: '2',
      name: 'Dr. Jane Smith',
      title: 'Professor',
      department: 'Computer Science',
      specializations: ['Machine Learning'],
      researchInterests: ['AI'],
      availableSlots: 5,
      currentStudents: 3,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  },
]

const defaultProps = {
  users: mockUsers,
  isLoading: false,
  onEditUser: jest.fn(),
  onDeleteUser: jest.fn(),
  onToggleUserStatus: jest.fn(),
  onSendVerificationEmail: jest.fn(),
  onBulkAction: jest.fn(),
}

describe('UserManagementTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders user table with correct data', () => {
    render(<UserManagementTable {...defaultProps} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('student@test.com')).toBeInTheDocument()
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('supervisor@test.com')).toBeInTheDocument()
  })

  it('displays correct user roles and statuses', () => {
    render(<UserManagementTable {...defaultProps} />)

    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.getByText('Supervisor')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('Unverified')).toBeInTheDocument()
  })

  it('filters users by search query', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'John')

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Dr. Jane Smith')).not.toBeInTheDocument()
  })

  it('filters users by role', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const roleFilter = screen.getByDisplayValue('All Roles')
    await user.click(roleFilter)
    await user.click(screen.getByText('Student'))

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Dr. Jane Smith')).not.toBeInTheDocument()
  })

  it('filters users by status', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const statusFilter = screen.getByDisplayValue('All Status')
    await user.click(statusFilter)
    await user.click(screen.getByText('Active'))

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Dr. Jane Smith')).not.toBeInTheDocument()
  })

  it('sorts users by different fields', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const nameHeader = screen.getByText('Role')
    await user.click(nameHeader)

    // Should sort by role - student comes before supervisor alphabetically
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('John Doe')
    expect(rows[2]).toHaveTextContent('Dr. Jane Smith')
  })

  it('selects and deselects users', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const checkboxes = screen.getAllByRole('checkbox')
    const firstUserCheckbox = checkboxes[1] // Skip header checkbox

    await user.click(firstUserCheckbox)
    expect(firstUserCheckbox).toBeChecked()

    await user.click(firstUserCheckbox)
    expect(firstUserCheckbox).not.toBeChecked()
  })

  it('selects all users with header checkbox', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const headerCheckbox = screen.getAllByRole('checkbox')[0]
    await user.click(headerCheckbox)

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.slice(1).forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })

  it('shows bulk actions when users are selected', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const firstUserCheckbox = screen.getAllByRole('checkbox')[1]
    await user.click(firstUserCheckbox)

    expect(screen.getByText('1 user selected')).toBeInTheDocument()
    expect(screen.getByText('Activate')).toBeInTheDocument()
    expect(screen.getByText('Deactivate')).toBeInTheDocument()
  })

  it('calls onEditUser when edit action is clicked', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const editButton = screen.getByText('Edit User')
    await user.click(editButton)

    expect(defaultProps.onEditUser).toHaveBeenCalledWith(mockUsers[0])
  })

  it('calls onDeleteUser when delete action is clicked', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const deleteButton = screen.getByText('Delete User')
    await user.click(deleteButton)

    expect(defaultProps.onDeleteUser).toHaveBeenCalledWith('1')
  })

  it('calls onToggleUserStatus when status toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const deactivateButton = screen.getByText('Deactivate')
    await user.click(deactivateButton)

    expect(defaultProps.onToggleUserStatus).toHaveBeenCalledWith('1', false)
  })

  it('calls onSendVerificationEmail for unverified users', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[1]) // Second user (unverified)

    const sendVerificationButton = screen.getByText('Send Verification')
    await user.click(sendVerificationButton)

    expect(defaultProps.onSendVerificationEmail).toHaveBeenCalledWith('2')
  })

  it('calls onBulkAction when bulk action is performed', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const firstUserCheckbox = screen.getAllByRole('checkbox')[1]
    await user.click(firstUserCheckbox)

    const activateButton = screen.getByText('Activate')
    await user.click(activateButton)

    expect(defaultProps.onBulkAction).toHaveBeenCalledWith('activate', ['1'])
  })

  it('shows loading state', () => {
    render(<UserManagementTable {...defaultProps} isLoading={true} />)

    const loadingRows = screen.getAllByRole('row').slice(1) // Skip header
    expect(loadingRows).toHaveLength(5) // Should show 5 skeleton rows
  })

  it('shows empty state when no users match filters', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'nonexistent')

    expect(screen.getByText('No users found matching your criteria')).toBeInTheDocument()
  })

  it('displays correct results summary', () => {
    render(<UserManagementTable {...defaultProps} />)

    expect(screen.getByText('Showing 2 of 2 users')).toBeInTheDocument()
  })
})