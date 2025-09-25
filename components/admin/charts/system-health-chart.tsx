"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { MoreHorizontal, Activity, AlertTriangle, CheckCircle, Zap, Clock } from 'lucide-react'
import { SystemHealthData } from '@/lib/api/admin'
import { DrillDownModal } from '../modals/drill-down-modal'

interface SystemHealthChartProps {
  data: SystemHealthData[]
  onDrillDown?: (filters: Record<string, any>) => void
  showDetailedView?: boolean
  className?: string
}

const chartConfig = {
  cpuUsage: {
    label: 'CPU Usage (%)',
    color: 'hsl(var(--chart-1))'
  },
  memoryUsage: {
    label: 'Memory Usage (%)',
    color: 'hsl(var(--chart-2))'
  },
  responseTime: {
    label: 'Response Time (ms)',
    color: 'hsl(var(--chart-3))'
  },
  errorRate: {
    label: 'Error Rate (%)',
    color: 'hsl(var(--chart-4))'
  }
}

export function SystemHealthChart({ 
  data, 
  onDrillDown, 
  showDetailedView = false,
  className 
}: SystemHealthChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('line')
  const [selectedMetric, setSelectedMetric] = useState<string>('all')
  const [showDrillDown, setShowDrillDown] = useState(false)
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null)

  const handleDataPointClick = (data: any) => {
    setSelectedDataPoint(data)
    setShowDrillDown(true)
  }

  const handleDrillDown = (filters: Record<string, any>) => {
    onDrillDown?.(filters)
    setShowDrillDown(false)
  }

  // Calculate current health status
  const latestData = data[data.length - 1]
  const avgCpuUsage = data.reduce((sum, item) => sum + item.cpuUsage, 0) / data.length
  const avgMemoryUsage = data.reduce((sum, item) => sum + item.memoryUsage, 0) / data.length
  const avgResponseTime = data.reduce((sum, item) => sum + item.responseTime, 0) / data.length
  const avgErrorRate = data.reduce((sum, item) => sum + item.errorRate, 0) / data.length

  const getHealthStatus = () => {
    if (!latestData) return { status: 'unknown', color: 'gray', icon: Activity }
    
    const criticalIssues = [
      latestData.cpuUsage > 90,
      latestData.memoryUsage > 90,
      latestData.responseTime > 1000,
      latestData.errorRate > 5
    ].filter(Boolean).length

    if (criticalIssues >= 2) {
      return { status: 'critical', color: 'red', icon: AlertTriangle }
    } else if (criticalIssues === 1 || latestData.cpuUsage > 80 || latestData.memoryUsage > 80) {
      return { status: 'warning', color: 'yellow', icon: Activity }
    } else {
      return { status: 'healthy', color: 'green', icon: CheckCircle }
    }
  }

  const healthStatus = getHealthStatus()

  const renderChart = () => {
    const filteredData = selectedMetric === 'all' ? data : data

    if (chartType === 'line') {
      return (
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          {(selectedMetric === 'all' || selectedMetric === 'cpu') && (
            <Line
              type="monotone"
              dataKey="cpuUsage"
              stroke={chartConfig.cpuUsage.color}
              strokeWidth={2}
              dot={{ r: 3, cursor: 'pointer' }}
              onClick={handleDataPointClick}
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'memory') && (
            <Line
              type="monotone"
              dataKey="memoryUsage"
              stroke={chartConfig.memoryUsage.color}
              strokeWidth={2}
              dot={{ r: 3, cursor: 'pointer' }}
              onClick={handleDataPointClick}
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'response') && (
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke={chartConfig.responseTime.color}
              strokeWidth={2}
              dot={{ r: 3, cursor: 'pointer' }}
              onClick={handleDataPointClick}
              yAxisId="right"
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'error') && (
            <Line
              type="monotone"
              dataKey="errorRate"
              stroke={chartConfig.errorRate.color}
              strokeWidth={2}
              dot={{ r: 3, cursor: 'pointer' }}
              onClick={handleDataPointClick}
            />
          )}
        </LineChart>
      )
    } else {
      return (
        <AreaChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          {(selectedMetric === 'all' || selectedMetric === 'cpu') && (
            <Area
              type="monotone"
              dataKey="cpuUsage"
              stackId="1"
              stroke={chartConfig.cpuUsage.color}
              fill={chartConfig.cpuUsage.color}
              fillOpacity={0.6}
              cursor="pointer"
              onClick={handleDataPointClick}
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'memory') && (
            <Area
              type="monotone"
              dataKey="memoryUsage"
              stackId="1"
              stroke={chartConfig.memoryUsage.color}
              fill={chartConfig.memoryUsage.color}
              fillOpacity={0.6}
              cursor="pointer"
              onClick={handleDataPointClick}
            />
          )}
        </AreaChart>
      )
    }
  }

  return (
    <div>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <healthStatus.icon className={`h-5 w-5 text-${healthStatus.color}-600`} />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time monitoring of system performance metrics
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            >
              {chartType === 'line' ? 'Area Chart' : 'Line Chart'}
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Current Status */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold text-${healthStatus.color}-600`}>
                {healthStatus.status.toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{latestData?.cpuUsage.toFixed(1) || 0}%</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" />
                CPU Usage
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{latestData?.memoryUsage.toFixed(1) || 0}%</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Activity className="h-3 w-3" />
                Memory Usage
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{latestData?.responseTime.toFixed(0) || 0}ms</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Response Time
              </div>
            </div>
          </div>

          {/* Metric Filter */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Show:</span>
            {[
              { key: 'all', label: 'All Metrics' },
              { key: 'cpu', label: 'CPU' },
              { key: 'memory', label: 'Memory' },
              { key: 'response', label: 'Response Time' },
              { key: 'error', label: 'Error Rate' }
            ].map((option) => (
              <Button
                key={option.key}
                variant={selectedMetric === option.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Chart */}
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </ChartContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
              <span className="text-sm">CPU Usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
              <span className="text-sm">Memory Usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]" />
              <span className="text-sm">Response Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-4))]" />
              <span className="text-sm">Error Rate</span>
            </div>
          </div>

          {/* Averages */}
          {showDetailedView && (
            <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold">{avgCpuUsage.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Avg CPU</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{avgMemoryUsage.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Avg Memory</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{avgResponseTime.toFixed(0)}ms</div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{avgErrorRate.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground">Avg Errors</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        title="System Health Details"
        data={selectedDataPoint}
        onDrillDown={handleDrillDown}
        metric="system-health"
      />
    </div>
  )
}