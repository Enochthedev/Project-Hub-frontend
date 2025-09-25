import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserFormDialog } from '@/components/admin/user-management/user-form-dialog'
import { User } from '@/lib/api/types'

const mockUser: User = {
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
}

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  onSubmit: jest.fn(),
  isLoading: false,
}

describe('UserFormDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders create user dialog', () => {
    render(<UserFormDialog {...defaultProps} />)

    expect(screen.getByText('Create New User')).toBeInTheDocument()
    expect(screen.getByText('Create a new user account with profile information.')).toBeInTheDocument()
  })

  it('renders edit user dialog with existing data', () => {
    render(<UserFormDialog {...defaultProps} user={mockUser} />)

    expect(screen.getByText('Edit User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('student@test.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
  })

  it('shows password field for new users only', () => {
    const { rerender } = render(<UserFormDialog {...defaultProps} />)
    
    expect(screen.getByLabelText('Password')).toBeInTheDocument()

    rerender(<UserFormDialog {...defaultProps} user={mockUser} />)
    
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<UserFormDialog {...defaultProps} />)

    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByRole('button', { name: '' })

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows student profile fields when student role is selected', async () => {
    const user = userEvent.setup()
    render(<UserFormDialog {...defaultProps} />)

    // Navigate to profile tab
    await user.click(screen.getByText('Profile'))

    // Select student role first
    await user.click(screen.getByText('Basic Info'))
    const roleSelect = screen.getByDisplayValue('Select role')
    await user.click(roleSelect)
    await user.click(screen.getByText('Student'))

    // Go back to profile tab
    await user.click(screen.getByText('Profile'))

    expect(screen.getByText('Student Profile')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Student ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Academic Level')).toBeInTheDocument()
  })

  it('shows supervisor profile fields when supervisor role is selected', async () => {
    const user = userEvent.setup()
    render(<UserFormDialog {...defaultProps} />)

    // Select supervisor role
    await user.click(screen.getByText('Basic Info'))
    const roleSelect = screen.getByDisplayValue('Select role')
    await user.click(roleSelect)
    await user.click(screen.getByText('Supervisor'))

    // Navigate to profile tab
    await user.click(screen.getByText('Profile'))

    expect(screen.getByText('Supervisor Profile')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Available Slots')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<UserFormDialog {...defaultProps} />)

    const submitButton = screen.getByText('Create User')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<UserFormDialog {...defaultProps} />)

    const emailInput = screen.getByLabelText('Email Address')
    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByText('Create User')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('validates password length for new users', async () => {
    const user = userEvent.setup()
    render(<UserFormDialog {...defaultProps} />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '123')

    const submitButton = screen.getByText('Create User')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  it('handles form submission for new user', async () => {
    const user = userEvent.setup()
    const mockSubmit = jest.fn().mockResolvedValue(undefined)
    
    render(<UserFormDialog {...defaultProps} onSubmit={mockSubmit} />)

    // Fill basic info
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    
    const roleSelect = screen.getByDisplayValue('Select role')
    await user.click(roleSelect)
    await user.click(screen.getByText('Student'))

    // Fill student profile
    await user.click(screen.getByText('Profile'))
    await user.type(screen.getByLabelText('Full Name'), 'Test User')
    await user.type(screen.getByLabelText('Student ID'), 'TEST001')

    const levelSelect = screen.getByDisplayValue('Select level')
    await user.click(levelSelect)
    await user.click(screen.getByText('Year 1'))

    const deptSelect = screen.getByDisplayValue('Select department')
    await user.click(deptSelect)
    await user.click(screen.getByText('Computer Science'))

    const submitButton = screen.getByText('Create User')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
          role: 'student',
          studentName: 'Test User',
          studentId: 'TEST001',
          level: 'Year 1',
          department: 'Computer Science',
        })
      )
    })
  })

  it('handles form submission for existing user', async () => {
    const user = userEvent.setup()
    const mockSubmit = jest.fn().mockResolvedValue(undefined)
    
    render(<UserFormDialog {...defaultProps} user={mockUser} onSubmit={mockSubmit} />)

    // Update email
    const emailInput = screen.getByDisplayValue('student@test.com')
    await user.clear(emailInput)
    await user.type(emailInput, 'updated@test.com')

    const submitButton = screen.getByText('Update User')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'updated@test.com',
        })
      )
    })
  })

  it('handles file upload for profile picture', async () => {
    const user = userEvent.setup()
    render(<UserFormDialog {...defaultProps} />)

    // Select student role and go to profile
    const roleSelect = screen.getByDisplayValue('Select role')
    await user.click(roleSelect)
    await user.click(screen.getByText('Student'))

    await user.click(screen.getByText('Profile'))

    const fileInput = screen.getByLabelText('Profile Picture')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    await user.upload(fileInput, file)

    expect(fileInput.files?.[0]).toBe(file)
  })

  it('toggles account settings switches', async () => {
    const user = userEvent.setup()
    render(<UserFormDialog {...defaultProps} />)

    await user.click(screen.getByText('Settings'))

    const activeSwitch = screen.getByRole('switch', { name: /account status/i })
    const verifiedSwitch = screen.getByRole('switch', { name: /email verification/i })

    expect(activeSwitch).toBeChecked() // Default is true
    expect(verifiedSwitch).not.toBeChecked() // Default is false

    await user.click(activeSwitch)
    expect(activeSwitch).not.toBeChecked()

    await user.click(verifiedSwitch)
    expect(verifiedSwitch).toBeChecked()
  })

  it('closes dialog on cancel', async () => {
    const user = userEvent.setup()
    const mockOnOpenChange = jest.fn()
    
    render(<UserFormDialog {...defaultProps} onOpenChange={mockOnOpenChange} />)

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows loading state during submission', () => {
    render(<UserFormDialog {...defaultProps} isLoading={true} />)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.getByText('Saving...')).toBeDisabled()
    expect(screen.getByText('Cancel')).toBeDisabled()
  })
})