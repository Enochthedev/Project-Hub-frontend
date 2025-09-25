"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { MoreHorizontal, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react'

interface AnalyticsChartProps {
  title: string
  description?: string
  data: any[]
  chartType?: 'line' | 'bar' | 'area' | 'pie'
  xAxisKey: string
  yAxisKeys: string[]
  colors?: string[]
  onDrillDown?: (filters: Record<string, any>) => void
  showLegend?: boolean
  showControls?: boolean
  className?: string
}

const defaultColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
]

export function AnalyticsChart({
  title,
  description,
  data,
  chartType: initialChartType = 'line',
  xAxisKey,
  yAxisKeys,
  colors = defaultColors,
  onDrillDown,
  showLegend = true,
  showControls = true,
  className
}: AnalyticsChartProps) {
  const [chartType, setChartType] = useState(initialChartType)
  const [selectedMetric, setSelectedMetric] = useState<string>('all')

  const handleDataPointClick = (data: any) => {
    onDrillDown?.(data)
  }

  const chartConfig = yAxisKeys.reduce((config, key, index) => {
    config[key] = {
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      color: colors[index % colors.length]
    }
    return config
  }, {} as Record<string, { label: string; color: string }>)

  const renderChart = () => {
    const filteredKeys = selectedMetric === 'all' ? yAxisKeys : [selectedMetric]

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <Legend />}
            {filteredKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4, cursor: 'pointer' }}
                onClick={handleDataPointClick}
              />
            ))}
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <Legend />}
            {filteredKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                cursor="pointer"
                onClick={handleDataPointClick}
              />
            ))}
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {showLegend && <Legend />}
            {filteredKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
                cursor="pointer"
                onClick={handleDataPointClick}
              />
            ))}
          </AreaChart>
        )

      case 'pie':
        // For pie charts, we'll use the first yAxisKey as the value
        const pieData = data.map(item => ({
          name: item[xAxisKey],
          value: item[yAxisKeys[0]],
          ...item
        }))
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handleDataPointClick}
              style={{ cursor: 'pointer' }}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        )

      default:
        return null
    }
  }

  const getChartIcon = () => {
    switch (chartType) {
      case 'line':
        return TrendingUp
      case 'bar':
        return BarChart3
      case 'area':
        return Activity
      case 'pie':
        return PieChartIcon
      default:
        return BarChart3
    }
  }

  const ChartIcon = getChartIcon()

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ChartIcon className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        {showControls && (
          <div className="flex items-center space-x-2">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
              </SelectContent>
            </Select>
            {yAxisKeys.length > 1 && (
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  {yAxisKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {chartConfig[key]?.label || key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}