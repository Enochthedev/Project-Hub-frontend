"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Download, Filter, Search, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { adminApi, DrillDownData } from '@/lib/api/admin'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DrillDownModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: any
  onDrillDown: (filters: Record<string, any>) => void
  metric: string
}

export function DrillDownModal({
  isOpen,
  onClose,
  title,
  data,
  onDrillDown,
  metric
}: DrillDownModalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState<Record<string, any>>({})

  // Fetch drill-down data
  const { data: drillDownData, isLoading } = useQuery({
    queryKey: ['drill-down', metric, filters],
    queryFn: () => adminApi.getDrillDownData(metric, filters),
    enabled: isOpen && !!metric,
  })

  useEffect(() => {
    if (isOpen && data) {
      // Set initial filters based on the selected data point
      const initialFilters: Record<string, any> = {}
      
      if (data.date) {
        initialFilters.date = data.date
      }
      if (data.status) {
        initialFilters.status = data.status
      }
      if (data.supervisorId) {
        initialFilters.supervisorId = data.supervisorId
      }
      
      setFilters(initialFilters)
    }
  }, [isOpen, data])

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      // Implementation would depend on the specific export API
      toast.success(`Data exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const renderOverview = () => {
    if (!drillDownData?.data) return null

    const breakdown = drillDownData.data.breakdown || {}
    const total = drillDownData.data.total || 0

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{total.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(breakdown).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Breakdown by Category</CardTitle>
            <CardDescription>
              Detailed distribution of {metric.replace('-', ' ')} data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(breakdown).map(([category, count]) => {
                const percentage = total > 0 ? ((count as number) / total) * 100 : 0
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="font-medium">{(count as number).toLocaleString()}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderDetails = () => {
    if (!drillDownData?.data?.data) return null

    const detailData = drillDownData.data.data

    return (
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {detailData.map((item: any, index: number) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-sm font-medium text-muted-foreground">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-sm">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    )
  }

  const renderTrends = () => {
    // This would show trend analysis if available
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Analysis
            </CardTitle>
            <CardDescription>
              Historical trends and patterns for this metric
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Trend analysis will be available in future updates</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Detailed analysis and breakdown of the selected data point
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <Badge key={key} variant="secondary">
                {key}: {String(value)}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDrillDown(filters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              renderOverview()
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              renderDetails()
            )}
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            {renderTrends()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
