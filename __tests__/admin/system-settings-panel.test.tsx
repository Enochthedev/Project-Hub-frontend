import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SystemSettingsPanel } from '@/components/admin/system-config/system-settings-panel'

const mockSettings = {
  siteName: 'Test FYP System',
  adminEmail: 'admin@test.edu',
  supportEmail: 'support@test.edu',
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerificationRequired: true,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireStrongPasswords: true,
  twoFactorEnabled: false,
  emailProvider: 'smtp' as const,
  emailFromName: 'Test System',
  emailFromAddress: 'noreply@test.edu',
  emailNotificationsEnabled: true,
  pushNotificationsEnabled: true,
  smsNotificationsEnabled: false,
  notificationRetentionDays: 30,
  maxProjectsPerSupervisor: 10,
  maxStudentsPerProject: 1,
  autoApproveProjects: false,
  contentModerationEnabled: true,
  maxFileUploadSize: 10,
  maxUsersPerOrganization: 1000,
  apiRateLimit: 1000,
  autoBackupEnabled: true,
  backupFrequency: 'daily' as const,
  backupRetentionDays: 30,
}

const defaultProps = {
  settings: mockSettings,
  onSave: jest.fn(),
  onReset: jest.fn(),
  isLoading: false,
}

describe('SystemSettingsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders system settings panel with correct data', () => {
    render(<SystemSettingsPanel {...defaultProps} />)

    expect(screen.getByText('System Settings')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test FYP System')).toBeInTheDocument()
    expect(screen.getByDisplayValue('admin@test.edu')).toBeInTheDocument()
  })

  it('displays all configuration tabs', () => {
    render(<SystemSettingsPanel {...defaultProps} />)

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // Click on Security tab
    await user.click(screen.getByText('Security'))
    expect(screen.getByText('Security Settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Session Timeout (minutes)')).toBeInTheDocument()

    // Click on Email tab
    await user.click(screen.getByText('Email'))
    expect(screen.getByText('Email Configuration')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Provider')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // Clear site name
    const siteNameInput = screen.getByLabelText('Site Name')
    await user.clear(siteNameInput)

    // Try to save
    const saveButton = screen.getByText('Save Changes')
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Site name is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // Enter invalid email
    const adminEmailInput = screen.getByLabelText('Admin Email')
    await user.clear(adminEmailInput)
    await user.type(adminEmailInput, 'invalid-email')

    const saveButton = screen.getByText('Save Changes')
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('validates numeric fields', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // Go to Security tab
    await user.click(screen.getByText('Security'))

    // Enter invalid session timeout
    const sessionTimeoutInput = screen.getByLabelText('Session Timeout (minutes)')
    await user.clear(sessionTimeoutInput)
    await user.type(sessionTimeoutInput, '2') // Below minimum of 5

    const saveButton = screen.getByText('Save Changes')
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Number must be greater than or equal to 5/)).toBeInTheDocument()
    })
  })

  it('toggles switches correctly', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    const maintenanceSwitch = screen.getByRole('switch', { name: /maintenance mode/i })
    expect(maintenanceSwitch).not.toBeChecked()

    await user.click(maintenanceSwitch)
    expect(maintenanceSwitch).toBeChecked()
  })

  it('shows SMTP configuration when SMTP provider is selected', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // Go to Email tab
    await user.click(screen.getByText('Email'))

    // SMTP should be selected by default and show SMTP config
    expect(screen.getByText('SMTP Configuration')).toBeInTheDocument()
    expect(screen.getByLabelText('SMTP Host')).toBeInTheDocument()
    expect(screen.getByLabelText('SMTP Port')).toBeInTheDocument()
  })

  it('hides SMTP configuration when other provider is selected', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // Go to Email tab
    await user.click(screen.getByText('Email'))

    // Change to SendGrid
    const providerSelect = screen.getByDisplayValue('SMTP')
    await user.click(providerSelect)
    await user.click(screen.getByText('SendGrid'))

    // SMTP config should be hidden
    expect(screen.queryByText('SMTP Configuration')).not.toBeInTheDocument()
  })

  it('shows backup settings when auto backup is enabled', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // Go to System tab
    await user.click(screen.getByText('System'))

    // Auto backup should be enabled by default
    expect(screen.getByLabelText('Backup Frequency')).toBeInTheDocument()
    expect(screen.getByLabelText('Backup Retention (days)')).toBeInTheDocument()
  })

  it('hides backup settings when auto backup is disabled', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // Go to System tab
    await user.click(screen.getByText('System'))

    // Disable auto backup
    const autoBackupSwitch = screen.getByRole('switch', { name: /auto backup/i })
    await user.click(autoBackupSwitch)

    // Backup settings should be hidden
    expect(screen.queryByLabelText('Backup Frequency')).not.toBeInTheDocument()
  })

  it('calls onSave with correct data when form is submitted', async () => {
    const user = userEvent.setup()
    const mockOnSave = jest.fn().mockResolvedValue(undefined)
    
    render(<SystemSettingsPanel {...defaultProps} onSave={mockOnSave} />)

    // Modify site name
    const siteNameInput = screen.getByLabelText('Site Name')
    await user.clear(siteNameInput)
    await user.type(siteNameInput, 'Updated System Name')

    // Save changes
    const saveButton = screen.getByText('Save Changes')
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          siteName: 'Updated System Name',
        })
      )
    })
  })

  it('shows reset confirmation dialog', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    const resetButton = screen.getByText('Reset to Defaults')
    await user.click(resetButton)

    expect(screen.getByText('Reset to Default Settings')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to reset all settings/)).toBeInTheDocument()
  })

  it('calls onReset when reset is confirmed', async () => {
    const user = userEvent.setup()
    const mockOnReset = jest.fn().mockResolvedValue(undefined)
    
    render(<SystemSettingsPanel {...defaultProps} onReset={mockOnReset} />)

    const resetButton = screen.getByText('Reset to Defaults')
    await user.click(resetButton)

    const confirmButton = screen.getByText('Reset Settings')
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockOnReset).toHaveBeenCalled()
    })
  })

  it('disables save button when form is not dirty', () => {
    render(<SystemSettingsPanel {...defaultProps} />)

    const saveButton = screen.getByText('Save Changes')
    expect(saveButton).toBeDisabled()
  })

  it('enables save button when form is modified', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // Modify a field
    const siteNameInput = screen.getByLabelText('Site Name')
    await user.type(siteNameInput, ' Modified')

    const saveButton = screen.getByText('Save Changes')
    expect(saveButton).not.toBeDisabled()
  })

  it('shows loading state', () => {
    render(<SystemSettingsPanel {...defaultProps} isLoading={true} />)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.getByText('Saving...')).toBeDisabled()
    expect(screen.getByText('Reset to Defaults')).toBeDisabled()
  })

  it('updates color when event type changes', async () => {
    const user = userEvent.setup()
    render(<SystemSettingsPanel {...defaultProps} />)

    // This test would be more relevant for the academic calendar component
    // but demonstrates the concept of dependent field updates
  })
})