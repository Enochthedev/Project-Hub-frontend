"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { MoreHorizontal, TrendingUp, Users, UserPlus } from 'lucide-react'
import { UserGrowthData } from '@/lib/api/admin'
import { DrillDownModal } from '../modals/drill-down-modal'

interface UserGrowthChartProps {
  data: UserGrowthData[]
  onDrillDown?: (filters: Record<string, any>) => void
  showDetailedView?: boolean
  className?: string
}

const chartConfig = {
  students: {
    label: 'Students',
    color: 'hsl(var(--chart-1))'
  },
  supervisors: {
    label: 'Supervisors',
    color: 'hsl(var(--chart-2))'
  },
  total: {
    label: 'Total Users',
    color: 'hsl(var(--chart-3))'
  }
}

export function UserGrowthChart({ 
  data, 
  onDrillDown, 
  showDetailedView = false,
  className 
}: UserGrowthChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
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

  const totalUsers = data.reduce((sum, item) => sum + item.total, 0)
  const totalStudents = data.reduce((sum, item) => sum + item.students, 0)
  const totalSupervisors = data.reduce((sum, item) => sum + item.supervisors, 0)

  const growthRate = data.length > 1 
    ? ((data[data.length - 1].total - data[0].total) / data[0].total) * 100
    : 0

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="students"
            stroke={chartConfig.students.color}
            strokeWidth={2}
            dot={{ r: 4, cursor: 'pointer' }}
            onClick={handleDataPointClick}
          />
          <Line
            type="monotone"
            dataKey="supervisors"
            stroke={chartConfig.supervisors.color}
            strokeWidth={2}
            dot={{ r: 4, cursor: 'pointer' }}
            onClick={handleDataPointClick}
          />
          {showDetailedView && (
            <Line
              type="monotone"
              dataKey="total"
              stroke={chartConfig.total.color}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, cursor: 'pointer' }}
              onClick={handleDataPointClick}
            />
          )}
        </LineChart>
      )
    } else {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <Bar
            dataKey="students"
            fill={chartConfig.students.color}
            cursor="pointer"
            onClick={handleDataPointClick}
          />
          <Bar
            dataKey="supervisors"
            fill={chartConfig.supervisors.color}
            cursor="pointer"
            onClick={handleDataPointClick}
          />
        </BarChart>
      )
    }
  }

  return (
    <div>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Growth
            </CardTitle>
            <CardDescription>
              Track user registration and growth trends over time
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
            >
              {chartType === 'line' ? 'Bar Chart' : 'Line Chart'}
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalStudents.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalSupervisors.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Supervisors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                Total Users
                <TrendingUp className="h-3 w-3" />
                <span className={growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                </span>
              </div>
            </div>
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
              <span className="text-sm">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
              <span className="text-sm">Supervisors</span>
            </div>
            {showDetailedView && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))] opacity-70" />
                <span className="text-sm">Total (Trend)</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        title="User Growth Details"
        data={selectedDataPoint}
        onDrillDown={handleDrillDown}
        metric="user-growth"
      />
    </div>
  )
}
