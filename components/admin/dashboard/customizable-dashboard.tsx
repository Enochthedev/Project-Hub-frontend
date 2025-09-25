"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
// import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Settings, Plus, X, GripVertical, Eye, EyeOff } from 'lucide-react'
import { DashboardWidget } from '../widgets/dashboard-widget'
import { UserGrowthChart } from '../charts/user-growth-chart'
import { ProjectStatusChart } from '../charts/project-status-chart'
import { SupervisorWorkloadChart } from '../charts/supervisor-workload-chart'
import { SystemHealthChart } from '../charts/system-health-chart'
import { MetricCard } from '../widgets/metric-card'

interface Widget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'custom'
  title: string
  component: string
  size: 'small' | 'medium' | 'large' | 'full'
  position: { x: number; y: number }
  visible: boolean
  config?: Record<string, any>
}

interface CustomizableDashboardProps {
  initialWidgets?: Widget[]
  onSave?: (widgets: Widget[]) => void
  className?: string
}

const availableWidgets = [
  {
    id: 'user-growth',
    type: 'chart' as const,
    title: 'User Growth Chart',
    component: 'UserGrowthChart',
    size: 'large' as const,
    description: 'Track user registration trends'
  },
  {
    id: 'project-status',
    type: 'chart' as const,
    title: 'Project Status Chart',
    component: 'ProjectStatusChart',
    size: 'medium' as const,
    description: 'Project approval status distribution'
  },
  {
    id: 'supervisor-workload',
    type: 'chart' as const,
    title: 'Supervisor Workload',
    component: 'SupervisorWorkloadChart',
    size: 'large' as const,
    description: 'Monitor supervisor capacity'
  },
  {
    id: 'system-health',
    type: 'chart' as const,
    title: 'System Health',
    component: 'SystemHealthChart',
    size: 'large' as const,
    description: 'Real-time system metrics'
  },
  {
    id: 'total-users',
    type: 'metric' as const,
    title: 'Total Users',
    component: 'MetricCard',
    size: 'small' as const,
    description: 'Total registered users'
  },
  {
    id: 'active-projects',
    type: 'metric' as const,
    title: 'Active Projects',
    component: 'MetricCard',
    size: 'small' as const,
    description: 'Currently active projects'
  }
]

const defaultWidgets: Widget[] = [
  {
    id: 'total-users',
    type: 'metric',
    title: 'Total Users',
    component: 'MetricCard',
    size: 'small',
    position: { x: 0, y: 0 },
    visible: true
  },
  {
    id: 'active-projects',
    type: 'metric',
    title: 'Active Projects',
    component: 'MetricCard',
    size: 'small',
    position: { x: 1, y: 0 },
    visible: true
  },
  {
    id: 'user-growth',
    type: 'chart',
    title: 'User Growth',
    component: 'UserGrowthChart',
    size: 'large',
    position: { x: 0, y: 1 },
    visible: true
  },
  {
    id: 'project-status',
    type: 'chart',
    title: 'Project Status',
    component: 'ProjectStatusChart',
    size: 'medium',
    position: { x: 2, y: 1 },
    visible: true
  }
]

export function CustomizableDashboard({
  initialWidgets = defaultWidgets,
  onSave,
  className
}: CustomizableDashboardProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)

  // const handleDragEnd = useCallback((result: DropResult) => {
  //   if (!result.destination) return

  //   const items = Array.from(widgets)
  //   const [reorderedItem] = items.splice(result.source.index, 1)
  //   items.splice(result.destination.index, 0, reorderedItem)

  //   // Update positions
  //   const updatedWidgets = items.map((widget, index) => ({
  //     ...widget,
  //     position: { x: index % 4, y: Math.floor(index / 4) }
  //   }))

  //   setWidgets(updatedWidgets)
  // }, [widgets])

  const addWidget = (widgetTemplate: typeof availableWidgets[0]) => {
    const newWidget: Widget = {
      id: `${widgetTemplate.id}-${Date.now()}`,
      type: widgetTemplate.type,
      title: widgetTemplate.title,
      component: widgetTemplate.component,
      size: widgetTemplate.size,
      position: { x: widgets.length % 4, y: Math.floor(widgets.length / 4) },
      visible: true
    }

    setWidgets([...widgets, newWidget])
    setShowAddWidget(false)
  }

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId))
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ))
  }

  const updateWidgetSize = (widgetId: string, size: Widget['size']) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, size } : w
    ))
  }

  const saveDashboard = () => {
    onSave?.(widgets)
    setIsCustomizing(false)
  }

  const renderWidget = (widget: Widget) => {
    if (!widget.visible) return null

    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1',
      large: 'col-span-2 row-span-2',
      full: 'col-span-4 row-span-2'
    }

    const widgetContent = () => {
      switch (widget.component) {
        case 'UserGrowthChart':
          return <UserGrowthChart data={[]} />
        case 'ProjectStatusChart':
          return <ProjectStatusChart data={[]} />
        case 'SupervisorWorkloadChart':
          return <SupervisorWorkloadChart data={[]} />
        case 'SystemHealthChart':
          return <SystemHealthChart data={[]} />
        case 'MetricCard':
          return (
            <MetricCard
              title={widget.title}
              value="--"
              icon={() => <div className="w-4 h-4 bg-muted rounded" />}
              description="Loading..."
            />
          )
        default:
          return (
            <DashboardWidget
              title={widget.title}
              description="Custom widget"
            >
              <div className="p-4 text-center text-muted-foreground">
                Widget content goes here
              </div>
            </DashboardWidget>
          )
      }
    }

    return (
      <div
        key={widget.id}
        className={`${sizeClasses[widget.size]} relative group`}
      >
        {isCustomizing && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleWidgetVisibility(widget.id)}
            >
              {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeWidget(widget.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {widgetContent()}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            {isCustomizing ? 'Customize your dashboard layout' : 'Your personalized admin dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isCustomizing && (
            <>
              <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Widget</DialogTitle>
                    <DialogDescription>
                      Choose a widget to add to your dashboard
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    {availableWidgets.map((widget) => (
                      <Card 
                        key={widget.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => addWidget(widget)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{widget.title}</CardTitle>
                          <CardDescription>{widget.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Size: {widget.size}
                            </span>
                            <Button size="sm">Add</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={saveDashboard}>
                Save Layout
              </Button>
              <Button variant="outline" onClick={() => setIsCustomizing(false)}>
                Cancel
              </Button>
            </>
          )}
          {!isCustomizing && (
            <Button
              variant="outline"
              onClick={() => setIsCustomizing(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-4 gap-4 auto-rows-fr">
        {widgets.filter(w => w.visible).map(renderWidget)}
      </div>

      {/* Widget Configuration Panel */}
      {isCustomizing && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Widget Settings</CardTitle>
            <CardDescription>
              Configure individual widget properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {widgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={widget.visible}
                      onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                    />
                    <div>
                      <Label className="font-medium">{widget.title}</Label>
                      <p className="text-sm text-muted-foreground">{widget.component}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={widget.size}
                      onValueChange={(size: Widget['size']) => updateWidgetSize(widget.id, size)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="full">Full Width</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWidget(widget.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
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