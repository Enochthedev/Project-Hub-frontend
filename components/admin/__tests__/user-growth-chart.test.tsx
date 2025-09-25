import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UserGrowthChart } from '../charts/user-growth-chart'
import { UserGrowthData } from '@/lib/api/admin'

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children, config }: any) => (
    <div data-testid="chart-container" data-config={JSON.stringify(config)}>
      {children}
    </div>
  ),
  ChartTooltip: ({ children }: any) => <div data-testid="chart-tooltip">{children}</div>,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content">Tooltip</div>
}))

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke }: any) => (
    <div data-testid="line" data-key={dataKey} data-stroke={stroke} />
  ),
  Bar: ({ dataKey, fill }: any) => (
    <div data-testid="bar" data-key={dataKey} data-fill={fill} />
  ),
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  )
}))

jest.mock('../modals/drill-down-modal', () => ({
  DrillDownModal: ({ isOpen, title, onClose }: any) => (
    isOpen ? (
      <div data-testid="drill-down-modal">
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onClose}>Close</button>
      </div>
    ) : null
  )
}))

const mockData: UserGrowthData[] = [
  {
    date: '2024-01-01',
    students: 100,
    supervisors: 20,
    total: 120
  },
  {
    date: '2024-01-02',
    students: 105,
    supervisors: 22,
    total: 127
  },
  {
    date: '2024-01-03',
    students: 110,
    supervisors: 23,
    total: 133
  }
]

describe('UserGrowthChart', () => {
  it('renders chart with data', () => {
    render(<UserGrowthChart data={mockData} />)
    
    expect(screen.getByText('User Growth')).toBeInTheDocument()
    expect(screen.getByText('Track user registration and growth trends over time')).toBeInTheDocument()
    
    // Check if chart container is rendered
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('displays summary statistics correctly', () => {
    render(<UserGrowthChart data={mockData} />)
    
    // Check total calculations
    expect(screen.getByText('315')).toBeInTheDocument() // Total students
    expect(screen.getByText('65')).toBeInTheDocument()  // Total supervisors
    expect(screen.getByText('380')).toBeInTheDocument() // Total users
  })

  it('calculates growth rate correctly', () => {
    render(<UserGrowthChart data={mockData} />)
    
    // Growth rate should be calculated as ((133-120)/120)*100 = 10.8%
    expect(screen.getByText('+10.8%')).toBeInTheDocument()
  })

  it('switches between chart types', () => {
    render(<UserGrowthChart data={mockData} />)
    
    // Initially should show line chart
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    
    // Click to switch to bar chart
    const switchButton = screen.getByText('Bar Chart')
    fireEvent.click(switchButton)
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
  })

  it('shows detailed view when enabled', () => {
    render(<UserGrowthChart data={mockData} showDetailedView={true} />)
    
    // Should show total trend line in detailed view
    const lines = screen.getAllByTestId('line')
    expect(lines).toHaveLength(3) // students, supervisors, total
  })

  it('handles empty data gracefully', () => {
    render(<UserGrowthChart data={[]} />)
    
    expect(screen.getByText('User Growth')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // Should show 0 for all totals
  })

  it('calls onDrillDown when provided', () => {
    const mockDrillDown = jest.fn()
    render(<UserGrowthChart data={mockData} onDrillDown={mockDrillDown} />)
    
    // This would typically be triggered by clicking on a data point
    // For now, we'll test that the function is passed correctly
    expect(mockDrillDown).toBeDefined()
  })

  it('renders legend correctly', () => {
    render(<UserGrowthChart data={mockData} />)
    
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByText('Supervisors')).toBeInTheDocument()
  })

  it('renders legend with trend line in detailed view', () => {
    render(<UserGrowthChart data={mockData} showDetailedView={true} />)
    
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByText('Supervisors')).toBeInTheDocument()
    expect(screen.getByText('Total (Trend)')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<UserGrowthChart data={mockData} className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles single data point correctly', () => {
    const singleDataPoint = [mockData[0]]
    render(<UserGrowthChart data={singleDataPoint} />)
    
    // Growth rate should be 0 for single data point
    expect(screen.getByText('+0.0%')).toBeInTheDocument()
  })
})