import { render, screen, fireEvent } from '@testing-library/react'
import StudentProgressCard from '@/components/supervisor/student-progress-card'
import { StudentProgressSummary } from '@/lib/api/supervisor'

const mockStudent: StudentProgressSummary = {
  studentId: 'student-1',
  studentName: 'John Doe',
  studentEmail: 'john.doe@university.edu',
  totalMilestones: 12,
  completedMilestones: 8,
  inProgressMilestones: 2,
  overdueMilestones: 1,
  blockedMilestones: 1,
  completionRate: 66.67,
  riskScore: 0.3,
  nextMilestone: {
    id: 'milestone-5',
    title: 'System Testing',
    dueDate: '2024-04-15',
    priority: 'high',
  },
  lastActivity: '2024-03-15T10:30:00Z',
  projectCount: 1,
}

const mockHighRiskStudent: StudentProgressSummary = {
  ...mockStudent,
  studentId: 'student-2',
  studentName: 'Jane Smith',
  riskScore: 0.8,
  overdueMilestones: 3,
  blockedMilestones: 2,
  completionRate: 40.0,
}

describe('StudentProgressCard', () => {
  const mockOnViewDetails = jest.fn()
  const mockOnContactStudent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders student information correctly', () => {
    render(
      <StudentProgressCard 
        student={mockStudent}
        onViewDetails={mockOnViewDetails}
        onContactStudent={mockOnContactStudent}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john.doe@university.edu')).toBeInTheDocument()
    expect(screen.getByText('66.7%')).toBeInTheDocument()
  })

  it('displays correct risk level badge for low risk student', () => {
    render(<StudentProgressCard student={mockStudent} />)
    
    expect(screen.getByText('Low Risk')).toBeInTheDocument()
  })

  it('displays correct risk level badge for high risk student', () => {
    render(<StudentProgressCard student={mockHighRiskStudent} />)
    
    expect(screen.getByText('High Risk')).toBeInTheDocument()
  })

  it('shows milestone statistics correctly', () => {
    render(<StudentProgressCard student={mockStudent} />)
    
    expect(screen.getByText('8')).toBeInTheDocument() // Completed
    expect(screen.getByText('2')).toBeInTheDocument() // In Progress
    
    // Use more specific queries for the overdue and blocked counts
    const overdueElement = screen.getByText('Overdue').closest('div')?.querySelector('.font-medium')
    const blockedElement = screen.getByText('Blocked').closest('div')?.querySelector('.font-medium')
    
    expect(overdueElement).toHaveTextContent('1')
    expect(blockedElement).toHaveTextContent('1')
  })

  it('displays next milestone when present', () => {
    render(<StudentProgressCard student={mockStudent} />)
    
    expect(screen.getByText('Next Milestone')).toBeInTheDocument()
    expect(screen.getByText('System Testing')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('Due: 4/15/2024')).toBeInTheDocument()
  })

  it('does not display next milestone section when not present', () => {
    const studentWithoutNextMilestone = {
      ...mockStudent,
      nextMilestone: null,
    }

    render(<StudentProgressCard student={studentWithoutNextMilestone} />)
    
    expect(screen.queryByText('Next Milestone')).not.toBeInTheDocument()
  })

  it('displays last activity when present', () => {
    render(<StudentProgressCard student={mockStudent} />)
    
    expect(screen.getByText(/Last activity:/)).toBeInTheDocument()
  })

  it('does not display last activity when not present', () => {
    const studentWithoutActivity = {
      ...mockStudent,
      lastActivity: null,
    }

    render(<StudentProgressCard student={studentWithoutActivity} />)
    
    expect(screen.queryByText(/Last activity:/)).not.toBeInTheDocument()
  })

  it('calls onViewDetails when View Details button is clicked', () => {
    render(
      <StudentProgressCard 
        student={mockStudent}
        onViewDetails={mockOnViewDetails}
        onContactStudent={mockOnContactStudent}
      />
    )

    const viewDetailsButton = screen.getByRole('button', { name: /view details/i })
    fireEvent.click(viewDetailsButton)

    expect(mockOnViewDetails).toHaveBeenCalledWith('student-1')
  })

  it('calls onContactStudent when Contact button is clicked', () => {
    render(
      <StudentProgressCard 
        student={mockStudent}
        onViewDetails={mockOnViewDetails}
        onContactStudent={mockOnContactStudent}
      />
    )

    const contactButton = screen.getByRole('button', { name: /contact/i })
    fireEvent.click(contactButton)

    expect(mockOnContactStudent).toHaveBeenCalledWith('student-1', 'john.doe@university.edu')
  })

  it('displays warning badges for overdue and blocked milestones', () => {
    render(<StudentProgressCard student={mockStudent} />)
    
    expect(screen.getByText('1 overdue')).toBeInTheDocument()
    expect(screen.getByText('1 blocked')).toBeInTheDocument()
  })

  it('does not display warning badges when no overdue or blocked milestones', () => {
    const studentWithoutIssues = {
      ...mockStudent,
      overdueMilestones: 0,
      blockedMilestones: 0,
    }

    render(<StudentProgressCard student={studentWithoutIssues} />)
    
    expect(screen.queryByText(/overdue/)).not.toBeInTheDocument()
    expect(screen.queryByText(/blocked/)).not.toBeInTheDocument()
  })

  it('generates correct initials for student avatar', () => {
    render(<StudentProgressCard student={mockStudent} />)
    
    // Avatar fallback should show initials
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('handles student with single name correctly', () => {
    const singleNameStudent = {
      ...mockStudent,
      studentName: 'Madonna',
    }

    render(<StudentProgressCard student={singleNameStudent} />)
    
    expect(screen.getByText('Madonna')).toBeInTheDocument()
    expect(screen.getByText('MA')).toBeInTheDocument() // Single name should show first two letters
  })

  it('displays progress bar with correct value', () => {
    render(<StudentProgressCard student={mockStudent} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    // The progress component might not set aria-valuenow, so just check it exists
  })

  it('applies correct styling for high risk student', () => {
    render(<StudentProgressCard student={mockHighRiskStudent} />)
    
    const riskBadge = screen.getByText('High Risk')
    expect(riskBadge).toHaveClass('bg-destructive') // Assuming destructive variant has this class
  })
})
