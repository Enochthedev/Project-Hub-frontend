'use client'

import { useMemo } from 'react'
import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMilestoneStore } from '@/lib/stores/milestone-store'

const COLORS = {
  not_started: '#6b7280',
  in_progress: '#3b82f6',
  completed: '#10b981',
  overdue: '#ef4444'
}

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444'
}

export function MilestoneAnalytics() {
  const { milestones } = useMilestoneStore()

  const analytics = useMemo(() => {
    if (milestones.length === 0) {
      return {
        overview: {
          total: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          overdue: 0,
          completionRate: 0,
          averageProgress: 0
        },
        statusDistribution: [],
        priorityDistribution: [],
        progressTrend: [],
        upcomingDeadlines: [],
        performanceMetrics: {
          onTimeCompletion: 0,
          averageDaysToComplete: 0,
          productivityTrend: 'stable'
        }
      }
    }

    // Overview statistics
    const total = milestones.length
    const completed = milestones.filter(m => m.status === 'completed').length
    const inProgress = milestones.filter(m => m.status === 'in_progress').length
    const notStarted = milestones.filter(m => m.status === 'not_started').length
    const overdue = milestones.filter(m => {
      const dueDate = parseISO(m.dueDate)
      return dueDate < new Date() && m.status !== 'completed'
    }).length
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0
    const averageProgress = total > 0 ? milestones.reduce((sum, m) => sum + m.progress, 0) / total : 0

    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Completed', value: completed, color: COLORS.completed },
      { name: 'In Progress', value: inProgress, color: COLORS.in_progress },
      { name: 'Not Started', value: notStarted, color: COLORS.not_started },
      { name: 'Overdue', value: overdue, color: COLORS.overdue }
    ].filter(item => item.value > 0)

    // Priority distribution
    const priorityDistribution = [
      { name: 'Low', value: milestones.filter(m => m.priority === 'low').length, color: PRIORITY_COLORS.low },
      { name: 'Medium', value: milestones.filter(m => m.priority === 'medium').length, color: PRIORITY_COLORS.medium },
      { name: 'High', value: milestones.filter(m => m.priority === 'high').length, color: PRIORITY_COLORS.high },
      { name: 'Critical', value: milestones.filter(m => m.priority === 'critical').length, color: PRIORITY_COLORS.critical }
    ].filter(item => item.value > 0)

    // Progress trend over time (weekly)
    const now = new Date()
    const weeks = eachWeekOfInterval({
      start: subWeeks(now, 11), // Last 12 weeks
      end: now
    })

    const progressTrend = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart)
      const weekLabel = format(weekStart, 'MMM d')
      
      // Calculate milestones that should have been completed by this week
      const milestonesInWeek = milestones.filter(m => {
        const dueDate = parseISO(m.dueDate)
        return dueDate <= weekEnd
      })
      
      const completedInWeek = milestonesInWeek.filter(m => m.status === 'completed').length
      const totalInWeek = milestonesInWeek.length
      const completionRate = totalInWeek > 0 ? (completedInWeek / totalInWeek) * 100 : 0
      
      return {
        week: weekLabel,
        completionRate,
        completed: completedInWeek,
        total: totalInWeek
      }
    })

    // Upcoming deadlines (next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const upcomingDeadlines = milestones
      .filter(m => {
        const dueDate = parseISO(m.dueDate)
        return dueDate >= new Date() && dueDate <= thirtyDaysFromNow && m.status !== 'completed'
      })
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
      .slice(0, 5)

    // Performance metrics
    const completedMilestones = milestones.filter(m => m.status === 'completed')
    const onTimeCompletion = completedMilestones.length > 0 
      ? (completedMilestones.filter(m => parseISO(m.dueDate) >= parseISO(m.updatedAt)).length / completedMilestones.length) * 100
      : 0

    const averageDaysToComplete = completedMilestones.length > 0
      ? completedMilestones.reduce((sum, m) => {
          const created = parseISO(m.createdAt)
          const updated = parseISO(m.updatedAt)
          return sum + differenceInDays(updated, created)
        }, 0) / completedMilestones.length
      : 0

    // Simple productivity trend calculation
    const recentWeeks = progressTrend.slice(-4)
    const earlierWeeks = progressTrend.slice(-8, -4)
    const recentAvg = recentWeeks.reduce((sum, w) => sum + w.completionRate, 0) / recentWeeks.length
    const earlierAvg = earlierWeeks.reduce((sum, w) => sum + w.completionRate, 0) / earlierWeeks.length
    
    let productivityTrend: 'improving' | 'declining' | 'stable' = 'stable'
    if (recentAvg > earlierAvg + 5) productivityTrend = 'improving'
    else if (recentAvg < earlierAvg - 5) productivityTrend = 'declining'

    return {
      overview: {
        total,
        completed,
        inProgress,
        notStarted,
        overdue,
        completionRate,
        averageProgress
      },
      statusDistribution,
      priorityDistribution,
      progressTrend,
      upcomingDeadlines,
      performanceMetrics: {
        onTimeCompletion,
        averageDaysToComplete,
        productivityTrend
      }
    }
  }, [milestones])

  if (milestones.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No analytics data available</h3>
          <p className="text-muted-foreground text-center">
            Create some milestones to see your progress analytics and insights.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.total}</div>
            <p className="text-xs text-muted-foreground">
              Active project milestones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.completionRate.toFixed(1)}%</div>
            <Progress value={analytics.overview.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.averageProgress.toFixed(1)}%</div>
            <Progress value={analytics.overview.averageProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overview.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {analytics.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Progress Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Progress Trend (Last 12 Weeks)
            {analytics.performanceMetrics.productivityTrend === 'improving' && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Improving
              </Badge>
            )}
            {analytics.performanceMetrics.productivityTrend === 'declining' && (
              <Badge variant="destructive">
                <TrendingDown className="h-3 w-3 mr-1" />
                Declining
              </Badge>
            )}
            {analytics.performanceMetrics.productivityTrend === 'stable' && (
              <Badge variant="secondary">
                Stable
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.progressTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Completion Rate']}
              />
              <Area 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">On-Time Completion</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.performanceMetrics.onTimeCompletion.toFixed(1)}%
                </span>
              </div>
              <Progress value={analytics.performanceMetrics.onTimeCompletion} />
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Days to Complete</span>
                <span className="text-lg font-bold">
                  {analytics.performanceMetrics.averageDaysToComplete.toFixed(0)} days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.upcomingDeadlines.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming deadlines in the next 30 days
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.upcomingDeadlines.map((milestone) => {
                  const dueDate = parseISO(milestone.dueDate)
                  const daysUntilDue = differenceInDays(dueDate, new Date())
                  
                  return (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{milestone.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Due {format(dueDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={daysUntilDue <= 3 ? 'destructive' : 'secondary'}>
                          {daysUntilDue === 0 ? 'Today' : `${daysUntilDue}d`}
                        </Badge>
                        <Progress value={milestone.progress} className="w-16 h-2" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}