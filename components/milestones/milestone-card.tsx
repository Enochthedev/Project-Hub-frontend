'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, Flag, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import { EditMilestoneDialog } from './edit-milestone-dialog'
import { DeleteMilestoneDialog } from './delete-milestone-dialog'
import { ProgressUpdateDialog } from './progress-update-dialog'
import type { Milestone } from '@/lib/api/types'

interface MilestoneCardProps {
  milestone: Milestone
}

const statusConfig = {
  not_started: { label: 'Not Started', variant: 'secondary' as const, color: 'bg-gray-500' },
  in_progress: { label: 'In Progress', variant: 'default' as const, color: 'bg-blue-500' },
  completed: { label: 'Completed', variant: 'default' as const, color: 'bg-green-500' },
  overdue: { label: 'Overdue', variant: 'destructive' as const, color: 'bg-red-500' }
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-green-600', icon: '🟢' },
  medium: { label: 'Medium', color: 'text-yellow-600', icon: '🟡' },
  high: { label: 'High', color: 'text-orange-600', icon: '🟠' },
  critical: { label: 'Critical', color: 'text-red-600', icon: '🔴' }
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  
  const { updateProgress } = useMilestoneStore()

  const status = statusConfig[milestone.status]
  const priority = priorityConfig[milestone.priority]
  const dueDate = new Date(milestone.dueDate)
  const isOverdue = dueDate < new Date() && milestone.status !== 'completed'

  const handleProgressClick = () => {
    if (milestone.status !== 'completed') {
      setShowProgressDialog(true)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{milestone.title}</h3>
                <span className={`text-sm ${priority.color}`}>
                  {priority.icon}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due {format(dueDate, 'MMM d, yyyy')}</span>
                  {isOverdue && (
                    <Badge variant="destructive" className="ml-2">
                      Overdue
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Flag className="h-4 w-4" />
                  <span>{priority.label}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={status.variant}>
                {status.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="More options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleProgressClick}>
                    <Clock className="h-4 w-4 mr-2" />
                    Update Progress
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {milestone.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Progress</span>
              <span className="font-medium">{milestone.progress}%</span>
            </div>
            <Progress 
              value={milestone.progress} 
              className="cursor-pointer"
              onClick={handleProgressClick}
            />
          </div>
        </CardContent>
      </Card>

      <EditMilestoneDialog
        milestone={milestone}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteMilestoneDialog
        milestone={milestone}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />

      <ProgressUpdateDialog
        milestone={milestone}
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
      />
    </>
  )
}
