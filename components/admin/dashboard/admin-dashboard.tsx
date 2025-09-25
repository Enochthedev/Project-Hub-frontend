"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range'
import { RefreshCw, Download, Settings } from 'lucide-react'
import { DashboardMetrics } from './dashboard-metrics'
import { UserGrowthChart } from '../charts/user-growth-chart'
import { ProjectStatusChart } from '../charts/project-status-chart'
import { SupervisorWorkloadChart } from '../charts/supervisor-workload-chart'
import { SystemHealthChart } from '../charts/system-health-chart'
import { CustomizableDashboard } from './customizable-dashboard'
import { adminApi, AnalyticsFilters } from '@/lib/api/admin'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

interface AdminDashboardProps {
  className?: string
}

export function AdminDashboard({ className }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    end: new Date().toISOString()
  })
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const analyticsFilters: AnalyticsFilters = {
    dateRange,
    granularity
  }

  // Dashboard metrics query
  const { data: dashboardMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['admin-dashboard-metrics'],
    queryFn: () => adminApi.getDashboardMetrics(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  // User growth data query
  const { data: userGrowthData } = useQuery({
    queryKey: ['admin-user-growth', analyticsFilters],
    queryFn: () => adminApi.getUserGrowthData(analyticsFilters),
  })

  // Project status data query
  const { data: projectStatusData } = useQuery({
    queryKey: ['admin-project-status', analyticsFilters],
    queryFn: () => adminApi.getProjectStatusData(analyticsFilters),
  })

  // Supervisor workload data query
  const { data: supervisorWorkloadData } = useQuery({
    queryKey: ['admin-supervisor-workload', analyticsFilters],
    queryFn: () => adminApi.getSupervisorWorkloadData(analyticsFilters),
  })

  // System health data query
  const { data: systemHealthData } = useQuery({
    queryKey: ['admin-system-health', analyticsFilters],
    queryFn: () => adminApi.getSystemHealthData(analyticsFilters),
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchMetrics()
      toast.success('Dashboard data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh dashboard data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = async (type: string, format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await adminApi.exportAnalytics(type, analyticsFilters, format)
      // Handle blob download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}-analytics.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`${type} analytics exported successfully`)
    } catch (error) {
      toast.error(`Failed to export ${type} analytics`)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform performance and manage system operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
          <CardDescription>
            Customize the time range and granularity for analytics data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <DatePickerWithRange
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            <Select value={granularity} onValueChange={setGranularity}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="supervisors">Supervisors</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Dashboard Metrics */}
          <DashboardMetrics data={dashboardMetrics?.data} />

          {/* Overview Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <UserGrowthChart 
              data={userGrowthData?.data || []} 
              onDrillDown={(filters) => console.log('User growth drill-down:', filters)}
            />
            <ProjectStatusChart 
              data={projectStatusData?.data || []} 
              onDrillDown={(filters) => console.log('Project status drill-down:', filters)}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SupervisorWorkloadChart 
              data={supervisorWorkloadData?.data || []} 
              onDrillDown={(filters) => console.log('Supervisor workload drill-down:', filters)}
            />
            <SystemHealthChart 
              data={systemHealthData?.data || []} 
              onDrillDown={(filters) => console.log('System health drill-down:', filters)}
            />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">User Analytics</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('users', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <UserGrowthChart 
            data={userGrowthData?.data || []} 
            onDrillDown={(filters) => console.log('User analytics drill-down:', filters)}
            showDetailedView={true}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Project Analytics</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('projects', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <ProjectStatusChart 
            data={projectStatusData?.data || []} 
            onDrillDown={(filters) => console.log('Project analytics drill-down:', filters)}
            showDetailedView={true}
          />
        </TabsContent>

        <TabsContent value="supervisors" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Supervisor Analytics</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('supervisors', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <SupervisorWorkloadChart 
            data={supervisorWorkloadData?.data || []} 
            onDrillDown={(filters) => console.log('Supervisor analytics drill-down:', filters)}
            showDetailedView={true}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">System Health</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('system', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <SystemHealthChart 
            data={systemHealthData?.data || []} 
            onDrillDown={(filters) => console.log('System health drill-down:', filters)}
            showDetailedView={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
