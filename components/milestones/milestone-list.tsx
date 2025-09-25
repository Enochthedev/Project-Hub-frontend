'use client'

import { useEffect } from 'react'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import { MilestoneCard } from './milestone-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function MilestoneList() {
  const { 
    milestones, 
    isLoading, 
    error, 
    filters,
    fetchMilestones,
    clearError 
  } = useMilestoneStore()

  useEffect(() => {
    fetchMilestones(filters)
  }, [fetchMilestones, filters])

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-2 w-full mr-4" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex justify-between items-center">
          {error}
          <button 
            onClick={clearError}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </AlertDescription>
      </Alert>
    )
  }

  if (milestones.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No milestones found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first milestone to track your project progress.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {milestones.map((milestone) => (
        <MilestoneCard key={milestone.id} milestone={milestone} />
      ))}
    </div>
  )
}
