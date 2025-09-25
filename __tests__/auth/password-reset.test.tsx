/**
 * Integration tests for password reset workflow
 * 
 * Note: These tests require Jest and React Testing Library to be installed.
 * Run: pnpm add -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ForgotPasswordPage from '@/app/forgot-password/page'
import ResetPasswordPage from '@/app/reset-password/page'
import { useAuthStore } from '@/lib/stores/auth-store'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock auth store
jest.mock('@/lib/stores/auth-store')

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

describe('Password Reset Workflow', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    })

    mockUseAuthStore.mockReturnValue({
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
      user: null,
      tokens: null,
      isAuthenticated: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      logoutFromAllDevices: jest.fn(),
      refreshTokens: jest.fn(),
      verifyEmail: jest.fn(),
      resendEmailVerification: jest.fn(),
      setUser: jest.fn(),
      setTokens: jest.fn(),
      initialize: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Forgot Password Page', () => {
    it('should render forgot password form', () => {
      render(<ForgotPasswordPage />)
      
      expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument()
    })

    it('should validate email input', async () => {
      render(<ForgotPasswordPage />)
      
      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send reset link' })

      // Test empty email
      fireEvent.click(submitButton)
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })

      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })

      // Test non-UI email
      fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } })
      fireEvent.click(submitButton)
      await waitFor(() => {
        expect(screen.getByText('Please use your University of Ibadan email address')).toBeInTheDocument()
      })
    })

    it('should submit forgot password request with valid email', async () => {
      const mockForgotPassword = jest.fn().mockResolvedValue(undefined)
      mockUseAuthStore.mockReturnValue({
        ...mockUseAuthStore(),
        forgotPassword: mockForgotPassword,
      })

      render(<ForgotPasswordPage />)
      
      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send reset link' })

      fireEvent.change(emailInput, { target: { value: 'test@ui.edu.ng' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith('test@ui.edu.ng')
      })

      // Should show success message
      expect(screen.getByText('Check your email')).toBeInTheDocument()
    })

    it('should display error message on failure', async () => {
      const mockForgotPassword = jest.fn().mockRejectedValue(new Error('Network error'))
      mockUseAuthStore.mockReturnValue({
        ...mockUseAuthStore(),
        forgotPassword: mockForgotPassword,
        error: 'Failed to send reset email',
      })

      render(<ForgotPasswordPage />)
      
      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send reset link' })

      fireEvent.change(emailInput, { target: { value: 'test@ui.edu.ng' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to send reset email')).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      mockUseAuthStore.mockReturnValue({
        ...mockUseAuthStore(),
        isLoading: true,
      })

      render(<ForgotPasswordPage />)
      
      expect(screen.getByText('Sending reset link...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sending reset link/i })).toBeDisabled()
    })
  })

  describe('Reset Password Page', () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue('valid-token'),
    }

    beforeEach(() => {
      const mockUseSearchParams = require('next/navigation').useSearchParams
      mockUseSearchParams.mockReturnValue(mockSearchParams)
    })

    it('should render reset password form with valid token', () => {
      render(<ResetPasswordPage />)
      
      expect(screen.getByText('Reset your password')).toBeInTheDocument()
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reset password' })).toBeInTheDocument()
    })

    it('should show error for missing token', () => {
      mockSearchParams.get.mockReturnValue(null)
      
      render(<ResetPasswordPage />)
      
      expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument()
      expect(screen.getByText('Invalid or missing reset token. Please request a new password reset.')).toBeInTheDocument()
    })

    it('should validate password requirements', async () => {
      render(<ResetPasswordPage />)
      
      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      const submitButton = screen.getByRole('button', { name: 'Reset password' })

      // Test weak password
      fireEvent.change(passwordInput, { target: { value: 'weak' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })

      // Test password without uppercase
      fireEvent.change(passwordInput, { target: { value: 'password123!' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument()
      })

      // Test password mismatch
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'Different123!' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
      })
    })

    it('should show password strength indicator', async () => {
      render(<ResetPasswordPage />)
      
      const passwordInput = screen.getByLabelText('New Password')

      // Test weak password
      fireEvent.change(passwordInput, { target: { value: 'weak123' } })
      await waitFor(() => {
        expect(screen.getByText('Weak')).toBeInTheDocument()
      })

      // Test strong password
      fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } })
      await waitFor(() => {
        expect(screen.getByText('Strong')).toBeInTheDocument()
      })
    })

    it('should submit password reset with valid data', async () => {
      const mockResetPassword = jest.fn().mockResolvedValue(undefined)
      mockUseAuthStore.mockReturnValue({
        ...mockUseAuthStore(),
        resetPassword: mockResetPassword,
      })

      render(<ResetPasswordPage />)
      
      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      const submitButton = screen.getByRole('button', { name: 'Reset password' })

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('valid-token', 'NewPassword123!', 'NewPassword123!')
      })

      // Should show success message
      expect(screen.getByText('Password Reset Successful')).toBeInTheDocument()
    })

    it('should toggle password visibility', () => {
      render(<ResetPasswordPage />)
      
      const passwordInput = screen.getByLabelText('New Password')
      const toggleButton = passwordInput.parentElement?.querySelector('button')

      expect(passwordInput).toHaveAttribute('type', 'password')
      
      if (toggleButton) {
        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')
        
        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
      }
    })
  })

  describe('Complete Password Reset Flow', () => {
    it('should complete the full password reset workflow', async () => {
      // Step 1: Request password reset
      const mockForgotPassword = jest.fn().mockResolvedValue(undefined)
      mockUseAuthStore.mockReturnValue({
        ...mockUseAuthStore(),
        forgotPassword: mockForgotPassword,
      })

      const { rerender } = render(<ForgotPasswordPage />)
      
      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send reset link' })

      fireEvent.change(emailInput, { target: { value: 'test@ui.edu.ng' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith('test@ui.edu.ng')
        expect(screen.getByText('Check your email')).toBeInTheDocument()
      })

      // Step 2: Reset password with token
      const mockResetPassword = jest.fn().mockResolvedValue(undefined)
      mockUseAuthStore.mockReturnValue({
        ...mockUseAuthStore(),
        resetPassword: mockResetPassword,
      })

      const mockSearchParams = {
        get: jest.fn().mockReturnValue('valid-token'),
      }
      const mockUseSearchParams = require('next/navigation').useSearchParams
      mockUseSearchParams.mockReturnValue(mockSearchParams)

      rerender(<ResetPasswordPage />)

      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      const resetButton = screen.getByRole('button', { name: 'Reset password' })

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } })
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('valid-token', 'NewPassword123!', 'NewPassword123!')
        expect(screen.getByText('Password Reset Successful')).toBeInTheDocument()
      })

      // Step 3: Navigate to login
      const continueButton = screen.getByRole('button', { name: 'Continue to Login' })
      fireEvent.click(continueButton)

      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
