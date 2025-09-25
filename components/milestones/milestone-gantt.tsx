'use client'

import { useMemo, useState } from 'react'
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, addDays, subDays } from 'date-fns'
import { BarChart3, Calendar, ZoomIn, ZoomOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import type { Milestone } from '@/lib/api/types'

interface GanttItem {
  id: string
  title: string
  startDate: Date
  endDate: Date
  progress: number
  status: Milestone['status']
  priority: Milestone['priority']
}

const statusColors = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  overdue: 'bg-red-500'
}

const priorityColors = {
  low: 'border-green-300',
  medium: 'border-yellow-300',
  high: 'border-orange-300',
  critical: 'border-red-300'
}

export function MilestoneGantt() {
  const [zoomLevel, setZoomLevel] = useState<'month' | 'week' | 'day'>('month')
  const { milestones } = useMilestoneStore()

  const ganttData = useMemo(() => {
    if (milestones.length === 0) return { items: [], timeRange: { start: new Date(), end: new Date() } }

    // Convert milestones to gantt items
    const items: GanttItem[] = milestones.map(milestone => {
      const endDate = parseISO(milestone.dueDate)
      // Estimate start date based on progress and due date
      const estimatedDuration = 30 // Default 30 days
      const startDate = subDays(endDate, estimatedDuration)
      
      return {
        id: milestone.id,
        title: milestone.title,
        startDate,
        endDate,
        progress: milestone.progress,
        status: milestone.status,
        priority: milestone.priority
      }
    })

    // Calculate time range
    const allDates = items.flatMap(item => [item.startDate, item.endDate])
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    
    // Add some padding
    const start = subDays(startOfMonth(minDate), 15)
    const end = addDays(endOfMonth(maxDate), 15)

    return {
      items: items.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
      timeRange: { start, end }
    }
  }, [milestones])

  const timeColumns = useMemo(() => {
    const { start, end } = ganttData.timeRange
    const totalDays = differenceInDays(end, start)
    
    if (zoomLevel === 'month') {
      return eachMonthOfInterval({ start, end }).map(date => ({
        date,
        label: format(date, 'MMM yyyy'),
        width: 120
      }))
    } else if (zoomLevel === 'week') {
      const weeks = []
      let current = start
      while (current <= end) {
        weeks.push({
          date: current,
          label: format(current, 'MMM d'),
          width: 80
        })
        current = addDays(current, 7)
      }
      return weeks
    } else {
      const days = []
      let current = start
      while (current <= end) {
        days.push({
          date: current,
          label: format(current, 'd'),
          width: 40
        })
        current = addDays(current, 1)
      }
      return days
    }
  }, [ganttData.timeRange, zoomLevel])

  const calculateBarPosition = (item: GanttItem) => {
    const { start } = ganttData.timeRange
    const totalDays = differenceInDays(ganttData.timeRange.end, start)
    const itemStart = differenceInDays(item.startDate, start)
    const itemDuration = differenceInDays(item.endDate, item.startDate)
    
    const totalWidth = timeColumns.reduce((sum, col) => sum + col.width, 0)
    const left = (itemStart / totalDays) * totalWidth
    const width = Math.max((itemDuration / totalDays) * totalWidth, 20) // Minimum width of 20px
    
    return { left, width }
  }

  if (ganttData.items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No milestones to display</h3>
          <p className="text-muted-foreground text-center">
            Create some milestones to see them on the Gantt chart.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Milestone Gantt Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={zoomLevel === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setZoomLevel('month')}
            >
              Month
            </Button>
            <Button
              variant={zoomLevel === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setZoomLevel('week')}
            >
              Week
            </Button>
            <Button
              variant={zoomLevel === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setZoomLevel('day')}
            >
              Day
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Timeline header */}
            <div className="flex border-b border-border mb-4">
              <div className="w-64 p-2 font-medium">Milestone</div>
              <div className="flex-1 flex">
                {timeColumns.map((col, index) => (
                  <div
                    key={index}
                    className="p-2 text-center text-sm font-medium border-l border-border"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt rows */}
            <div className="space-y-2">
              {ganttData.items.map((item) => {
                const barPosition = calculateBarPosition(item)
                const isOverdue = item.endDate < new Date() && item.status !== 'completed'
                
                return (
                  <div key={item.id} className="flex items-center min-h-[60px] hover:bg-muted/50 rounded">
                    {/* Milestone info */}
                    <div className="w-64 p-2">
                      <div className="font-medium text-sm truncate" title={item.title}>
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={item.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.status.replace('_', ' ')}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Gantt bar area */}
                    <div className="flex-1 relative h-8">
                      <div
                        className={`
                          absolute h-6 rounded border-2 flex items-center
                          ${statusColors[isOverdue ? 'overdue' : item.status]}
                          ${priorityColors[item.priority]}
                          opacity-80 hover:opacity-100 transition-opacity
                        `}
                        style={{
                          left: `${barPosition.left}px`,
                          width: `${barPosition.width}px`
                        }}
                        title={`${item.title}: ${format(item.startDate, 'MMM d')} - ${format(item.endDate, 'MMM d')} (${item.progress}%)`}
                      >
                        {/* Progress indicator */}
                        <div
                          className="h-full bg-white/30 rounded-l"
                          style={{ width: `${item.progress}%` }}
                        />
                        
                        {/* Progress text */}
                        {barPosition.width > 40 && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                            {item.progress}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Today indicator */}
            <div className="relative mt-4">
              <div className="flex">
                <div className="w-64" />
                <div className="flex-1 relative">
                  {(() => {
                    const today = new Date()
                    const { start } = ganttData.timeRange
                    const totalDays = differenceInDays(ganttData.timeRange.end, start)
                    const todayPosition = differenceInDays(today, start)
                    const totalWidth = timeColumns.reduce((sum, col) => sum + col.width, 0)
                    const left = (todayPosition / totalDays) * totalWidth
                    
                    if (left >= 0 && left <= totalWidth) {
                      return (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                          style={{ left: `${left}px` }}
                        >
                          <div className="absolute -top-6 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Today
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-gray-400 rounded" />
            <span>Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-blue-500 rounded" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-green-500 rounded" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-red-500 rounded" />
            <span>Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-red-500" />
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}