'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMilestoneStore } from '@/lib/stores/milestone-store'
import { toast } from 'sonner'
import type { Milestone } from '@/lib/api/types'

const progressUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
  status: z.enum(['not_started', 'in_progress', 'completed', 'overdue']),
})

type ProgressUpdateForm = z.infer<typeof progressUpdateSchema>

interface ProgressUpdateDialogProps {
  milestone: Milestone
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProgressUpdateDialog({ milestone, open, onOpenChange }: ProgressUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateMilestone } = useMilestoneStore()

  const form = useForm<ProgressUpdateForm>({
    resolver: zodResolver(progressUpdateSchema),
    defaultValues: {
      progress: milestone.progress,
      status: milestone.status,
    },
  })

  const watchProgress = form.watch('progress')

  // Auto-update status based on progress
  const handleProgressChange = (value: number[]) => {
    const progress = value[0]
    form.setValue('progress', progress)
    
    // Auto-update status based on progress
    if (progress === 0) {
      form.setValue('status', 'not_started')
    } else if (progress === 100) {
      form.setValue('status', 'completed')
    } else {
      form.setValue('status', 'in_progress')
    }
  }

  const onSubmit = async (data: ProgressUpdateForm) => {
    setIsSubmitting(true)
    try {
      await updateMilestone(milestone.id, {
        progress: data.progress,
        status: data.status,
      })
      
      toast.success('Progress updated successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update progress')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>
            Update the progress for "{milestone.title}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress: {watchProgress}%</FormLabel>
                  <FormControl>
                    <div className="px-3">
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={handleProgressChange}
                        className="w-full"
                      />
                    </div>
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground px-3">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Progress'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
