'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import type { MilestoneFilters as FilterType } from '@/lib/api/milestones'

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' }
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]

const sortOptions = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' }
]

export function MilestoneFilters() {
  const { filters, setFilters, fetchMilestones } = useMilestoneStore()
  const [localFilters, setLocalFilters] = useState<FilterType>(filters)

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = localFilters.status || []
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter(s => s !== status)
    
    const newFilters = { ...localFilters, status: newStatus }
    setLocalFilters(newFilters)
    setFilters(newFilters)
    fetchMilestones(newFilters)
  }

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const currentPriority = localFilters.priority || []
    const newPriority = checked
      ? [...currentPriority, priority]
      : currentPriority.filter(p => p !== priority)
    
    const newFilters = { ...localFilters, priority: newPriority }
    setLocalFilters(newFilters)
    setFilters(newFilters)
    fetchMilestones(newFilters)
  }

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...localFilters, sortBy: sortBy as any }
    setLocalFilters(newFilters)
    setFilters(newFilters)
    fetchMilestones(newFilters)
  }

  const handleSortOrderChange = (sortOrder: string) => {
    const newFilters = { ...localFilters, sortOrder: sortOrder as 'asc' | 'desc' }
    setLocalFilters(newFilters)
    setFilters(newFilters)
    fetchMilestones(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {}
    setLocalFilters(emptyFilters)
    setFilters(emptyFilters)
    fetchMilestones(emptyFilters)
  }

  const activeFilterCount = 
    (localFilters.status?.length || 0) + 
    (localFilters.priority?.length || 0)

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Status Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Status
            {localFilters.status?.length ? (
              <Badge variant="secondary" className="ml-1">
                {localFilters.status.length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Filter by Status</h4>
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={localFilters.status?.includes(option.value) || false}
                  onCheckedChange={(checked) => 
                    handleStatusChange(option.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={`status-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            Priority
            {localFilters.priority?.length ? (
              <Badge variant="secondary" className="ml-1">
                {localFilters.priority.length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Filter by Priority</h4>
            {priorityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${option.value}`}
                  checked={localFilters.priority?.includes(option.value) || false}
                  onCheckedChange={(checked) => 
                    handlePriorityChange(option.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={`priority-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort By */}
      <Select
        value={localFilters.sortBy || 'dueDate'}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort Order */}
      <Select
        value={localFilters.sortOrder || 'asc'}
        onValueChange={handleSortOrderChange}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Asc</SelectItem>
          <SelectItem value="desc">Desc</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear ({activeFilterCount})
        </Button>
      )}
    </div>
  )
}