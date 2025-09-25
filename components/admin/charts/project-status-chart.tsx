"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { MoreHorizontal, FolderOpen, Clock, CheckCircle, XCircle, Archive } from 'lucide-react'
import { ProjectStatusData } from '@/lib/api/admin'
import { DrillDownModal } from '../modals/drill-down-modal'

interface ProjectStatusChartProps {
  data: ProjectStatusData[]
  onDrillDown?: (filters: Record<string, any>) => void
  showDetailedView?: boolean
  className?: string
}

const statusColors = {
  'approved': '#10b981', // green
  'pending_approval': '#f59e0b', // amber
  'rejected': '#ef4444', // red
  'draft': '#6b7280', // gray
  'archived': '#8b5cf6' // purple
}

const statusIcons = {
  'approved': CheckCircle,
  'pending_approval': Clock,
  'rejected': XCircle,
  'draft': FolderOpen,
  'archived': Archive
}

const chartConfig = {
  approved: {
    label: 'Approved',
    color: statusColors.approved
  },
  pending_approval: {
    label: 'Pending Approval',
    color: statusColors.pending_approval
  },
  rejected: {
    label: 'Rejected',
    color: statusColors.rejected
  },
  draft: {
    label: 'Draft',
    color: statusColors.draft
  },
  archived: {
    label: 'Archived',
    color: statusColors.archived
  }
}

export function ProjectStatusChart({ 
  data, 
  onDrillDown, 
  showDetailedView = false,
  className 
}: ProjectStatusChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')
  const [showDrillDown, setShowDrillDown] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status)
    setShowDrillDown(true)
  }

  const handleDrillDown = (filters: Record<string, any>) => {
    onDrillDown?.({ ...filters, status: selectedStatus })
    setShowDrillDown(false)
  }

  const totalProjects = data.reduce((sum, item) => sum + item.count, 0)

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            onClick={(data) => handleStatusClick(data.status)}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={statusColors[entry.status as keyof typeof statusColors] || '#8884d8'} 
              />
            ))}
          </Pie>
          <ChartTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{data.status.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      Count: {data.count.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Percentage: {data.percentage.toFixed(1)}%
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      )
    } else {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="status" 
            tickFormatter={(value) => value.replace('_', ' ')}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="count"
            fill="#8884d8"
            cursor="pointer"
            onClick={(data) => handleStatusClick(data.status)}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={statusColors[entry.status as keyof typeof statusColors] || '#8884d8'} 
              />
            ))}
          </Bar>
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
              <FolderOpen className="h-5 w-5" />
              Project Status Distribution
            </CardTitle>
            <CardDescription>
              Overview of project statuses across the platform
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'pie' ? 'bar' : 'pie')}
            >
              {chartType === 'pie' ? 'Bar Chart' : 'Pie Chart'}
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalProjects.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.find(d => d.status === 'approved')?.percentage.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Approval Rate</div>
            </div>
          </div>

          {/* Chart */}
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </ChartContainer>

          {/* Status Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {data.map((item) => {
              const Icon = statusIcons[item.status as keyof typeof statusIcons] || FolderOpen
              return (
                <div 
                  key={item.status}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleStatusClick(item.status)}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: statusColors[item.status as keyof typeof statusColors] }}
                  />
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {item.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.count.toLocaleString()} ({item.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        title={`${selectedStatus?.replace('_', ' ').toUpperCase()} Projects`}
        data={data.find(d => d.status === selectedStatus)}
        onDrillDown={handleDrillDown}
        metric="project-status"
      />
    </div>
  )
}
