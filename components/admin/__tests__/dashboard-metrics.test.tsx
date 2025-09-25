import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DashboardMetrics } from '../dashboard/dashboard-metrics'
import { DashboardMetrics as DashboardMetricsType } from '@/lib/api/admin'

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}))

jest.mock('../widgets/metric-card', () => ({
  MetricCard: ({ title, value, description, trend }: any) => (
    <div data-testid="metric-card">
      <div data-testid="metric-title">{title}</div>
      <div data-testid="metric-value">{value}</div>
      <div data-testid="metric-description">{description}</div>
      {trend && <div data-testid="metric-trend">{trend}</div>}
    </div>
  )
}))

jest.mock('../widgets/trend-indicator', () => ({
  TrendIndicator: ({ value, format }: any) => (
    <div data-testid="trend-indicator">
      {value > 0 ? '+' : ''}{value.toFixed(1)}%
    </div>
  )
}))

const mockData: DashboardMetricsType = {
  totalUsers: 1250,
  activeUsers: 890,
  totalProjects: 340,
  pendingApprovals: 25,
  systemHealth: 98.5,
  userGrowthRate: 12.3,
  projectCompletionRate: 87.2,
  averageResponseTime: 245
}

describe('DashboardMetrics', () => {
  it('renders loading state when no data is provided', () => {
    render(<DashboardMetrics />)
    
    // Should render skeleton cards
    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(8)
  })

  it('renders metrics correctly when data is provided', () => {
    render(<DashboardMetrics data={mockData} />)
    
    // Check if metric cards are rendered
    const metricCards = screen.getAllByTestId('metric-card')
    expect(metricCards).toHaveLength(8)

    // Check specific metrics
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1,250')).toBeInTheDocument()
    
    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('890')).toBeInTheDocument()
    
    expect(screen.getByText('System Health')).toBeInTheDocument()
    expect(screen.getByText('99%')).toBeInTheDocument()
  })

  it('displays correct trend indicators', () => {
    render(<DashboardMetrics data={mockData} />)
    
    const trendIndicators = screen.getAllByTestId('trend-indicator')
    expect(trendIndicators.length).toBeGreaterThan(0)
    
    // Check for positive trend indicator
    expect(screen.getByText('+12.3%')).toBeInTheDocument()
  })

  it('formats large numbers correctly', () => {
    const largeNumberData = {
      ...mockData,
      totalUsers: 125000,
      totalProjects: 5000
    }
    
    render(<DashboardMetrics data={largeNumberData} />)
    
    expect(screen.getByText('125,000')).toBeInTheDocument()
    expect(screen.getByText('5,000')).toBeInTheDocument()
  })

  it('handles zero values correctly', () => {
    const zeroData = {
      ...mockData,
      pendingApprovals: 0,
      userGrowthRate: 0
    }
    
    render(<DashboardMetrics data={zeroData} />)
    
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('+0.0%')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<DashboardMetrics data={mockData} className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('calculates system health status correctly', () => {
    const highHealthData = { ...mockData, systemHealth: 99.5 }
    const { rerender } = render(<DashboardMetrics data={highHealthData} />)
    
    // Should show high system health
    expect(screen.getByText('100%')).toBeInTheDocument()
    
    const lowHealthData = { ...mockData, systemHealth: 75.0 }
    rerender(<DashboardMetrics data={lowHealthData} />)
    
    // Should show lower system health
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})
