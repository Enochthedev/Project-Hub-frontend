'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateMilestoneDialog } from './create-milestone-dialog'

export function CreateMilestoneButton() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button onClick={() => setShowDialog(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Create Milestone
      </Button>

      <CreateMilestoneDialog
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  )
}
