"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Calendar,
  Bell,
  Shield,
  Database,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { SystemSettingsPanel } from './system-settings-panel'
import { AcademicCalendarManager, AcademicEvent } from './academic-calendar-manager'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { adminApi } from '@/lib/api/admin'

interface SystemConfigDashboardProps {
  className?: string
}

export function SystemConfigDashboard({ className }: SystemConfigDashboardProps) {
  const [activeTab, setActiveTab] = useState('settings')

  const queryClient = useQueryClient()

  // Fetch system settings
  const { data: systemSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['admin-system-settings'],
    queryFn: () => adminApi.getSystemSettings().then(res => res.data),
  })

  // Fetch academic events
  const { data: academicEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-academic-events'],
    queryFn: () => adminApi.getAcademicEvents().then(res => res.data),
  })

  // Fetch system status
  const { data: systemStatus } = useQuery({
    queryKey: ['admin-system-status'],
    queryFn: () => adminApi.getSystemStatus().then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch notification settings
  const { data: notificationSettings } = useQuery({
    queryKey: ['admin-notification-settings'],
    queryFn: () => adminApi.getNotificationSettings().then(res => res.data),
  })

  // Update system settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: any) => adminApi.updateSystemSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] })
      toast.success('System settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update system settings')
    },
  })

  // Reset system settings mutation
  const resetSettingsMutation = useMutation({
    mutationFn: () => adminApi.resetSystemSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] })
      toast.success('System settings reset to defaults')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset system settings')
    },
  })

  // Academic event mutations
  const createEventMutation = useMutation({
    mutationFn: (event: any) => adminApi.createAcademicEvent(event).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-academic-events'] })
      toast.success('Academic event created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create academic event')
    },
  })

  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, event }: { eventId: string; event: any }) =>
      adminApi.updateAcademicEvent(eventId, event).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-academic-events'] })
      toast.success('Academic event updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update academic event')
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => adminApi.deleteAcademicEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-academic-events'] })
      toast.success('Academic event deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete academic event')
    },
  })

  // Calendar import/export mutations
  const importCalendarMutation = useMutation({
    mutationFn: (file: File) => adminApi.importAcademicCalendar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-academic-events'] })
      toast.success('Academic calendar imported successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import academic calendar')
    },
  })

  const handleSaveSettings = async (settings: any) => {
    await updateSettingsMutation.mutateAsync(settings)
  }

  const handleResetSettings = async () => {
    await resetSettingsMutation.mutateAsync()
  }

  const handleCreateEvent = async (event: any) => {
    await createEventMutation.mutateAsync(event)
  }

  const handleUpdateEvent = async (eventId: string, event: any) => {
    await updateEventMutation.mutateAsync({ eventId, event })
  }

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEventMutation.mutateAsync(eventId)
  }

  const handleImportCalendar = async (file: File) => {
    await importCalendarMutation.mutateAsync(file)
  }

  const handleExportCalendar = async () => {
    try {
      const response = await adminApi.exportAcademicCalendar()
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'academic-calendar.ics')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Academic calendar exported successfully')
    } catch (error) {
      toast.error('Failed to export academic calendar')
    }
  }

  const getSystemHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Healthy</Badge>
      case 'warning':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>
      case 'critical':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground">
            Manage system settings, academic calendar, and notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {systemStatus && (
            <div className="flex items-center space-x-2">
              {getSystemHealthBadge(systemStatus.systemHealth)}
              <span className="text-sm text-muted-foreground">
                v{systemStatus.systemVersion}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* System Status Overview */}
      {systemStatus && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getSystemHealthBadge(systemStatus.systemHealth)}
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime: {systemStatus.systemUptime}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus.storageUsage}%</div>
              <p className="text-xs text-muted-foreground">
                Database: {systemStatus.databaseStatus}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(systemStatus.lastBackup).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Next: {new Date(systemStatus.nextBackup).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Settings
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Academic Calendar
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <SystemSettingsPanel
            settings={systemSettings || {}}
            onSave={handleSaveSettings}
            onReset={handleResetSettings}
            isLoading={updateSettingsMutation.isPending || resetSettingsMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <AcademicCalendarManager
            events={academicEvents}
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onImportCalendar={handleImportCalendar}
            onExportCalendar={handleExportCalendar}
            isLoading={
              createEventMutation.isPending ||
              updateEventMutation.isPending ||
              deleteEventMutation.isPending ||
              importCalendarMutation.isPending
            }
          />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification templates and delivery channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Email Templates */}
                <div>
                  <h4 className="font-medium mb-4">Email Templates</h4>
                  <div className="space-y-2">
                    {notificationSettings?.emailTemplates.map((template: any) => (
                      <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.enabled ? 'default' : 'secondary'}>
                            {template.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification Channels */}
                <div>
                  <h4 className="font-medium mb-4">Notification Channels</h4>
                  <div className="space-y-2">
                    {notificationSettings?.notificationChannels.map((channel: any) => (
                      <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-sm text-muted-foreground">{channel.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={channel.enabled ? 'default' : 'secondary'}>
                            {channel.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Advanced security settings and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  Security configuration panel coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
