import { render, screen, fireEvent } from '@testing-library/react'
import AtRiskStudentAlert from '@/components/supervisor/at-risk-student-alert'
import { AtRiskStudent } from '@/lib/api/supervisor'

const mockAtRiskStudent: AtRiskStudent = {
  studentId: 'student-1',
  studentName: 'John Doe',
  riskLevel: 'high',
  riskFactors: [
    '2 overdue milestones',
    '1 blocked milestone',
    'No recent activity',
  ],
  overdueMilestones: 2,
  blockedMilestones: 1,
  lastActivity: '2024-03-10T14:20:00Z',
  recommendedActions: [
    'Schedule meeting to discuss overdue milestones',
    'Help resolve blocked milestones',
  ],
  urgencyScore: 85,
}

const mockMediumRiskStudent: AtRiskStudent = {
  ...mockAtRiskStudent,
  studentId: 'student-2',
  studentName: 'Jane Smith',
  riskLevel: 'medium',
  urgencyScore: 65,
  overdueMilestones: 1,
  blockedMilestones: 0,
}

const mockLowRiskStudent: AtRiskStudent = {
  ...mockAtRiskStudent,
  studentId: 'student-3',
  studentName: 'Bob Johnson',
  riskLevel: 'low',
  urgencyScore: 45,
  overdueMilestones: 0,
  blockedMilestones: 1,
}

describe('AtRiskStudentAlert', () => {
  const mockOnContactStudent = jest.fn()
  const mockOnScheduleMeeting = jest.fn()
  const mockOnViewDetails = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders student information correctly', () => {
    render(
      <AtRiskStudentAlert 
        student={mockAtRiskStudent}
        onContactStudent={mockOnContactStudent}
        onScheduleMeeting={mockOnScheduleMeeting}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('HIGH RISK')).toBeInTheDocument()
    expect(screen.getByText('Urgency: 85/100')).toBeInTheDocument()
  })

  it('displays correct risk level styling for high risk', () => {
    render(<AtRiskStudentAlert student={mockAtRiskStudent} />)
    
    expect(screen.getByText('HIGH RISK')).toBeInTheDocument()
    // The card should have red border styling for high risk
  })

  it('displays correct risk level styling for medium risk', () => {
    render(<AtRiskStudentAlert student={mockMediumRiskStudent} />)
    
    expect(screen.getByText('MEDIUM RISK')).toBeInTheDocument()
  })

  it('displays correct risk level styling for low risk', () => {
    render(<AtRiskStudentAlert student={mockLowRiskStudent} />)
    
    expect(screen.getByText('LOW RISK')).toBeInTheDocument()
  })

  it('shows all risk factors', () => {
    render(<AtRiskStudentAlert student={mockAtRiskStudent} />)
    
    expect(screen.getByText('Risk Factors')).toBeInTheDocument()
    expect(screen.getByText('2 overdue milestones')).toBeInTheDocument()
    expect(screen.getByText('1 blocked milestone')).toBeInTheDocument()
    expect(screen.getByText('No recent activity')).toBeInTheDocument()
  })

  it('displays key metrics correctly', () => {
    render(<AtRiskStudentAlert student={mockAtRiskStudent} />)
    
    expect(screen.getByText('2')).toBeInTheDocument() // Overdue milestones
    expect(screen.getByText('1')).toBeInTheDocument() // Blocked milestones
  })

  it('shows last activity when present', () => {
    render(<AtRiskStudentAlert student={mockAtRiskStudent} />)
    
    expect(screen.getByText(/Last activity:/)).toBeInTheDocument()
  })

  it('does not show last activity when not present', () => {
    const studentWithoutActivity = {
      ...mockAtRiskStudent,
      lastActivity: null,
    }

    render(<AtRiskStudentAlert student={studentWithoutActivity} />)
    
    expect(screen.queryByText(/Last activity:/)).not.toBeInTheDocument()
  })

  it('displays all recommended actions', () => {
    render(<AtRiskStudentAlert student={mockAtRiskStudent} />)
    
    expect(screen.getByText('Recommended Actions')).toBeInTheDocument()
    expect(screen.getByText('Schedule meeting to discuss overdue milestones')).toBeInTheDocument()
    expect(screen.getByText('Help resolve blocked milestones')).toBeInTheDocument()
  })

  it('calls onContactStudent when Contact button is clicked', () => {
    render(
      <AtRiskStudentAlert 
        student={mockAtRiskStudent}
        onContactStudent={mockOnContactStudent}
        onScheduleMeeting={mockOnScheduleMeeting}
        onViewDetails={mockOnViewDetails}
      />
    )

    const contactButton = screen.getByRole('button', { name: /contact/i })
    fireEvent.click(contactButton)

    expect(mockOnContactStudent).toHaveBeenCalledWith('student-1')
  })

  it('calls onScheduleMeeting when Schedule Meeting button is clicked', () => {
    render(
      <AtRiskStudentAlert 
        student={mockAtRiskStudent}
        onContactStudent={mockOnContactStudent}
        onScheduleMeeting={mockOnScheduleMeeting}
        onViewDetails={mockOnViewDetails}
      />
    )

    const scheduleButton = screen.getByRole('button', { name: /schedule meeting/i })
    fireEvent.click(scheduleButton)

    expect(mockOnScheduleMeeting).toHaveBeenCalledWith('student-1')
  })

  it('calls onViewDetails when Details button is clicked', () => {
    render(
      <AtRiskStudentAlert 
        student={mockAtRiskStudent}
        onContactStudent={mockOnContactStudent}
        onScheduleMeeting={mockOnScheduleMeeting}
        onViewDetails={mockOnViewDetails}
      />
    )

    const detailsButton = screen.getByRole('button', { name: /details/i })
    fireEvent.click(detailsButton)

    expect(mockOnViewDetails).toHaveBeenCalledWith('student-1')
  })

  it('generates correct initials for student avatar', () => {
    render(<AtRiskStudentAlert student={mockAtRiskStudent} />)
    
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('applies correct urgency color for high urgency score', () => {
    render(<AtRiskStudentAlert student={mockAtRiskStudent} />)
    
    const urgencyText = screen.getByText('Urgency: 85/100')
    expect(urgencyText).toHaveClass('text-red-600')
  })

  it('applies correct urgency color for medium urgency score', () => {
    render(<AtRiskStudentAlert student={mockMediumRiskStudent} />)
    
    const urgencyText = screen.getByText('Urgency: 65/100')
    expect(urgencyText).toHaveClass('text-orange-600')
  })

  it('applies correct urgency color for low urgency score', () => {
    render(<AtRiskStudentAlert student={mockLowRiskStudent} />)
    
    const urgencyText = screen.getByText('Urgency: 45/100')
    expect(urgencyText).toHaveClass('text-yellow-600')
  })

  it('renders without callback functions', () => {
    render(<AtRiskStudentAlert student={mockAtRiskStudent} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /contact/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /schedule meeting/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument()
  })

  it('handles empty risk factors array', () => {
    const studentWithoutRiskFactors = {
      ...mockAtRiskStudent,
      riskFactors: [],
    }

    render(<AtRiskStudentAlert student={studentWithoutRiskFactors} />)
    
    expect(screen.getByText('Risk Factors')).toBeInTheDocument()
    // Should not crash and should still render the section
  })

  it('handles empty recommended actions array', () => {
    const studentWithoutActions = {
      ...mockAtRiskStudent,
      recommendedActions: [],
    }

    render(<AtRiskStudentAlert student={studentWithoutActions} />)
    
    expect(screen.getByText('Recommended Actions')).toBeInTheDocument()
    // Should not crash and should still render the section
  })
})