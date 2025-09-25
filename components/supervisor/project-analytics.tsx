'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useSupervisorStore } from '@/lib/stores/supervisor-store'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  Eye, 
  Bookmark, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Award
} from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function ProjectAnalytics() {
  const {
    projectAnalytics,
    isProjectAnalyticsLoading,
    projectAnalyticsError,
    fetchProjectAnalytics,
    clearErrors
  } = useSupervisorStore()

  useEffect(() => {
    fetchProjectAnalytics()
  }, [fetchProjectAnalytics])

  const handleRefresh = () => {
    clearErrors()
    fetchProjectAnalytics()
  }

  if (isProjectAnalyticsLoading) {
    return <AnalyticsSkeleton />
  }

  if (projectAnalyticsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {projectAnalyticsError}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!projectAnalytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
        <Button onClick={fetchProjectAnalytics} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Load Analytics
        </Button>
      </div>
    )
  }

  // Prepare data for charts
  const statusData = [
    { name: 'Approved', value: projectAnalytics.approvedProjects, color: '#00C49F' },
    { name: 'Pending', value: projectAnalytics.pendingProjects, color: '#FFBB28' },
    { name: 'Rejected', value: projectAnalytics.rejectedProjects, color: '#FF8042' },
  ].filter(item => item.value > 0)

  const yearData = Object.entries(projectAnalytics.projectsByYear).map(([year, count]) => ({
    year,
    projects: count
  })).sort((a, b) => a.year.localeCompare(b.year))

  const specializationData = Object.entries(projectAnalytics.projectsBySpecialization).map(([spec, count]) => ({
    specialization: spec.length > 15 ? spec.substring(0, 15) + '...' : spec,
    fullName: spec,
    projects: count
  })).sort((a, b) => b.projects - a.projects).slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Analytics</h2>
          <p className="text-muted-foreground">
            Insights and performance metrics for your projects
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectAnalytics.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              All submitted projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {projectAnalytics.approvalRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Projects approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectAnalytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectAnalytics.totalBookmarks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Student interest
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {projectAnalytics.pendingProjects}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popularity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectAnalytics.popularityScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on views & bookmarks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Approval Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectAnalytics.averageApprovalTime.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Days to approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of projects by approval status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects by Year */}
        <Card>
          <CardHeader>
            <CardTitle>Projects by Year</CardTitle>
            <CardDescription>
              Number of projects submitted each year
            </CardDescription>
          </CardHeader>
          <CardContent>
            {yearData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="projects" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects by Specialization */}
      <Card>
        <CardHeader>
          <CardTitle>Projects by Specialization</CardTitle>
          <CardDescription>
            Distribution of projects across different specializations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {specializationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={specializationData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="specialization" type="category" width={120} />
                <Tooltip 
                  formatter={(value, name, props) => [value, 'Projects']}
                  labelFormatter={(label) => {
                    const item = specializationData.find(d => d.specialization === label)
                    return item?.fullName || label
                  }}
                />
                <Bar dataKey="projects" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Key insights about your project performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectAnalytics.approvalRate >= 80 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Excellent Approval Rate</p>
                  <p className="text-sm text-green-700">
                    Your projects have a {projectAnalytics.approvalRate.toFixed(1)}% approval rate, which is excellent!
                  </p>
                </div>
              </div>
            )}

            {projectAnalytics.approvalRate < 60 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">Room for Improvement</p>
                  <p className="text-sm text-orange-700">
                    Your approval rate is {projectAnalytics.approvalRate.toFixed(1)}%. Consider reviewing project requirements and quality standards.
                  </p>
                </div>
              </div>
            )}

            {projectAnalytics.popularityScore >= 7 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">High Student Interest</p>
                  <p className="text-sm text-blue-700">
                    Your projects are popular with students (popularity score: {projectAnalytics.popularityScore.toFixed(1)}).
                  </p>
                </div>
              </div>
            )}

            {projectAnalytics.pendingProjects > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Pending Reviews</p>
                  <p className="text-sm text-yellow-700">
                    You have {projectAnalytics.pendingProjects} project{projectAnalytics.pendingProjects > 1 ? 's' : ''} awaiting approval.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
