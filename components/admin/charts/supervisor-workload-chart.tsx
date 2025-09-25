"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { MoreHorizontal, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { SupervisorWorkloadData } from '@/lib/api/admin'
import { DrillDownModal } from '../modals/drill-down-modal'

interface SupervisorWorkloadChartProps {
  data: SupervisorWorkloadData[]
  onDrillDown?: (filters: Record<string, any>) => void
  showDetailedView?: boolean
  className?: string
}

const chartConfig = {
  currentStudents: {
    label: 'Current Students',
    color: 'hsl(var(--chart-1))'
  },
  maxCapacity: {
    label: 'Max Capacity',
    color: 'hsl(var(--chart-2))'
  }
}

export function SupervisorWorkloadChart({ 
  data, 
  onDrillDown, 
  showDetailedView = false,
  className 
}: SupervisorWorkloadChartProps) {
  const [showDrillDown, setShowDrillDown] = useState(false)
  const [selectedSupervisor, setSelectedSupervisor] = useState<SupervisorWorkloadData | null>(null)

  const handleSupervisorClick = (supervisor: SupervisorWorkloadData) => {
    setSelectedSupervisor(supervisor)
    setShowDrillDown(true)
  }

  const handleDrillDown = (filters: Record<string, any>) => {
    onDrillDown?.({ ...filters, supervisorId: selectedSupervisor?.supervisorId })
    setShowDrillDown(false)
  }

  // Calculate summary statistics
  const totalSupervisors = data.length
  const totalStudents = data.reduce((sum, item) => sum + item.currentStudents, 0)
  const totalCapacity = data.reduce((sum, item) => sum + item.maxCapacity, 0)
  const averageUtilization = data.reduce((sum, item) => sum + item.utilizationRate, 0) / totalSupervisors
  const overloadedSupervisors = data.filter(item => item.utilizationRate > 90).length

  // Prepare data for charts
  const chartData = data.map(item => ({
    ...item,
    shortName: item.name.split(' ').map(n => n[0]).join('') || item.name.substring(0, 3)
  }))

  return (
    <div>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Supervisor Workload
            </CardTitle>
            <CardDescription>
              Monitor supervisor capacity and student distribution
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalSupervisors}</div>
              <div className="text-sm text-muted-foreground">Total Supervisors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{averageUtilization.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalCapacity - totalStudents}</div>
              <div className="text-sm text-muted-foreground">Available Slots</div>
            </div>
          </div>

          {/* Alert Indicators */}
          {overloadedSupervisors > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  {overloadedSupervisors} supervisor{overloadedSupervisors > 1 ? 's' : ''} overloaded (>90%)
                </span>
              </div>
            </div>
          )}

          {/* Chart */}
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="shortName"
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="currentStudents"
                  fill={chartConfig.currentStudents.color}
                  cursor="pointer"
                />
                <Bar
                  dataKey="maxCapacity"
                  fill={chartConfig.maxCapacity.color}
                  opacity={0.6}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
              <span className="text-sm">Current Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))] opacity-60" />
              <span className="text-sm">Max Capacity</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      <DrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        title={`${selectedSupervisor?.name} - Workload Details`}
        data={selectedSupervisor}
        onDrillDown={handleDrillDown}
        metric="supervisor-workload"
      />
    </div>
  )
}