"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Target, TrendingUp, Clock } from "lucide-react"

// Dynamically import chart components to prevent SSR issues
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false })

interface MilestoneData {
  id: string
  title: string
  status: "completed" | "in-progress" | "pending" | "overdue"
  dueDate: string
  completedDate?: string
  progress: number
  category: string
}

interface AnalyticsData {
  totalMilestones: number
  completedMilestones: number
  overdueMilestones: number
  averageCompletionTime: number
  completionRate: number
  monthlyProgress: Array<{
    month: string
    completed: number
    total: number
  }>
  categoryBreakdown: Array<{
    category: string
    completed: number
    total: number
  }>
}

export function MilestoneAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchAnalytics = async () => {
      setIsLoading(true)

      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        totalMilestones: 24,
        completedMilestones: 18,
        overdueMilestones: 2,
        averageCompletionTime: 5.2,
        completionRate: 75,
        monthlyProgress: [
          { month: "Jan", completed: 3, total: 4 },
          { month: "Feb", completed: 2, total: 3 },
          { month: "Mar", completed: 4, total: 5 },
          { month: "Apr", completed: 3, total: 4 },
          { month: "May", completed: 4, total: 4 },
          { month: "Jun", completed: 2, total: 4 },
        ],
        categoryBreakdown: [
          { category: "Research", completed: 5, total: 7 },
          { category: "Development", completed: 8, total: 10 },
          { category: "Testing", completed: 3, total: 4 },
          { category: "Documentation", completed: 2, total: 3 },
        ],
      }

      setTimeout(() => {
        setAnalyticsData(mockData)
        setIsLoading(false)
      }, 1000)
    }

    fetchAnalytics()
  }, [])

  if (isLoading || !analyticsData) {
    return <AnalyticsLoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalMilestones}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.completedMilestones}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analyticsData.completedMilestones / analyticsData.totalMilestones) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analyticsData.overdueMilestones}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageCompletionTime} days</div>
            <p className="text-xs text-muted-foreground">Average time to complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
            <CardDescription>Milestone completion trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#1B998B" strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="total" stroke="#E5E7EB" strokeWidth={2} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Milestone completion by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#1B998B" name="Completed" />
                  <Bar dataKey="total" fill="#E5E7EB" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Category Progress</CardTitle>
          <CardDescription>Detailed progress breakdown by milestone category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.categoryBreakdown.map((category) => {
              const percentage = Math.round((category.completed / category.total) * 100)
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {category.completed}/{category.total}
                      </span>
                      <Badge variant={percentage >= 80 ? "default" : percentage >= 50 ? "secondary" : "destructive"}>
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-[100px] bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-[60px] bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-[120px] bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-6 w-[200px] bg-muted animate-pulse rounded" />
            <div className="h-4 w-[300px] bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 w-[200px] bg-muted animate-pulse rounded" />
            <div className="h-4 w-[300px] bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
