import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TrendIndicator } from '../widgets/trend-indicator'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  TrendingUp: ({ className }: any) => <div data-testid="trending-up" className={className}>↗</div>,
  TrendingDown: ({ className }: any) => <div data-testid="trending-down" className={className}>↘</div>,
  Minus: ({ className }: any) => <div data-testid="minus" className={className}>-</div>
}))

describe('TrendIndicator', () => {
  it('renders positive trend correctly', () => {
    render(<TrendIndicator value={12.5} />)
    
    expect(screen.getByTestId('trending-up')).toBeInTheDocument()
    expect(screen.getByText('+12.5')).toBeInTheDocument()
  })

  it('renders negative trend correctly', () => {
    render(<TrendIndicator value={-8.3} />)
    
    expect(screen.getByTestId('trending-down')).toBeInTheDocument()
    expect(screen.getByText('8.3')).toBeInTheDocument()
  })

  it('renders neutral trend correctly', () => {
    render(<TrendIndicator value={0} />)
    
    expect(screen.getByTestId('minus')).toBeInTheDocument()
    expect(screen.getByText('0.0')).toBeInTheDocument()
  })

  it('formats percentage values correctly', () => {
    render(<TrendIndicator value={15.678} format="percentage" />)
    
    expect(screen.getByText('+15.7%')).toBeInTheDocument()
  })

  it('formats currency values correctly', () => {
    render(<TrendIndicator value={1250.50} format="currency" />)
    
    expect(screen.getByText('+$1,251')).toBeInTheDocument()
  })

  it('formats number values correctly', () => {
    render(<TrendIndicator value={1234.567} format="number" />)
    
    expect(screen.getByText('+1,235')).toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    render(<TrendIndicator value={10} showIcon={false} />)
    
    expect(screen.queryByTestId('trending-up')).not.toBeInTheDocument()
    expect(screen.getByText('+10.0')).toBeInTheDocument()
  })

  it('hides value when showValue is false', () => {
    render(<TrendIndicator value={10} showValue={false} />)
    
    expect(screen.getByTestId('trending-up')).toBeInTheDocument()
    expect(screen.queryByText('+10.0')).not.toBeInTheDocument()
  })

  it('applies correct color classes for positive values', () => {
    const { container } = render(<TrendIndicator value={5} />)
    
    expect(container.firstChild).toHaveClass('text-green-600')
  })

  it('applies correct color classes for negative values', () => {
    const { container } = render(<TrendIndicator value={-5} />)
    
    expect(container.firstChild).toHaveClass('text-red-600')
  })

  it('applies correct color classes for neutral values', () => {
    const { container } = render(<TrendIndicator value={0} />)
    
    expect(container.firstChild).toHaveClass('text-muted-foreground')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<TrendIndicator value={10} size="sm" />)
    expect(screen.getByTestId('trending-up')).toHaveClass('h-3', 'w-3')
    
    rerender(<TrendIndicator value={10} size="md" />)
    expect(screen.getByTestId('trending-up')).toHaveClass('h-4', 'w-4')
    
    rerender(<TrendIndicator value={10} size="lg" />)
    expect(screen.getByTestId('trending-up')).toHaveClass('h-5', 'w-5')
  })

  it('applies custom className', () => {
    const { container } = render(<TrendIndicator value={10} className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles very small positive values', () => {
    render(<TrendIndicator value={0.1} format="percentage" />)
    
    expect(screen.getByText('+0.1%')).toBeInTheDocument()
  })

  it('handles very small negative values', () => {
    render(<TrendIndicator value={-0.05} format="percentage" />)
    
    expect(screen.getByText('0.1%')).toBeInTheDocument()
  })

  it('handles large values correctly', () => {
    render(<TrendIndicator value={123456.789} format="currency" />)
    
    expect(screen.getByText('+$123,457')).toBeInTheDocument()
  })

  it('renders both icon and value by default', () => {
    render(<TrendIndicator value={7.5} />)
    
    expect(screen.getByTestId('trending-up')).toBeInTheDocument()
    expect(screen.getByText('+7.5')).toBeInTheDocument()
  })

  it('handles decimal precision correctly', () => {
    render(<TrendIndicator value={12.3456789} format="percentage" />)
    
    expect(screen.getByText('+12.3%')).toBeInTheDocument()
  })
})
