import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MetricCard } from '../widgets/metric-card'
import { Users } from 'lucide-react'

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, onClick, className, ...props }: any) => (
    <div 
      data-testid="card" 
      onClick={onClick} 
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon">Users Icon</div>
}))

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Total Users',
    value: 1250,
    icon: Users,
    description: 'All registered users'
  }

  it('renders basic metric card correctly', () => {
    render(<MetricCard {...defaultProps} />)
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1,250')).toBeInTheDocument()
    expect(screen.getByText('All registered users')).toBeInTheDocument()
    expect(screen.getByTestId('users-icon')).toBeInTheDocument()
  })

  it('formats string values correctly', () => {
    render(<MetricCard {...defaultProps} value="98.5%" />)
    
    expect(screen.getByText('98.5%')).toBeInTheDocument()
  })

  it('formats large numbers with commas', () => {
    render(<MetricCard {...defaultProps} value={1234567} />)
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('renders trend indicator when provided', () => {
    const trendComponent = <div data-testid="trend">+12.5%</div>
    render(<MetricCard {...defaultProps} trend={trendComponent} />)
    
    expect(screen.getByTestId('trend')).toBeInTheDocument()
    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })

  it('applies color variants correctly', () => {
    const { rerender } = render(<MetricCard {...defaultProps} color="green" />)
    
    // Check if the icon container has the green color class
    const iconContainer = screen.getByTestId('users-icon').parentElement
    expect(iconContainer).toHaveClass('text-green-600', 'bg-green-100')
    
    // Test other colors
    rerender(<MetricCard {...defaultProps} color="red" />)
    expect(iconContainer).toHaveClass('text-red-600', 'bg-red-100')
    
    rerender(<MetricCard {...defaultProps} color="blue" />)
    expect(iconContainer).toHaveClass('text-blue-600', 'bg-blue-100')
  })

  it('handles click events when onClick is provided', () => {
    const mockClick = jest.fn()
    render(<MetricCard {...defaultProps} onClick={mockClick} />)
    
    const card = screen.getByTestId('card')
    fireEvent.click(card)
    
    expect(mockClick).toHaveBeenCalledTimes(1)
  })

  it('applies hover styles when clickable', () => {
    const mockClick = jest.fn()
    render(<MetricCard {...defaultProps} onClick={mockClick} />)
    
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('cursor-pointer', 'hover:scale-105')
  })

  it('does not apply hover styles when not clickable', () => {
    render(<MetricCard {...defaultProps} />)
    
    const card = screen.getByTestId('card')
    expect(card).not.toHaveClass('cursor-pointer', 'hover:scale-105')
  })

  it('applies custom className', () => {
    render(<MetricCard {...defaultProps} className="custom-class" />)
    
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('custom-class')
  })

  it('renders without description', () => {
    const { title, value, icon } = defaultProps
    render(<MetricCard title={title} value={value} icon={icon} />)
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1,250')).toBeInTheDocument()
    expect(screen.queryByText('All registered users')).not.toBeInTheDocument()
  })

  it('renders without trend', () => {
    render(<MetricCard {...defaultProps} />)
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1,250')).toBeInTheDocument()
    expect(screen.queryByTestId('trend')).not.toBeInTheDocument()
  })

  it('handles zero values correctly', () => {
    render(<MetricCard {...defaultProps} value={0} />)
    
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('handles negative values correctly', () => {
    render(<MetricCard {...defaultProps} value={-150} />)
    
    expect(screen.getByText('-150')).toBeInTheDocument()
  })

  it('renders with both description and trend', () => {
    const trendComponent = <div data-testid="trend">+5.2%</div>
    render(<MetricCard {...defaultProps} trend={trendComponent} />)
    
    expect(screen.getByText('All registered users')).toBeInTheDocument()
    expect(screen.getByTestId('trend')).toBeInTheDocument()
  })
})
