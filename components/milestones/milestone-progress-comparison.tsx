"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useMilestoneStore } from "@/lib/stores/milestone-store"
import { TrendingUp, Target, Clock } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import chart components
const BarChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.BarChart })), { ssr: false })
const Bar = dynamic(() => import("recharts").then((mod) => ({ default: mod.Bar })), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => ({ default: mod.XAxis })), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => ({ default: mod.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => ({ default: mod.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => ({ default: mod.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })), {
  ssr: false,
})
const LineChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.LineChart })), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => ({ default: mod.Line })), { ssr: false })

export function MilestoneProgressComparison() {
  const { milestones } = useMilestoneStore()

  const comparisonData = useMemo(() => {
    if (milestones.length === 0) {
      return {
        categoryComparison: [],
        priorityComparison: [],
        timelineComparison: [],
        performanceMetrics: {
          averageProgress: 0,
          completionRate: 0,
          onTrackPercentage: 0,
        },
      }
    }

    // Group by category for comparison
    const categoryGroups = milestones.reduce(
      (acc, milestone) => {
        const category = milestone.category || "Uncategorized"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(milestone)
        return acc
      },
      {} as Record<string, typeof milestones>,
    )

    const categoryComparison = Object.entries(categoryGroups).map(([category, items]) => ({
      category,
      total: items.length,
      completed: items.filter((m) => m.status === "completed").length,
      inProgress: items.filter((m) => m.status === "in_progress").length,
      averageProgress: items.reduce((sum, m) => sum + m.progress, 0) / items.length,
      completionRate: (items.filter((m) => m.status === "completed").length / items.length) * 100,
    }))

    // Group by priority for comparison
    const priorityGroups = milestones.reduce(
      (acc, milestone) => {
        const priority = milestone.priority
        if (!acc[priority]) {
          acc[priority] = []
        }
        acc[priority].push(milestone)
        return acc
      },
      {} as Record<string, typeof milestones>,
    )

    const priorityComparison = Object.entries(priorityGroups).map(([priority, items]) => ({
      priority,
      total: items.length,
      completed: items.filter((m) => m.status === "completed").length,
      averageProgress: items.reduce((sum, m) => sum + m.progress, 0) / items.length,
      completionRate: (items.filter((m) => m.status === "completed").length / items.length) * 100,
    }))

    // Timeline comparison (mock data for demonstration)
    const timelineComparison = [
      { month: "Jan", planned: 85, actual: 78 },
      { month: "Feb", planned: 90, actual: 85 },
      { month: "Mar", planned: 75, actual: 82 },
      { month: "Apr", planned: 95, actual: 88 },
      { month: "May", planned: 80, actual: 75 },
      { month: "Jun", planned: 88, actual: 92 },
    ]

    const performanceMetrics = {
      averageProgress: milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length,
      completionRate: (milestones.filter((m) => m.status === "completed").length / milestones.length) * 100,
      onTrackPercentage:
        (milestones.filter((m) => m.progress >= 75 || m.status === "completed").length / milestones.length) * 100,
    }

    return {
      categoryComparison,
      priorityComparison,
      timelineComparison,
      performanceMetrics,
    }
  }, [milestones])

  if (milestones.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No comparison data available</h3>
          <p className="text-muted-foreground text-center">
            Create milestones with different categories and priorities to see comparisons.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comparisonData.performanceMetrics.averageProgress.toFixed(1)}%</div>
            <Progress value={comparisonData.performanceMetrics.averageProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comparisonData.performanceMetrics.completionRate.toFixed(1)}%</div>
            <Progress value={comparisonData.performanceMetrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comparisonData.performanceMetrics.onTrackPercentage.toFixed(1)}%</div>
            <Progress value={comparisonData.performanceMetrics.onTrackPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Category Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData.categoryComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageProgress" fill="#3b82f6" name="Average Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Priority Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData.priorityComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Planned vs Actual Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData.timelineComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="planned" stroke="#3b82f6" name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.categoryComparison.map((category) => (
              <div key={category.category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{category.category}</h4>
                  <Badge variant="outline">{category.total} milestones</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <div className="font-medium">{category.completed}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">In Progress:</span>
                    <div className="font-medium">{category.inProgress}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Progress:</span>
                    <div className="font-medium">{category.averageProgress.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completion Rate:</span>
                    <div className="font-medium">{category.completionRate.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={category.averageProgress} className="mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
