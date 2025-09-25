'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AtRiskStudent } from '@/lib/api/supervisor'
import { 
  AlertTriangle, 
  Clock, 
  MessageCircle, 
  Calendar,
  TrendingDown,
  User
} from 'lucide-react'

interface AtRiskStudentAlertProps {
  student: AtRiskStudent
  onContactStudent?: (studentId: string) => void
  onScheduleMeeting?: (studentId: string) => void
  onViewDetails?: (studentId: string) => void
}

export default function AtRiskStudentAlert({ 
  student, 
  onContactStudent, 
  onScheduleMeeting, 
  onViewDetails 
}: AtRiskStudentAlertProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getUrgencyColor = (urgencyScore: number) => {
    if (urgencyScore >= 80) return 'text-red-600'
    if (urgencyScore >= 60) return 'text-orange-600'
    return 'text-yellow-600'
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(part => part.length > 0)
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return parts
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={`border-l-4 ${getRiskColor(student.riskLevel)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={student.studentName} />
              <AvatarFallback>
                {getInitials(student.studentName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-lg">{student.studentName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRiskBadgeVariant(student.riskLevel)}>
                  {student.riskLevel.toUpperCase()} RISK
                </Badge>
                <span className={`text-sm font-medium ${getUrgencyColor(student.urgencyScore)}`}>
                  Urgency: {student.urgencyScore}/100
                </span>
              </div>
            </div>
          </div>
          <AlertTriangle className={`h-5 w-5 ${getRiskColor(student.riskLevel).split(' ')[0]}`} />
        </div>

        {/* Risk Factors */}
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            Risk Factors
          </h5>
          <div className="space-y-1">
            {student.riskFactors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1 h-1 bg-current rounded-full" />
                {factor}
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-500" />
              Overdue
            </span>
            <span className="font-medium text-orange-600">
              {student.overdueMilestones}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              Blocked
            </span>
            <span className="font-medium text-red-600">
              {student.blockedMilestones}
            </span>
          </div>
        </div>

        {/* Last Activity */}
        {student.lastActivity && (
          <div className="mb-4 text-sm text-muted-foreground">
            Last activity: {new Date(student.lastActivity).toLocaleString()}
          </div>
        )}

        {/* Recommended Actions */}
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-2">Recommended Actions</h5>
          <div className="space-y-1">
            {student.recommendedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => onContactStudent?.(student.studentId)}
            className="flex-1"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Contact
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onScheduleMeeting?.(student.studentId)}
            className="flex-1"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Schedule Meeting
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails?.(student.studentId)}
          >
            <User className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
