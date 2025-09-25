'use client'

import { useState } from 'react'
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
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import { toast } from 'sonner'
import type { Milestone } from '@/lib/api/types'

interface DeleteMilestoneDialogProps {
  milestone: Milestone
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteMilestoneDialog({ milestone, open, onOpenChange }: DeleteMilestoneDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteMilestone } = useMilestoneStore()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMilestone(milestone.id)
      toast.success('Milestone deleted successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete milestone')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{milestone.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
