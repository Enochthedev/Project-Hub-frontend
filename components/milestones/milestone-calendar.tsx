'use client'

import { useState, useMemo } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import type { Milestone } from '@/lib/api/types'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  milestones: Milestone[]
}

const statusColors = {
  not_started: 'bg-gray-200 text-gray-800',
  in_progress: 'bg-blue-200 text-blue-800',
  completed: 'bg-green-200 text-green-800',
  overdue: 'bg-red-200 text-red-800'
}

export function MilestoneCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { milestones } = useMilestoneStore()

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    
    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // Add days from previous month to fill the first week
    const firstDayOfWeek = monthStart.getDay()
    const prevMonthDays = []
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(monthStart)
      date.setDate(date.getDate() - (i + 1))
      prevMonthDays.push(date)
    }
    
    // Add days from next month to fill the last week
    const lastDayOfWeek = monthEnd.getDay()
    const nextMonthDays = []
    for (let i = 1; i <= (6 - lastDayOfWeek); i++) {
      const date = new Date(monthEnd)
      date.setDate(date.getDate() + i)
      nextMonthDays.push(date)
    }
    
    const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays]
    
    return allDays.map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      milestones: milestones.filter(milestone => 
        isSameDay(parseISO(milestone.dueDate), date)
      )
    }))
  }, [currentDate, milestones])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Milestone Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const isToday = isSameDay(day.date, new Date())
            const hasOverdue = day.milestones.some(m => 
              parseISO(m.dueDate) < new Date() && m.status !== 'completed'
            )
            
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-1 border border-border rounded-md
                  ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                  ${isToday ? 'ring-2 ring-primary' : ''}
                  hover:bg-muted/50 transition-colors
                `}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`
                    text-sm font-medium
                    ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                    ${isToday ? 'text-primary font-bold' : ''}
                  `}>
                    {format(day.date, 'd')}
                  </span>
                  {hasOverdue && (
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                
                <div className="space-y-1">
                  {day.milestones.slice(0, 3).map(milestone => {
                    const isOverdue = parseISO(milestone.dueDate) < new Date() && milestone.status !== 'completed'
                    
                    return (
                      <div
                        key={milestone.id}
                        className={`
                          text-xs p-1 rounded truncate cursor-pointer
                          ${isOverdue ? statusColors.overdue : statusColors[milestone.status]}
                          hover:opacity-80 transition-opacity
                        `}
                        title={`${milestone.title} - ${milestone.status} (${milestone.progress}%)`}
                      >
                        {milestone.title}
                      </div>
                    )
                  })}
                  
                  {day.milestones.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{day.milestones.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 rounded" />
            <span>Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-200 rounded" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 rounded" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-200 rounded" />
            <span>Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Has overdue items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}