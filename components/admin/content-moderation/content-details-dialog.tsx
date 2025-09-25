"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Check,
  X,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Flag,
} from 'lucide-react'
import { ContentItem } from './content-review-queue'
import { formatDistanceToNow, format } from 'date-fns'

interface ContentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ContentItem | null
  onApprove: (itemId: string) => void
  onReject: (itemId: string) => void
  onFlag: (itemId: string) => void
}

export function ContentDetailsDialog({
  open,
  onOpenChange,
  item,
  onApprove,
  onReject,
  onFlag,
}: ContentDetailsDialogProps) {
  if (!item) return null

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      case 'flagged': return 'secondary'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'project': return 'default'
      case 'comment': return 'secondary'
      case 'profile': return 'outline'
      case 'announcement': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-4 w-4" />
      case 'rejected': return <X className="h-4 w-4" />
      case 'flagged': return <Flag className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <FileText className="h-4 w-4" />
      case 'comment': return <MessageSquare className="h-4 w-4" />
      case 'profile': return <User className="h-4 w-4" />
      case 'announcement': return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(item.type)}
            Content Review Details
          </DialogTitle>
          <DialogDescription>
            Review and moderate content submitted by users
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant={getTypeBadgeVariant(item.type)}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {getStatusIcon(item.status)}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(item.priority)}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                    </Badge>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Author Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.author.profilePicture} />
                      <AvatarFallback>
                        {item.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{item.author.name}</div>
                      <div className="text-sm text-muted-foreground">{item.author.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm">
                    {item.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline and Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="font-medium">Submitted:</span>
                    <span className="text-muted-foreground">
                      {format(new Date(item.submittedAt), 'PPp')}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground ml-4">
                    {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                  </div>

                  {item.reviewedAt && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="font-medium">Reviewed:</span>
                        <span className="text-muted-foreground">
                          {format(new Date(item.reviewedAt), 'PPp')}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">
                        by {item.reviewedBy?.name}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(item.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-muted-foreground">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Review Notes */}
            {(item.reviewNotes || item.flagReason) && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {item.reviewNotes && (
                      <div>
                        <div className="text-sm font-medium">Review Notes:</div>
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {item.reviewNotes}
                        </div>
                      </div>
                    )}
                    {item.flagReason && (
                      <div>
                        <div className="text-sm font-medium text-destructive">Flag Reason:</div>
                        <div className="text-sm text-muted-foreground bg-destructive/10 p-3 rounded-md">
                          {item.flagReason}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content-specific details */}
            {item.type === 'project' && item.metadata && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {item.metadata.specialization && (
                      <div>
                        <span className="font-medium">Specialization:</span>
                        <div className="text-muted-foreground">{item.metadata.specialization}</div>
                      </div>
                    )}
                    {item.metadata.difficultyLevel && (
                      <div>
                        <span className="font-medium">Difficulty:</span>
                        <div className="text-muted-foreground">{item.metadata.difficultyLevel}</div>
                      </div>
                    )}
                    {item.metadata.tags && (
                      <div className="col-span-2">
                        <span className="font-medium">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.metadata.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            
            {item.status === 'pending' && (
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => onFlag(item.id)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Flag
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onReject(item.id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => onApprove(item.id)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}