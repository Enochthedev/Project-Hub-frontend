'use client'

import { useMemo } from 'react'
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { Calendar, Clock, Flag, CheckCircle2, AlertCircle, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import type { Milestone } from '@/lib/api/types'

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: Date
  status: Milestone['status']
  priority: Milestone['priority']
  progress: number
  type: 'milestone'
}

const statusConfig = {
  not_started: { 
    icon: Circle, 
    color: 'text-gray-500', 
    bgColor: 'bg-gray-100',
    label: 'Not Started'
  },
  in_progress: { 
    icon: Clock, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-100',
    label: 'In Progress'
  },
  completed: { 
    icon: CheckCircle2, 
    color: 'text-green-500', 
    bgColor: 'bg-green-100',
    label: 'Completed'
  },
  overdue: { 
    icon: AlertCircle, 
    color: 'text-red-500', 
    bgColor: 'bg-red-100',
    label: 'Overdue'
  }
}

const priorityConfig = {
  low: { color: 'text-green-600', bgColor: 'bg-green-50', border: 'border-green-200' },
  medium: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', border: 'border-yellow-200' },
  high: { color: 'text-orange-600', bgColor: 'bg-orange-50', border: 'border-orange-200' },
  critical: { color: 'text-red-600', bgColor: 'bg-red-50', border: 'border-red-200' }
}

export function MilestoneTimeline() {
  const { milestones } = useMilestoneStore()

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      date: parseISO(milestone.dueDate),
      status: milestone.status,
      priority: milestone.priority,
      progress: milestone.progress,
      type: 'milestone' as const
    }))

    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [milestones])

  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {}
    
    timelineEvents.forEach(event => {
      const monthKey = format(event.date, 'yyyy-MM')
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(event)
    })

    return groups
  }, [timelineEvents])

  if (timelineEvents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No milestones to display</h3>
          <p className="text-muted-foreground text-center">
            Create some milestones to see them on the timeline.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Milestone Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([monthKey, events]) => (
              <div key={monthKey} className="space-y-6">
                {/* Month header */}
                <div className="flex items-center gap-4">
                  <div className="relative z-10 bg-background px-4">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      {format(parseISO(monthKey + '-01'), 'MMMM yyyy')}
                    </h3>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Events for this month */}
                {events.map((event, index) => {
                  const StatusIcon = statusConfig[event.status].icon
                  const statusStyle = statusConfig[event.status]
                  const priorityStyle = priorityConfig[event.priority]
                  const isOverdue = event.date < new Date() && event.status !== 'completed'

                  return (
                    <div key={event.id} className="relative flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={`
                        relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 
                        ${statusStyle.bgColor} ${statusStyle.color} border-current
                      `}>
                        <StatusIcon className="h-4 w-4" />
                      </div>

                      {/* Event content */}
                      <div className={`
                        flex-1 p-4 rounded-lg border-2 
                        ${priorityStyle.bgColor} ${priorityStyle.border}
                      `}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{event.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                              {statusStyle.label}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(event.date, 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Flag className={`h-4 w-4 ${priorityStyle.color}`} />
                              <span className={priorityStyle.color}>
                                {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{event.progress}%</span>
                            <Progress value={event.progress} className="w-20 h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}