"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  FileText,
  MessageSquare,
  User,
  AlertTriangle,
  Clock,
  Check,
  X,
  Flag,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { ContentReviewQueue, ContentItem } from './content-review-queue'
import { ContentDetailsDialog } from './content-details-dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { adminApi } from '@/lib/api/admin'

interface ContentModerationDashboardProps {
  className?: string
}

export function ContentModerationDashboard({ className }: ContentModerationDashboardProps) {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState<{ action: string; itemIds: string[] } | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const queryClient = useQueryClient()

  // Fetch content items
  const { data: contentItems = [], isLoading: itemsLoading, refetch: refetchItems } = useQuery({
    queryKey: ['admin-content-items'],
    queryFn: () => adminApi.getContentItems().then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch content statistics
  const { data: contentStats } = useQuery({
    queryKey: ['admin-content-stats'],
    queryFn: () => adminApi.getContentStats().then(res => res.data),
    refetchInterval: 60000, // Refresh every minute
  })

  // Approve content mutation
  const approveContentMutation = useMutation({
    mutationFn: ({ itemId, notes }: { itemId: string; notes?: string }) =>
      adminApi.approveContent(itemId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-items'] })
      queryClient.invalidateQueries({ queryKey: ['admin-content-stats'] })
      toast.success('Content approved successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve content')
    },
  })

  // Reject content mutation
  const rejectContentMutation = useMutation({
    mutationFn: ({ itemId, reason }: { itemId: string; reason: string }) =>
      adminApi.rejectContent(itemId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-items'] })
      queryClient.invalidateQueries({ queryKey: ['admin-content-stats'] })
      toast.success('Content rejected successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject content')
    },
  })

  // Flag content mutation
  const flagContentMutation = useMutation({
    mutationFn: ({ itemId, reason }: { itemId: string; reason: string }) =>
      adminApi.flagContent(itemId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-items'] })
      queryClient.invalidateQueries({ queryKey: ['admin-content-stats'] })
      toast.success('Content flagged successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to flag content')
    },
  })

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ action, itemIds, notes }: { action: string; itemIds: string[]; notes?: string }) =>
      adminApi.bulkContentAction(action, itemIds, notes),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-items'] })
      queryClient.invalidateQueries({ queryKey: ['admin-content-stats'] })
      toast.success(`Bulk ${action} completed successfully`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Bulk action failed')
    },
  })

  // Filter content items based on active tab
  const filteredItems = contentItems.filter((item) => {
    switch (activeTab) {
      case 'projects':
        return item.type === 'project'
      case 'comments':
        return item.type === 'comment'
      case 'profiles':
        return item.type === 'profile'
      case 'announcements':
        return item.type === 'announcement'
      case 'pending':
        return item.status === 'pending'
      case 'flagged':
        return item.status === 'flagged'
      default:
        return true
    }
  })

  const handleViewDetails = (item: ContentItem) => {
    setSelectedItem(item)
    setShowDetailsDialog(true)
  }

  const handleApprove = (itemId: string, notes?: string) => {
    approveContentMutation.mutate({ itemId, notes })
  }

  const handleReject = (itemId: string, reason: string) => {
    rejectContentMutation.mutate({ itemId, reason })
  }

  const handleFlag = (itemId: string, reason: string) => {
    flagContentMutation.mutate({ itemId, reason })
  }

  const handleBulkAction = (action: string, itemIds: string[], notes?: string) => {
    setBulkAction({ action, itemIds })
    setShowBulkActionDialog(true)
  }

  const confirmBulkAction = () => {
    if (bulkAction) {
      bulkActionMutation.mutate({
        action: bulkAction.action,
        itemIds: bulkAction.itemIds,
      })
      setBulkAction(null)
      setShowBulkActionDialog(false)
    }
  }

  const handleExportReport = async (format: 'csv' | 'excel') => {
    try {
      const response = await adminApi.exportContentReport(format)
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `content-moderation-report.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const handleRefresh = () => {
    refetchItems()
    toast.success('Content data refreshed')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
          <p className="text-muted-foreground">
            Review and moderate user-generated content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={itemsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${itemsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportReport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats?.pendingReview || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg. review time: {contentStats?.averageReviewTime || 0}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats?.approvedToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </span>
              {' '}from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats?.rejectedToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -5%
              </span>
              {' '}from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Items</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats?.flaggedItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Review Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Content Review Queue</CardTitle>
          <CardDescription>
            Review and moderate content submitted by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">
                All Content
                <Badge variant="secondary" className="ml-2">
                  {contentItems.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="destructive" className="ml-2">
                  {contentStats?.pendingReview || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="flagged">
                Flagged
                <Badge variant="secondary" className="ml-2">
                  {contentStats?.flaggedItems || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="projects">
                Projects
                <Badge variant="secondary" className="ml-2">
                  {contentStats?.projectsCount || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="comments">
                Comments
                <Badge variant="secondary" className="ml-2">
                  {contentStats?.commentsCount || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="profiles">
                Profiles
                <Badge variant="secondary" className="ml-2">
                  {contentStats?.profilesCount || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="announcements">
                Announcements
                <Badge variant="secondary" className="ml-2">
                  {contentStats?.announcementsCount || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <ContentReviewQueue
                items={filteredItems}
                isLoading={itemsLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                onFlag={handleFlag}
                onBulkAction={handleBulkAction}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Content Details Dialog */}
      <ContentDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        item={selectedItem}
        onApprove={handleApprove}
        onReject={handleReject}
        onFlag={handleFlag}
      />

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkAction?.action} {bulkAction?.itemIds.length} item(s)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={
                bulkAction?.action === 'reject' || bulkAction?.action === 'flag'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              Confirm {bulkAction?.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}