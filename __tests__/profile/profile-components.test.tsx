import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileCompletion } from '@/components/profile/profile-completion'
import { MultiSelect } from '@/components/ui/multi-select'

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('Profile Components', () => {
  describe('ProfileCompletion', () => {
    const defaultProps = {
      completionPercentage: 75,
      missingFields: ['Bio', 'Profile Picture'],
      onEditProfile: jest.fn(),
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should render completion percentage', () => {
      render(<ProfileCompletion {...defaultProps} />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should show "Profile Complete!" when 100% complete', () => {
      render(
        <ProfileCompletion
          {...defaultProps}
          completionPercentage={100}
          missingFields={[]}
        />
      )
      expect(screen.getByText('Profile Complete!')).toBeInTheDocument()
    })

    it('should show "Almost There!" when nearly complete', () => {
      render(
        <ProfileCompletion
          {...defaultProps}
          completionPercentage={85}
        />
      )
      expect(screen.getByText('Almost There!')).toBeInTheDocument()
    })

    it('should show "Complete Your Profile" when not nearly complete', () => {
      render(
        <ProfileCompletion
          {...defaultProps}
          completionPercentage={50}
        />
      )
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
    })

    it('should display missing fields', () => {
      render(<ProfileCompletion {...defaultProps} />)
      expect(screen.getByText('Bio')).toBeInTheDocument()
      expect(screen.getByText('Profile Picture')).toBeInTheDocument()
    })

    it('should not show missing fields section when complete', () => {
      render(
        <ProfileCompletion
          {...defaultProps}
          completionPercentage={100}
          missingFields={[]}
        />
      )
      expect(screen.queryByText('Missing Information:')).not.toBeInTheDocument()
    })

    it('should call onEditProfile when Complete Profile button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProfileCompletion {...defaultProps} />)
      
      const button = screen.getByText('Complete Profile')
      await user.click(button)
      
      expect(defaultProps.onEditProfile).toHaveBeenCalledTimes(1)
    })

    it('should not show Complete Profile button when 100% complete', () => {
      render(
        <ProfileCompletion
          {...defaultProps}
          completionPercentage={100}
          missingFields={[]}
        />
      )
      expect(screen.queryByText('Complete Profile')).not.toBeInTheDocument()
    })

    it('should display benefits list', () => {
      render(<ProfileCompletion {...defaultProps} />)
      expect(screen.getByText('Benefits of a complete profile:')).toBeInTheDocument()
      expect(screen.getByText('Better project recommendations')).toBeInTheDocument()
      expect(screen.getByText('Higher visibility to supervisors')).toBeInTheDocument()
    })
  })

  describe('MultiSelect', () => {
    const defaultProps = {
      options: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript'],
      value: ['JavaScript', 'React'],
      onChange: jest.fn(),
      placeholder: 'Select skills...',
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should render selected values as badges', () => {
      render(<MultiSelect {...defaultProps} />)
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
    })

    it('should show placeholder when no values selected', () => {
      render(<MultiSelect {...defaultProps} value={[]} />)
      expect(screen.getByText('Select skills...')).toBeInTheDocument()
    })

    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup()
      render(<MultiSelect {...defaultProps} />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Python')).toBeInTheDocument()
        expect(screen.getByText('Node.js')).toBeInTheDocument()
      })
    })

    it('should filter options when searching', async () => {
      const user = userEvent.setup()
      render(<MultiSelect {...defaultProps} />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      const searchInput = screen.getByPlaceholderText('Search items...')
      await user.type(searchInput, 'Type')
      
      await waitFor(() => {
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
        expect(screen.queryByText('Python')).not.toBeInTheDocument()
      })
    })

    it('should call onChange when option is selected', async () => {
      const user = userEvent.setup()
      render(<MultiSelect {...defaultProps} />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      const pythonOption = screen.getByText('Python')
      await user.click(pythonOption)
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['JavaScript', 'React', 'Python'])
    })

    it('should call onChange when option is deselected', async () => {
      const user = userEvent.setup()
      render(<MultiSelect {...defaultProps} />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      const jsOption = screen.getByText('JavaScript')
      await user.click(jsOption)
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['React'])
    })

    it('should remove item when X is clicked on badge', async () => {
      const user = userEvent.setup()
      render(<MultiSelect {...defaultProps} />)
      
      const badges = screen.getAllByText('×')
      await user.click(badges[0]) // Click X on first badge (JavaScript)
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['React'])
    })

    it('should respect maxItems limit', async () => {
      const user = userEvent.setup()
      render(<MultiSelect {...defaultProps} maxItems={2} />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      const pythonOption = screen.getByText('Python')
      await user.click(pythonOption)
      
      // Should not add Python since we already have 2 items and maxItems is 2
      expect(defaultProps.onChange).not.toHaveBeenCalled()
    })

    it('should show item count when maxItems is set', () => {
      render(<MultiSelect {...defaultProps} maxItems={5} />)
      expect(screen.getByText('2/5 items selected')).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<MultiSelect {...defaultProps} disabled />)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })

    it('should show empty text when no options match search', async () => {
      const user = userEvent.setup()
      render(<MultiSelect {...defaultProps} emptyText="No skills found." />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      const searchInput = screen.getByPlaceholderText('Search items...')
      await user.type(searchInput, 'NonexistentSkill')
      
      await waitFor(() => {
        expect(screen.getByText('No skills found.')).toBeInTheDocument()
      })
    })
  })
})
