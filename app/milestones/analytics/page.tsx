import { Metadata } from 'next'
import { MilestoneAnalytics } from '@/components/milestones/milestone-analytics'
import { MilestoneProgressComparison } from '@/components/milestones/milestone-progress-comparison'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Milestone Analytics | FYP Platform',
  description: 'Analyze your milestone progress with detailed analytics and comparisons'
}

export default function MilestoneAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Milestone Analytics</h1>
          <p className="text-muted-foreground">
            Analyze your progress with detailed insights and performance comparisons
          </p>
        </div>

        {/* Analytics Views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Progress Overview</TabsTrigger>
            <TabsTrigger value="comparison">Progress Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <MilestoneAnalytics />
          </TabsContent>
          
          <TabsContent value="comparison" className="mt-6">
            <MilestoneProgressComparison />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}