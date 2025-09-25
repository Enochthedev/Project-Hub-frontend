'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StudentProgressSummary } from '@/lib/api/supervisor'
import { 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Mail,
  Eye
} from 'lucide-react'

interface StudentProgressCardProps {
  student: StudentProgressSummary
  onViewDetails?: (studentId: string) => void
  onContactStudent?: (studentId: string, email: string) => void
}

export default function StudentProgressCard({ 
  student, 
  onViewDetails, 
  onContactStudent 
}: StudentProgressCardProps) {
  const getRiskBadgeVariant = (riskScore: number) => {
    if (riskScore >= 0.7) return 'destructive'
    if (riskScore >= 0.4) return 'secondary'
    return 'default'
  }

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 0.7) return 'High Risk'
    if (riskScore >= 0.4) return 'Medium Risk'
    return 'Low Risk'
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="" alt={student.studentName} />
              <AvatarFallback>
                {getInitials(student.studentName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{student.studentName}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {student.studentEmail}
              </p>
            </div>
          </div>
          <Badge variant={getRiskBadgeVariant(student.riskScore)}>
            {getRiskLabel(student.riskScore)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{student.completionRate.toFixed(1)}%</span>
          </div>
          <Progress value={student.completionRate} className="h-2" />
        </div>

        {/* Milestone Statistics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Completed
              </span>
              <span className="font-medium">{student.completedMilestones}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-blue-500" />
                In Progress
              </span>
              <span className="font-medium">{student.inProgressMilestones}</span>
            </div>
          </div>
          <div className="space-y-2">
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
        </div>

        {/* Next Milestone */}
        {student.nextMilestone && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Next Milestone</p>
            <p className="text-sm text-muted-foreground">
              {student.nextMilestone.title}
            </p>
            <div className="flex items-center justify-between mt-1">
              <Badge variant="outline" size="sm">
                {student.nextMilestone.priority}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Due: {new Date(student.nextMilestone.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Last Activity */}
        {student.lastActivity && (
          <div className="text-xs text-muted-foreground">
            Last activity: {new Date(student.lastActivity).toLocaleString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails?.(student.studentId)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onContactStudent?.(student.studentId, student.studentEmail)}
            className="flex-1"
          >
            <Mail className="h-3 w-3 mr-1" />
            Contact
          </Button>
        </div>

        {/* Warning Indicators */}
        {(student.overdueMilestones > 0 || student.blockedMilestones > 0) && (
          <div className="flex gap-1 pt-2">
            {student.overdueMilestones > 0 && (
              <Badge variant="secondary" size="sm">
                {student.overdueMilestones} overdue
              </Badge>
            )}
            {student.blockedMilestones > 0 && (
              <Badge variant="destructive" size="sm">
                {student.blockedMilestones} blocked
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}