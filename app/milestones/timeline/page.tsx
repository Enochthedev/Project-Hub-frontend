import { Metadata } from 'next'
import { MilestoneTimeline } from '@/components/milestones/milestone-timeline'
import { MilestoneCalendar } from '@/components/milestones/milestone-calendar'
import { MilestoneGantt } from '@/components/milestones/milestone-gantt'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Milestone Timeline | FYP Platform',
  description: 'Visualize your project milestones in timeline, calendar, and Gantt chart views'
}

export default function MilestoneTimelinePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Milestone Timeline</h1>
          <p className="text-muted-foreground">
            Visualize your project milestones across different timeline views
          </p>
        </div>

        {/* Timeline Views */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="mt-6">
            <MilestoneTimeline />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <MilestoneCalendar />
          </TabsContent>
          
          <TabsContent value="gantt" className="mt-6">
            <MilestoneGantt />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
