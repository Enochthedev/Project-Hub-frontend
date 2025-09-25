"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '../widgets/metric-card'
import { TrendIndicator } from '../widgets/trend-indicator'
import { Users, FolderOpen, Clock, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { DashboardMetrics as DashboardMetricsType } from '@/lib/api/admin'

interface DashboardMetricsProps {
  data?: DashboardMetricsType
  className?: string
}

export function DashboardMetrics({ data, className }: DashboardMetricsProps) {
  if (!data) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Users',
      value: data.totalUsers,
      icon: Users,
      trend: data.userGrowthRate,
      description: 'All registered users',
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: data.activeUsers,
      icon: Activity,
      trend: (data.activeUsers / data.totalUsers) * 100 - 70, // Mock trend calculation
      description: 'Users active in last 30 days',
      color: 'green'
    },
    {
      title: 'Total Projects',
      value: data.totalProjects,
      icon: FolderOpen,
      trend: 12.5, // Mock trend
      description: 'All projects in system',
      color: 'purple'
    },
    {
      title: 'Pending Approvals',
      value: data.pendingApprovals,
      icon: Clock,
      trend: -5.2, // Mock trend (negative is good for pending items)
      description: 'Projects awaiting approval',
      color: 'orange'
    },
    {
      title: 'System Health',
      value: `${Math.round(data.systemHealth)}%`,
      icon: data.systemHealth > 95 ? CheckCircle : data.systemHealth > 80 ? Activity : AlertTriangle,
      trend: data.systemHealth - 95, // Trend relative to 95% baseline
      description: 'Overall system performance',
      color: data.systemHealth > 95 ? 'green' : data.systemHealth > 80 ? 'yellow' : 'red'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(data.projectCompletionRate)}%`,
      icon: CheckCircle,
      trend: data.projectCompletionRate - 85, // Trend relative to 85% baseline
      description: 'Project completion rate',
      color: 'green'
    },
    {
      title: 'Avg Response Time',
      value: `${Math.round(data.averageResponseTime)}ms`,
      icon: Activity,
      trend: -(data.averageResponseTime - 200) / 10, // Negative trend for lower response time
      description: 'API response time',
      color: data.averageResponseTime < 300 ? 'green' : data.averageResponseTime < 500 ? 'yellow' : 'red'
    },
    {
      title: 'User Growth Rate',
      value: `${data.userGrowthRate > 0 ? '+' : ''}${data.userGrowthRate.toFixed(1)}%`,
      icon: Users,
      trend: data.userGrowthRate,
      description: 'Monthly user growth',
      color: data.userGrowthRate > 0 ? 'green' : 'red'
    }
  ]

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          description={metric.description}
          trend={
            <TrendIndicator
              value={metric.trend}
              format="percentage"
              showIcon={true}
            />
          }
          color={metric.color}
        />
      ))}
    </div>
  )
}