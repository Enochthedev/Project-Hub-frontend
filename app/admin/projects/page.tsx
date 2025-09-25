"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Search,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  Download,
  FolderOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  reviewNotes?: string
  category: string
  tags: string[]
  priority: "low" | "medium" | "high"
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI-Powered Student Performance Analytics",
    description:
      "A machine learning system to analyze and predict student performance patterns using historical data and real-time metrics.",
    status: "pending",
    submittedBy: {
      id: "1",
      name: "John Doe",
      email: "john.doe@university.edu",
    },
    supervisor: {
      id: "2",
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@university.edu",
    },
    submittedAt: "2024-01-20",
    category: "Machine Learning",
    tags: ["AI", "Analytics", "Education"],
    priority: "high",
  },
  {
    id: "2",
    title: "Blockchain-Based Academic Credential Verification",
    description: "A decentralized system for verifying and managing academic credentials using blockchain technology.",
    status: "under_review",
    submittedBy: {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@university.edu",
    },
    supervisor: {
      id: "4",
      name: "Prof. Emily Davis",
      email: "emily.davis@university.edu",
    },
    submittedAt: "2024-01-18",
    category: "Blockchain",
    tags: ["Blockchain", "Security", "Credentials"],
    priority: "medium",
  },
  {
    id: "3",
    title: "Smart Campus IoT Management System",
    description: "An integrated IoT solution for managing campus resources, energy consumption, and security systems.",
    status: "approved",
    submittedBy: {
      id: "5",
      name: "Alice Brown",
      email: "alice.brown@university.edu",
    },
    supervisor: {
      id: "2",
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@university.edu",
    },
    submittedAt: "2024-01-15",
    reviewedAt: "2024-01-17",
    reviewedBy: "Admin User",
    reviewNotes: "Excellent proposal with clear implementation plan and strong technical foundation.",
    category: "IoT",
    tags: ["IoT", "Smart Campus", "Automation"],
    priority: "high",
  },
  {
    id: "4",
    title: "Virtual Reality Learning Environment",
    description: "A VR platform for immersive learning experiences in various academic subjects.",
    status: "rejected",
    submittedBy: {
      id: "6",
      name: "Bob Wilson",
      email: "bob.wilson@university.edu",
    },
    submittedAt: "2024-01-12",
    reviewedAt: "2024-01-14",
    reviewedBy: "Admin User",
    reviewNotes:
      "Project scope too broad for current timeline. Please refine and resubmit with more specific objectives.",
    category: "VR/AR",
    tags: ["VR", "Education", "Immersive"],
    priority: "low",
  },
]

