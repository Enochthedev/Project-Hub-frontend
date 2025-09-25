import { Metadata } from 'next'
import Link from 'next/link'
import { MilestoneList } from '@/components/milestones/milestone-list'
import { MilestoneFilters } from '@/components/milestones/milestone-filters'
import { CreateMilestoneButton } from '@/components/milestones/create-milestone-button'
import { Button } from '@/components/ui/button'
import { BarChart3, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Milestones | FYP Platform',
  description: 'Track and manage your project milestones'
}

export default function MilestonesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
            <p className="text-muted-foreground">
              Track your project progress and manage deadlines
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/milestones/timeline">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Timeline
              </Button>
            </Link>
            <Link href="/milestones/analytics">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <CreateMilestoneButton />
          </div>
        </div>

        {/* Filters */}
        <MilestoneFilters />

        {/* Milestone List */}
        <MilestoneList />
      </div>
    </div>
  )
}