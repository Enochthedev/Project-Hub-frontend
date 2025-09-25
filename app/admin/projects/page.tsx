"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Search,
  MoreHorizontal,
  Download,
  FolderOpen,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
} from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  status: "pending" | "approved" | "rejected" | "under_review"
  submittedBy: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  supervisor?: {
    id: string
    name: string
    email: string
  }
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  tags: string[]
  department: string
  priority: "low" | "medium" | "high"
}

export default function AdminProjectsPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve")

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: "1",
        title: "AI-Powered Student Performance Analytics",
        description:
          "A machine learning system to analyze and predict student performance patterns using historical academic data.",
        status: "pending",
        submittedBy: {
          id: "1",
          name: "John Doe",
          email: "john.doe@ui.edu.ng",
        },
        supervisor: {
          id: "2",
          name: "Dr. Sarah Wilson",
          email: "sarah.wilson@ui.edu.ng",
        },
        submittedAt: "2024-01-18T10:30:00Z",
        tags: ["AI", "Machine Learning", "Analytics"],
        department: "Computer Science",
        priority: "high",
      },
      {
        id: "2",
        title: "Blockchain-Based Academic Credential Verification",
        description:
          "A decentralized system for verifying and managing academic credentials using blockchain technology.",
        status: "under_review",
        submittedBy: {
          id: "3",
          name: "Michael Johnson",
          email: "michael.johnson@ui.edu.ng",
        },
        supervisor: {
          id: "4",
          name: "Prof. David Brown",
          email: "david.brown@ui.edu.ng",
        },
        submittedAt: "2024-01-17T14:20:00Z",
        tags: ["Blockchain", "Security", "Verification"],
        department: "Information Systems",
        priority: "medium",
      },
      {
        id: "3",
        title: "Mobile App for Campus Navigation",
        description:
          "An augmented reality mobile application to help students and visitors navigate the university campus.",
        status: "approved",
        submittedBy: {
          id: "5",
          name: "Sarah Ahmed",
          email: "sarah.ahmed@ui.edu.ng",
        },
        supervisor: {
          id: "6",
          name: "Dr. James Wilson",
          email: "james.wilson@ui.edu.ng",
        },
        submittedAt: "2024-01-15T09:15:00Z",
        reviewedAt: "2024-01-16T11:30:00Z",
        reviewedBy: "Admin User",
        tags: ["Mobile", "AR", "Navigation"],
        department: "Software Engineering",
        priority: "low",
      },
      {
        id: "4",
        title: "IoT-Based Smart Library System",
        description: "An Internet of Things solution for automated book tracking and library management.",
        status: "rejected",
        submittedBy: {
          id: "7",
          name: "David Chen",
          email: "david.chen@ui.edu.ng",
        },
        submittedAt: "2024-01-14T16:45:00Z",
        reviewedAt: "2024-01-15T10:20:00Z",
        reviewedBy: "Admin User",
        rejectionReason:
          "Similar project already exists. Please consider a different approach or focus on a specific aspect.",
        tags: ["IoT", "Library", "Automation"],
        department: "Computer Engineering",
        priority: "medium",
      },
    ]

    setTimeout(() => {
      setProjects(mockProjects)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || project.department === departmentFilter

    return matchesSearch && matchesStatus && matchesDepartment
  })

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    )
  }

  const handleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([])
    } else {
      setSelectedProjects(filteredProjects.map((project) => project.id))
    }
  }

  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedProjects.length === 0) {
      toast.error("Please select projects first")
      return
    }

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newStatus = action === "approve" ? "approved" : "rejected"
      setProjects((prev) =>
        prev.map((project) =>
          selectedProjects.includes(project.id)
            ? {
                ...project,
                status: newStatus as any,
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.name || "Admin",
              }
            : project,
        ),
      )

      toast.success(`${selectedProjects.length} projects ${action}d successfully`)
      setSelectedProjects([])
    } catch (error) {
      toast.error(`Failed to ${action} projects`)
    }
  }

  const handleReviewProject = async (projectId: string, action: "approve" | "reject", reason?: string) => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                status: action === "approve" ? "approved" : "rejected",
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.name || "Admin",
                rejectionReason: action === "reject" ? reason : undefined,
              }
            : project,
        ),
      )

      setShowReviewDialog(false)
      setReviewingProject(null)
      toast.success(`Project ${action}d successfully`)
    } catch (error) {
      toast.error(`Failed to ${action} project`)
    }
  }

  const exportProjects = () => {
    const csvContent = [
      ["Title", "Status", "Submitted By", "Supervisor", "Department", "Submitted Date", "Priority"].join(","),
      ...filteredProjects.map((project) =>
        [
          project.title,
          project.status,
          project.submittedBy.name,
          project.supervisor?.name || "",
          project.department,
          new Date(project.submittedAt).toLocaleDateString(),
          project.priority,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "projects.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success("Projects exported successfully")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Project Management</h1>
          <p className="text-[#656176] dark:text-[#DECDF5] mt-1">Review and manage project submissions</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={exportProjects} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg dark:bg-yellow-900">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Pending Review</p>
                <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
                  {projects.filter((p) => p.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Under Review</p>
                <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
                  {projects.filter((p) => p.status === "under_review").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Approved</p>
                <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
                  {projects.filter((p) => p.status === "approved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Rejected</p>
                <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
                  {projects.filter((p) => p.status === "rejected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Information Systems">Information Systems</SelectItem>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProjects.length > 0 && (
            <div className="flex items-center gap-3 mt-4 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedProjects.length} projects selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("approve")}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("reject")}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => handleSelectProject(project.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-[#534D56] dark:text-[#F8F1FF] line-clamp-1">{project.title}</p>
                      <p className="text-sm text-[#656176] dark:text-[#DECDF5] line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={project.submittedBy.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {project.submittedBy.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                          {project.submittedBy.name}
                        </p>
                        <p className="text-xs text-[#656176] dark:text-[#DECDF5]">{project.submittedBy.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.supervisor ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {project.supervisor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                            {project.supervisor.name}
                          </p>
                          <p className="text-xs text-[#656176] dark:text-[#DECDF5]">{project.supervisor.email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-[#656176] dark:text-[#DECDF5]">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-[#656176] dark:text-[#DECDF5]">{project.department}</TableCell>
                  <TableCell className="text-[#656176] dark:text-[#DECDF5]">
                    {new Date(project.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setReviewingProject(project)
                            setReviewAction("approve")
                            setShowReviewDialog(true)
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setReviewingProject(project)
                            setReviewAction("reject")
                            setShowReviewDialog(true)
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No projects found</p>
              <p className="text-[#656176] dark:text-[#DECDF5]">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Project Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{reviewAction === "approve" ? "Approve Project" : "Reject Project"}</DialogTitle>
            <DialogDescription>{reviewingProject?.title}</DialogDescription>
          </DialogHeader>

          {reviewingProject && (
            <ReviewProjectForm
              project={reviewingProject}
              action={reviewAction}
              onSubmit={(reason) => handleReviewProject(reviewingProject.id, reviewAction, reason)}
              onCancel={() => {
                setShowReviewDialog(false)
                setReviewingProject(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Review Project Form Component
function ReviewProjectForm({
  project,
  action,
  onSubmit,
  onCancel,
}: {
  project: Project
  action: "approve" | "reject"
  onSubmit: (reason?: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (action === "reject" && !reason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setLoading(true)
    await onSubmit(reason)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Project Details */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-[#534D56] dark:text-[#F8F1FF] mb-2">Project Description</h3>
          <p className="text-sm text-[#656176] dark:text-[#DECDF5] bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            {project.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-[#534D56] dark:text-[#F8F1FF] mb-1">Submitted By</h4>
            <p className="text-sm text-[#656176] dark:text-[#DECDF5]">{project.submittedBy.name}</p>
            <p className="text-xs text-[#656176] dark:text-[#DECDF5]">{project.submittedBy.email}</p>
          </div>

          <div>
            <h4 className="font-medium text-[#534D56] dark:text-[#F8F1FF] mb-1">Department</h4>
            <p className="text-sm text-[#656176] dark:text-[#DECDF5]">{project.department}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-[#534D56] dark:text-[#F8F1FF] mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {action === "reject" && (
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Rejection <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for rejecting this project..."
              rows={4}
              required
            />
          </div>
        )}

        {action === "approve" && (
          <div className="space-y-2">
            <Label htmlFor="approval-note">Additional Notes (Optional)</Label>
            <Textarea
              id="approval-note"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Any additional notes or feedback for the student..."
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className={action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {loading ? "Processing..." : action === "approve" ? "Approve Project" : "Reject Project"}
          </Button>
        </div>
      </form>
    </div>
  )
}
