'use client'

import { useMemo, useState } from 'react'
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Calendar, Target, Clock, BarChart3, Radar as RadarIcon, LineChart as LineChartIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useMilestoneStore } from '@/lib/stores/milestone-store'

type ComparisonType = 'monthly' | 'priority' | 'status' | 'timeline'
type ChartType = 'bar' | 'line' | 'radar'

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444'
}

const STATUS_COLORS = {
  not_started: '#6b7280',
  in_progress: '#3b82f6',
  completed: '#10b981',
  overdue: '#ef4444'
}

export function MilestoneProgressComparison() {
  const { milestones } = useMilestoneStore()
  const [comparisonType, setComparisonType] = useState<ComparisonType>('monthly')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6') // months

  const comparisonData = useMemo(() => {
    if (milestones.length === 0) return []

    switch (comparisonType) {
      case 'monthly': {
        const months = parseInt(selectedPeriod)
        const now = new Date()
        const monthsRange = eachMonthOfInterval({
          start: subMonths(now, months - 1),
          end: now
        })

        return monthsRange.map(monthStart => {
          const monthEnd = endOfMonth(monthStart)
          const monthLabel = format(monthStart, 'MMM yyyy')
          
          // Milestones due in this month
          const milestonesInMonth = milestones.filter(m => {
            const dueDate = parseISO(m.dueDate)
            return dueDate >= monthStart && dueDate <= monthEnd
          })
          
          const completed = milestonesInMonth.filter(m => m.status === 'completed').length
          const inProgress = milestonesInMonth.filter(m => m.status === 'in_progress').length
          const notStarted = milestonesInMonth.filter(m => m.status === 'not_started').length
          const overdue = milestonesInMonth.filter(m => m.status === 'overdue').length
          const total = milestonesInMonth.length
          const averageProgress = total > 0 ? milestonesInMonth.reduce((sum, m) => sum + m.progress, 0) / total : 0
          const completionRate = total > 0 ? (completed / total) * 100 : 0
          
          return {
            period: monthLabel,
            completed,
            inProgress,
            notStarted,
            overdue,
            total,
            averageProgress,
            completionRate
          }
        })
      }

      case 'priority': {
        const priorities = ['low', 'medium', 'high', 'critical'] as const
        
        return priorities.map(priority => {
          const priorityMilestones = milestones.filter(m => m.priority === priority)
          const completed = priorityMilestones.filter(m => m.status === 'completed').length
          const inProgress = priorityMilestones.filter(m => m.status === 'in_progress').length
          const notStarted = priorityMilestones.filter(m => m.status === 'not_started').length
          const overdue = priorityMilestones.filter(m => m.status === 'overdue').length
          const total = priorityMilestones.length
          const averageProgress = total > 0 ? priorityMilestones.reduce((sum, m) => sum + m.progress, 0) / total : 0
          const completionRate = total > 0 ? (completed / total) * 100 : 0
          
          return {
            category: priority.charAt(0).toUpperCase() + priority.slice(1),
            completed,
            inProgress,
            notStarted,
            overdue,
            total,
            averageProgress,
            completionRate,
            color: PRIORITY_COLORS[priority]
          }
        }).filter(item => item.total > 0)
      }

      case 'status': {
        const statuses = ['not_started', 'in_progress', 'completed', 'overdue'] as const
        
        return statuses.map(status => {
          const statusMilestones = milestones.filter(m => m.status === status)
          const total = statusMilestones.length
          const averageProgress = total > 0 ? statusMilestones.reduce((sum, m) => sum + m.progress, 0) / total : 0
          
          // Calculate average days until due date
          const averageDaysUntilDue = total > 0 ? statusMilestones.reduce((sum, m) => {
            const dueDate = parseISO(m.dueDate)
            const daysUntilDue = differenceInDays(dueDate, new Date())
            return sum + daysUntilDue
          }, 0) / total : 0
          
          return {
            category: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            total,
            averageProgress,
            averageDaysUntilDue,
            color: STATUS_COLORS[status]
          }
        }).filter(item => item.total > 0)
      }

      case 'timeline': {
        // Group milestones by weeks for timeline comparison
        const sortedMilestones = [...milestones].sort((a, b) => 
          parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
        )
        
        return sortedMilestones.slice(0, 10).map((milestone, index) => ({
          name: milestone.title.length > 20 ? milestone.title.substring(0, 20) + '...' : milestone.title,
          progress: milestone.progress,
          dueDate: format(parseISO(milestone.dueDate), 'MMM d'),
          priority: milestone.priority,
          status: milestone.status,
          daysUntilDue: differenceInDays(parseISO(milestone.dueDate), new Date()),
          color: STATUS_COLORS[milestone.status]
        }))
      }

      default:
        return []
    }
  }, [milestones, comparisonType, selectedPeriod])

  const radarData = useMemo(() => {
    if (comparisonType !== 'priority' && comparisonType !== 'status') return []
    
    return comparisonData.map(item => ({
      category: item.category,
      'Completion Rate': item.completionRate || 0,
      'Average Progress': item.averageProgress || 0,
      'Total Count': (item.total / Math.max(...comparisonData.map(d => d.total))) * 100
    }))
  }, [comparisonData, comparisonType])

  const renderChart = () => {
    if (comparisonData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No comparison data available</h3>
          <p className="text-muted-foreground text-center">
            Create some milestones to see progress comparisons.
          </p>
        </div>
      )
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={comparisonType === 'monthly' ? 'period' : 'category'} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {comparisonType === 'monthly' && (
                <>
                  <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                  <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
                  <Bar dataKey="notStarted" stackId="a" fill="#6b7280" name="Not Started" />
                  <Bar dataKey="overdue" stackId="a" fill="#ef4444" name="Overdue" />
                </>
              )}
              {(comparisonType === 'priority' || comparisonType === 'status') && (
                <>
                  <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate %" />
                  <Bar dataKey="averageProgress" fill="#3b82f6" name="Average Progress %" />
                </>
              )}
              {comparisonType === 'timeline' && (
                <Bar dataKey="progress" fill="#3b82f6" name="Progress %" />
              )}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        if (comparisonType !== 'monthly' && comparisonType !== 'timeline') {
          return <div className="text-center py-8 text-muted-foreground">Line chart not available for this comparison type</div>
        }
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={comparisonType === 'monthly' ? 'period' : 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {comparisonType === 'monthly' && (
                <>
                  <Line type="monotone" dataKey="completionRate" stroke="#10b981" name="Completion Rate %" />
                  <Line type="monotone" dataKey="averageProgress" stroke="#3b82f6" name="Average Progress %" />
                </>
              )}
              {comparisonType === 'timeline' && (
                <Line type="monotone" dataKey="progress" stroke="#3b82f6" name="Progress %" />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'radar':
        if (radarData.length === 0) {
          return <div className="text-center py-8 text-muted-foreground">Radar chart not available for this comparison type</div>
        }
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Completion Rate" dataKey="Completion Rate" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Average Progress" dataKey="Average Progress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Relative Count" dataKey="Total Count" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const summaryStats = useMemo(() => {
    if (comparisonData.length === 0) return null

    const totalMilestones = comparisonData.reduce((sum, item) => sum + (item.total || 0), 0)
    const averageCompletion = comparisonData.reduce((sum, item) => sum + (item.completionRate || 0), 0) / comparisonData.length
    const averageProgress = comparisonData.reduce((sum, item) => sum + (item.averageProgress || 0), 0) / comparisonData.length
    
    // Find best and worst performing categories
    const bestPerforming = comparisonData.reduce((best, current) => 
      (current.completionRate || 0) > (best.completionRate || 0) ? current : best
    )
    const worstPerforming = comparisonData.reduce((worst, current) => 
      (current.completionRate || 0) < (worst.completionRate || 0) ? current : worst
    )

    return {
      totalMilestones,
      averageCompletion,
      averageProgress,
      bestPerforming,
      worstPerforming
    }
  }, [comparisonData])

  if (milestones.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No milestones to compare</h3>
          <p className="text-muted-foreground text-center">
            Create some milestones to see progress comparisons and analytics.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Compare by:</label>
              <Select value={comparisonType} onValueChange={(value: ComparisonType) => setComparisonType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Trends</SelectItem>
                  <SelectItem value="priority">Priority Levels</SelectItem>
                  <SelectItem value="status">Status Types</SelectItem>
                  <SelectItem value="timeline">Timeline View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {comparisonType === 'monthly' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Period:</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Chart type:</label>
              <div className="flex gap-1">
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'radar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('radar')}
                >
                  <RadarIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalMilestones}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.averageCompletion.toFixed(1)}%</div>
              <Progress value={summaryStats.averageCompletion} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Performing</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-600">
                {summaryStats.bestPerforming.category || summaryStats.bestPerforming.period}
              </div>
              <p className="text-xs text-muted-foreground">
                {(summaryStats.bestPerforming.completionRate || 0).toFixed(1)}% completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-red-600">
                {summaryStats.worstPerforming.category || summaryStats.worstPerforming.period}
              </div>
              <p className="text-xs text-muted-foreground">
                {(summaryStats.worstPerforming.completionRate || 0).toFixed(1)}% completion
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {comparisonType === 'monthly' && <Calendar className="h-5 w-5" />}
            {comparisonType === 'priority' && <Target className="h-5 w-5" />}
            {comparisonType === 'status' && <Clock className="h-5 w-5" />}
            {comparisonType === 'timeline' && <BarChart3 className="h-5 w-5" />}
            {comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)} Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      {comparisonType === 'timeline' && comparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Milestone Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonData.map((milestone, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{milestone.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {milestone.priority}
                      </Badge>
                      <Badge 
                        variant={milestone.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Due {milestone.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{milestone.progress}%</div>
                      <div className="text-xs text-muted-foreground">
                        {milestone.daysUntilDue >= 0 ? `${milestone.daysUntilDue}d left` : `${Math.abs(milestone.daysUntilDue)}d overdue`}
                      </div>
                    </div>
                    <Progress value={milestone.progress} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}