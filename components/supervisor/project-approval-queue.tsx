'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useSupervisorStore } from '@/lib/stores/supervisor-store'
import { ProjectSubmission } from '@/lib/api/supervisor'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Calendar,
  User,
  Tag,
  BookOpen,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

export default function ProjectApprovalQueue() {
  const {
    projectApprovalQueue,
    isProjectApprovalQueueLoading,
    projectApprovalQueueError,
    isProjectActionLoading,
    projectActionError,
    fetchProjectApprovalQueue,
    approveProject,
    rejectProject,
    selectProject,
    clearErrors
  } = useSupervisorStore()

  const [selectedProjectForAction, setSelectedProjectForAction] = useState<ProjectSubmission | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionSuggestions, setRejectionSuggestions] = useState('')

  useEffect(() => {
    fetchProjectApprovalQueue()
  }, [fetchProjectApprovalQueue])

  const handleApprove = async () => {
    if (!selectedProjectForAction) return
    
    try {
      await approveProject(selectedProjectForAction.id, { 
        notes: approvalNotes.trim() || undefined 
      })
      setSelectedProjectForAction(null)
      setActionType(null)
      setApprovalNotes('')
    } catch (error) {
      console.error('Failed to approve project:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedProjectForAction || !rejectionReason.trim()) return
    
    try {
      await rejectProject(selectedProjectForAction.id, {
        reason: rejectionReason.trim(),
        suggestions: rejectionSuggestions.trim() ? [rejectionSuggestions.trim()] : undefined
      })
      setSelectedProjectForAction(null)
      setActionType(null)
      setRejectionReason('')
      setRejectionSuggestions('')
    } catch (error) {
      console.error('Failed to reject project:', error)
    }
  }

  const openActionDialog = (project: ProjectSubmission, action: 'approve' | 'reject') => {
    setSelectedProjectForAction(project)
    setActionType(action)
  }

  const closeActionDialog = () => {
    setSelectedProjectForAction(null)
    setActionType(null)
    setApprovalNotes('')
    setRejectionReason('')
    setRejectionSuggestions('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-green-600'
      case 'intermediate':
        return 'text-yellow-600'
      case 'advanced':
        return 'text-orange-600'
      case 'expert':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isProjectApprovalQueueLoading) {
    return <QueueSkeleton />
  }

  if (projectApprovalQueueError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {projectApprovalQueueError}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              clearErrors()
              fetchProjectApprovalQueue()
            }}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!projectApprovalQueue) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No approval queue data available</p>
        <Button onClick={fetchProjectApprovalQueue} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Load Queue
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Queue Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectApprovalQueue.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{projectApprovalQueue.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{projectApprovalQueue.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{projectApprovalQueue.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {projectApprovalQueue.projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No projects in the approval queue</p>
            </CardContent>
          </Card>
        ) : (
          projectApprovalQueue.projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {project.abstract}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusBadge(project.approvalStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Supervisor:</span>
                      <span>{project.supervisor?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Specialization:</span>
                      <span>{project.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Submitted:</span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Difficulty:</span>
                      <span className={`capitalize ${getDifficultyColor(project.difficultyLevel)}`}>
                        {project.difficultyLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Group Project:</span>
                      <span>{project.isGroupProject ? 'Yes' : 'No'}</span>
                      {project.isGroupProject && project.maxGroupSize && (
                        <span className="text-muted-foreground">(Max {project.maxGroupSize})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Duration:</span>
                      <span>{project.estimatedDuration}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Tags:</span>
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Technology Stack */}
                {project.technologyStack.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">Technologies:</span>
                    {project.technologyStack.map((tech, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectProject(project)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {project.approvalStatus === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openActionDialog(project, 'approve')}
                        disabled={isProjectActionLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openActionDialog(project, 'reject')}
                        disabled={isProjectActionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>

                {/* Approval/Rejection Details */}
                {project.approvalNotes && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Approval Notes:</p>
                    <p className="text-sm text-green-700 mt-1">{project.approvalNotes}</p>
                  </div>
                )}
                
                {project.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                    <p className="text-sm text-red-700 mt-1">{project.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Dialogs */}
      <Dialog open={actionType === 'approve'} onOpenChange={(open) => !open && closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{selectedProjectForAction?.title}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Approval Notes (Optional)</label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about the approval..."
                className="mt-1"
              />
            </div>
          </div>
          {projectActionError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{projectActionError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isProjectActionLoading}>
              {isProjectActionLoading ? 'Approving...' : 'Approve Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionType === 'reject'} onOpenChange={(open) => !open && closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedProjectForAction?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this project is being rejected..."
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Suggestions for Improvement (Optional)</label>
              <Textarea
                value={rejectionSuggestions}
                onChange={(e) => setRejectionSuggestions(e.target.value)}
                placeholder="Provide suggestions for how the project could be improved..."
                className="mt-1"
              />
            </div>
          </div>
          {projectActionError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{projectActionError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={isProjectActionLoading || !rejectionReason.trim()}
            >
              {isProjectActionLoading ? 'Rejecting...' : 'Reject Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function QueueSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-96 mt-2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
