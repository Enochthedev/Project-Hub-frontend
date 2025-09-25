"use client"

import React from 'react'
import { CheckCircle, AlertCircle, Circle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProfileCompletionProps {
  completionPercentage: number
  missingFields: string[]
  onEditProfile?: () => void
}

export function ProfileCompletion({ 
  completionPercentage, 
  missingFields, 
  onEditProfile 
}: ProfileCompletionProps) {
  const isComplete = completionPercentage === 100
  const isNearlyComplete = completionPercentage >= 80

  const getCompletionStatus = () => {
    if (isComplete) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        title: 'Profile Complete!',
        description: 'Your profile is fully completed and optimized for project matching.',
      }
    } else if (isNearlyComplete) {
      return {
        icon: AlertCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        title: 'Almost There!',
        description: 'Just a few more details to complete your profile.',
      }
    } else {
      return {
        icon: Circle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        title: 'Complete Your Profile',
        description: 'Add more information to improve your project recommendations.',
      }
    }
  }

  const status = getCompletionStatus()
  const StatusIcon = status.icon

  return (
    <Card className={status.bgColor}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-6 w-6 ${status.color}`} />
            <div>
              <CardTitle className="text-lg">{status.title}</CardTitle>
              <CardDescription className="text-sm">
                {status.description}
              </CardDescription>
            </div>
          </div>
          <Badge variant={isComplete ? 'default' : 'secondary'} className="text-sm">
            {completionPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Profile Completion</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2"
          />
        </div>

        {/* Missing Fields */}
        {missingFields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Missing Information:
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isComplete && onEditProfile && (
          <Button 
            onClick={onEditProfile}
            size="sm"
            className="w-full"
          >
            Complete Profile
          </Button>
        )}

        {/* Benefits */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Benefits of a complete profile:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Better project recommendations</li>
            <li>Higher visibility to supervisors</li>
            <li>More accurate skill matching</li>
            <li>Improved collaboration opportunities</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}