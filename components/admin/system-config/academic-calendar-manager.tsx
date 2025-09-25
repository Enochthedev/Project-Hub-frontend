"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Clock,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import { format, parseISO, isWithinInterval } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export interface AcademicEvent {
  id: string
  title: string
  description?: string
  type: 'semester' | 'holiday' | 'deadline' | 'exam' | 'registration' | 'other'
  startDate: string
  endDate?: string
  isRecurring: boolean
  recurringPattern?: 'yearly' | 'semester'
  color: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const academicEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['semester', 'holiday', 'deadline', 'exam', 'registration', 'other']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isRecurring: z.boolean(),
  recurringPattern: z.enum(['yearly', 'semester']).optional(),
  color: z.string().min(1, 'Color is required'),
  isActive: z.boolean(),
})

type AcademicEventData = z.infer<typeof academicEventSchema>

interface AcademicCalendarManagerProps {
  events: AcademicEvent[]
  onCreateEvent: (event: AcademicEventData) => Promise<void>
  onUpdateEvent: (eventId: string, event: AcademicEventData) => Promise<void>
  onDeleteEvent: (eventId: string) => Promise<void>
  onImportCalendar: (file: File) => Promise<void>
  onExportCalendar: () => Promise<void>
  isLoading?: boolean
  className?: string
}

const eventTypeColors = {
  semester: '#3b82f6',
  holiday: '#ef4444',
  deadline: '#f59e0b',
  exam: '#8b5cf6',
  registration: '#10b981',
  other: '#6b7280',
}

const eventTypeLabels = {
  semester: 'Semester',
  holiday: 'Holiday',
  deadline: 'Deadline',
  exam: 'Exam Period',
  registration: 'Registration',
  other: 'Other',
}

export function AcademicCalendarManager({
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onImportCalendar,
  onExportCalendar,
  isLoading = false,
  className,
}: AcademicCalendarManagerProps) {
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [filterType, setFilterType] = useState<string>('all')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AcademicEventData>({
    resolver: zodResolver(academicEventSchema),
    defaultValues: {
      isRecurring: false,
      isActive: true,
      color: eventTypeColors.other,
    },
  })

  const isEditing = !!selectedEvent

  // Filter events based on type and date
  const filteredEvents = events.filter((event) => {
    const typeMatch = filterType === 'all' || event.type === filterType
    const dateMatch = selectedDate ? 
      isWithinInterval(selectedDate, {
        start: parseISO(event.startDate),
        end: event.endDate ? parseISO(event.endDate) : parseISO(event.startDate),
      }) : true
    return typeMatch && (viewMode === 'list' || dateMatch)
  })

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    reset({
      isRecurring: false,
      isActive: true,
      color: eventTypeColors.other,
      startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    })
    setShowEventDialog(true)
  }

  const handleEditEvent = (event: AcademicEvent) => {
    setSelectedEvent(event)
    reset({
      title: event.title,
      description: event.description || '',
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate || '',
      isRecurring: event.isRecurring,
      recurringPattern: event.recurringPattern,
      color: event.color,
      isActive: event.isActive,
    })
    setShowEventDialog(true)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteEvent = async () => {
    if (eventToDelete) {
      await onDeleteEvent(eventToDelete)
      setEventToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  const handleFormSubmit = async (data: AcademicEventData) => {
    try {
      if (isEditing && selectedEvent) {
        await onUpdateEvent(selectedEvent.id, data)
      } else {
        await onCreateEvent(data)
      }
      setShowEventDialog(false)
      setSelectedEvent(null)
      reset()
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImportCalendar(file)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'semester': return <GraduationCap className="h-4 w-4" />
      case 'holiday': return <CalendarIcon className="h-4 w-4" />
      case 'deadline': return <Clock className="h-4 w-4" />
      case 'exam': return <BookOpen className="h-4 w-4" />
      case 'registration': return <Edit className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getEventTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'semester': return 'default'
      case 'holiday': return 'destructive'
      case 'deadline': return 'secondary'
      case 'exam': return 'outline'
      case 'registration': return 'default'
      default: return 'outline'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Calendar</h2>
          <p className="text-muted-foreground">
            Manage academic events, deadlines, and important dates
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('calendar-import')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <input
            id="calendar-import"
            type="file"
            accept=".ics,.csv"
            onChange={handleFileImport}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCalendar}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Calendar/List View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {viewMode === 'calendar' && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                Select a date to view events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        )}

        <Card className={viewMode === 'calendar' ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <CardHeader>
            <CardTitle>
              {viewMode === 'calendar' 
                ? `Events for ${selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}`
                : 'All Events'
              }
            </CardTitle>
            <CardDescription>
              {viewMode === 'calendar' 
                ? 'Events scheduled for the selected date'
                : 'Complete list of academic events'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events found for the selected criteria
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-muted-foreground">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getEventTypeBadgeVariant(event.type)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getEventTypeIcon(event.type)}
                          {eventTypeLabels[event.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(parseISO(event.startDate), 'MMM d, yyyy')}</div>
                          {event.endDate && (
                            <div className="text-muted-foreground">
                              to {format(parseISO(event.endDate), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={event.isActive ? 'default' : 'secondary'}>
                            {event.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {event.isRecurring && (
                            <Badge variant="outline">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the event details below.'
                : 'Add a new event to the academic calendar.'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Spring Semester 2024"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(value) => {
                    setValue('type', value as any)
                    setValue('color', eventTypeColors[value as keyof typeof eventTypeColors])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(value)}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Additional details about the event..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  {...register('color')}
                />
              </div>

              <div className="space-y-2">
                <Label>Recurring Pattern</Label>
                <Select
                  value={watch('recurringPattern') || 'none'}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      setValue('isRecurring', false)
                      setValue('recurringPattern', undefined)
                    } else {
                      setValue('isRecurring', true)
                      setValue('recurringPattern', value as any)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Recurrence</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="semester">Every Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Event is active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEventDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Event
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}