export default function AdminProjectsPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(mockProjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null)

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== "admin") {
      toast.error("Access denied. Admin privileges required.")
      return
    }
  }, [user])

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((project) => project.priority === priorityFilter)
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, statusFilter, priorityFilter])

  const handleReviewProject = (action: "approve" | "reject") => {
    if (!reviewingProject) return

    const updatedProject: Project = {
      ...reviewingProject,
      status: action === "approve" ? "approved" : "rejected",
      reviewedAt: new Date().toISOString().split("T")[0],
      reviewedBy: user?.name || "Admin",
      reviewNotes: reviewNotes,
    }

    setProjects((prev) => prev.map((p) => (p.id === reviewingProject.id ? updatedProject : p)))
    setReviewingProject(null)
    setReviewNotes("")
    setReviewAction(null)
    toast.success(`Project ${action}d successfully`)
  }

  const handleBulkAction = (action: string) => {
    if (selectedProjects.length === 0) {
      toast.error("Please select projects first")
      return
    }

    const now = new Date().toISOString().split("T")[0]

    switch (action) {
      case "approve":
        setProjects((prev) =>
          prev.map((p) =>
            selectedProjects.includes(p.id)
              ? {
                  ...p,
                  status: "approved" as const,
                  reviewedAt: now,
                  reviewedBy: user?.name || "Admin",
                }
              : p,
          ),
        )
        toast.success(`${selectedProjects.length} projects approved`)
        break
      case "reject":
        setProjects((prev) =>
          prev.map((p) =>
            selectedProjects.includes(p.id)
              ? {
                  ...p,
                  status: "rejected" as const,
                  reviewedAt: now,
                  reviewedBy: user?.name || "Admin",
                }
              : p,
          ),
        )
        toast.success(`${selectedProjects.length} projects rejected`)
        break
      case "review":
        setProjects((prev) =>
          prev.map((p) => (selectedProjects.includes(p.id) ? { ...p, status: "under_review" as const } : p)),
        )
        toast.success(`${selectedProjects.length} projects marked for review`)
        break
    }
    setSelectedProjects([])
  }

  const handleExportProjects = () => {
    const csvContent = [
      ["Title", "Status", "Submitted By", "Supervisor", "Category", "Priority", "Submitted Date", "Reviewed Date"],
      ...filteredProjects.map((project) => [
        project.title,
        project.status,
        project.submittedBy.name,
        project.supervisor?.name || "Not Assigned",
        project.category,
        project.priority,
        project.submittedAt,
        project.reviewedAt || "Not Reviewed",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "projects.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Projects exported successfully")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "under_review":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "under_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "pending":
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

  if (user?.role !== "admin") {
    return (
      <div className="container py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Project Management</h1>
          <p className="text-[#656176] dark:text-[#DECDF5]">Review and manage project submissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportProjects} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter((p) => p.status === "pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter((p) => p.status === "approved").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter((p) => p.status === "under_review").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedProjects.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction("approve")} variant="outline">
                  <Check className="h-4 w-4 mr-1" />
                  Approve ({selectedProjects.length})
                </Button>
                <Button size="sm" onClick={() => handleBulkAction("reject")} variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button size="sm" onClick={() => handleBulkAction("review")} variant="outline">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProjects(filteredProjects.map((p) => p.id))
                        } else {
                          setSelectedProjects([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Category</TableHead>
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
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProjects((prev) => [...prev, project.id])
                          } else {
                            setSelectedProjects((prev) => prev.filter((id) => id !== project.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{project.description}</div>
                        <div className="flex gap-1 mt-1">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                      </div>
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
                          <div className="text-sm font-medium">{project.submittedBy.name}</div>
                          <div className="text-xs text-muted-foreground">{project.submittedBy.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{project.category}</TableCell>
                    <TableCell>{project.submittedAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setReviewingProject(project)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setReviewingProject(project)
                              setReviewAction("approve")
                            }}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setReviewingProject(project)
                              setReviewAction("reject")
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Project Dialog */}
      {reviewingProject && (
        <Dialog
          open={!!reviewingProject}
          onOpenChange={() => {
            setReviewingProject(null)
            setReviewNotes("")
            setReviewAction(null)
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Project</DialogTitle>
              <DialogDescription>Review and provide feedback for this project submission</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Project Title</Label>
                <p className="text-sm text-muted-foreground mt-1">{reviewingProject.title}</p>
              </div>
              <div>
                <Label className="text-base font-semibold">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{reviewingProject.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-semibold">Submitted By</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reviewingProject.submittedBy.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {reviewingProject.submittedBy.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{reviewingProject.submittedBy.name}</div>
                      <div className="text-xs text-muted-foreground">{reviewingProject.submittedBy.email}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-base font-semibold">Category</Label>
                  <p className="text-sm text-muted-foreground mt-1">{reviewingProject.category}</p>
                </div>
              </div>
              <div>
                <Label className="text-base font-semibold">Tags</Label>
                <div className="flex gap-1 mt-1">
                  {reviewingProject.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="review-notes">Review Notes</Label>
                <Textarea
                  id="review-notes"
                  placeholder="Add your review comments..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewingProject(null)
                  setReviewNotes("")
                  setReviewAction(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleReviewProject("reject")}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => handleReviewProject("approve")} className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
