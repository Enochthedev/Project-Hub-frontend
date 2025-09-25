"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  FolderOpen,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Calendar,
  User,
  Tag,
} from "lucide-react"
import { toast } from "sonner"

// Mock data for projects
const mockProjects = [
  {
    id: "1",
    title: "AI-Powered Student Performance Analytics",
    description:
      "A machine learning system to analyze and predict student performance patterns using historical academic data.",
    student: {
      name: "John Doe",
      email: "john.doe@ui.edu.ng",
      avatar: "/placeholder-user.jpg",
    },
    supervisor: {
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@ui.edu.ng",
    },
    status: "pending",
    priority: "high",
    category: "Machine Learning",
    tags: ["AI", "Analytics", "Education"],
    submittedDate: "2024-03-10",
    department: "Computer Science",
    estimatedDuration: "6 months",
    complexity: "High",
  },
  {
    id: "2",
    title: "Blockchain-Based Academic Credential Verification",
    description: "A decentralized system for verifying and storing academic credentials using blockchain technology.",
    student: {
      name: "Mike Johnson",
      email: "mike.johnson@ui.edu.ng",
      avatar: "/placeholder-user.jpg",
    },
    supervisor: {
      name: "Prof. David Brown",
      email: "david.brown@ui.edu.ng",
    },
    status: "under_review",
    priority: "medium",
    category: "Blockchain",
    tags: ["Blockchain", "Security", "Verification"],
    submittedDate: "2024-03-08",
    department: "Computer Science",
    estimatedDuration: "8 months",
    complexity: "High",
  },
  {
    id: "3",
    title: "Mobile App for Campus Navigation",
    description: "An interactive mobile application to help students and visitors navigate the university campus.",
    student: {
      name: "Emily Davis",
      email: "emily.davis@ui.edu.ng",
      avatar: "/placeholder-user.jpg",
    },
    supervisor: {
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@ui.edu.ng",
    },
    status: "approved",
    priority: "low",
    category: "Mobile Development",
    tags: ["Mobile", "Navigation", "UI/UX"],
    submittedDate: "2024-03-05",
    department: "Computer Science",
    estimatedDuration: "4 months",
    complexity: "Medium",
  },
  {
    id: "4",
    title: "IoT-Based Smart Library Management",
    description: "An Internet of Things solution for automated library book tracking and management.",
    student: {
      name: "Alex Thompson",
      email: "alex.thompson@ui.edu.ng",
      avatar: "/placeholder-user.jpg",
    },
    supervisor: {
      name: "Dr. Michael Chen",
      email: "michael.chen@ui.edu.ng",
    },
    status: "rejected",
    priority: "medium",
    category: "IoT",
    tags: ["IoT", "Automation", "Library"],
    submittedDate: "2024-03-03",
    department: "Engineering",
    estimatedDuration: "5 months",
    complexity: "Medium",
    rejectionReason: "Insufficient technical feasibility analysis",
  },
]

const statuses = ["all", "pending", "under_review", "approved", "rejected"]
const priorities = ["all", "low", "medium", "high"]
const categories = [
  "all",
  "Machine Learning",
  "Blockchain",
  "Mobile Development",
  "IoT",
  "Web Development",
  "Data Science",
]

export default function AdminProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [reviewingProject, setReviewingProject] = useState<any>(null)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null)
  const [reviewFeedback, setReviewFeedback] = useState("")

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = selectedStatus === "all" || project.status === selectedStatus
      const matchesPriority = selectedPriority === "all" || project.priority === selectedPriority
      const matchesCategory = selectedCategory === "all" || project.category === selectedCategory

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
  }, [searchTerm, selectedStatus, selectedPriority, selectedCategory])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = mockProjects.length
    const pending = mockProjects.filter((p) => p.status === "pending").length
    const approved = mockProjects.filter((p) => p.status === "approved").length
    const underReview = mockProjects.filter((p) => p.status === "under_review").length

    return { total, pending, approved, underReview }
  }, [])

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects((prev) => [...prev, projectId])
    } else {
      setSelectedProjects((prev) => prev.filter((id) => id !== projectId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(filteredProjects.map((project) => project.id))
    } else {
      setSelectedProjects([])
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedProjects.length === 0) {
      toast.error("Please select projects first")
      return
    }

    switch (action) {
      case "approve":
        toast.success(`Approved ${selectedProjects.length} projects`)
        break
      case "reject":
        toast.success(`Rejected ${selectedProjects.length} projects`)
        break
    }

    setSelectedProjects([])
  }

  const handleReviewSubmit = () => {
    if (!reviewAction || !reviewFeedback.trim()) {
      toast.error("Please provide feedback for your decision")
      return
    }

    toast.success(`Project ${reviewAction}ed successfully`)
    setReviewingProject(null)
    setReviewAction(null)
    setReviewFeedback("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "under_review":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Eye className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="outline">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Project Management</h1>
          <p className="text-[#656176] dark:text-[#DECDF5] mt-1">Review and manage project submissions from students</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Ready to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
            <p className="text-xs text-muted-foreground">Being reviewed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
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

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Bulk Actions */}
          {selectedProjects.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedProjects.length} project{selectedProjects.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("approve")}>
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("reject")}>
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid gap-4">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Select All</span>
            </div>

            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={(checked) => handleSelectProject(project.id, checked as boolean)}
                    />

                    <div className="flex-1 space-y-4">
                      {/* Project Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <p className="text-muted-foreground text-sm">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(project.status)}
                          {getPriorityBadge(project.priority)}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{project.student.name}</p>
                            <p className="text-muted-foreground">{project.student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Submitted</p>
                            <p className="text-muted-foreground">
                              {new Date(project.submittedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Category</p>
                            <p className="text-muted-foreground">{project.category}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Duration</p>
                            <p className="text-muted-foreground">{project.estimatedDuration}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Rejection Reason */}
                      {project.status === "rejected" && project.rejectionReason && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">Rejection Reason</p>
                            <p className="text-sm text-red-700 dark:text-red-300">{project.rejectionReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline" onClick={() => setReviewingProject(project)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>

                        {project.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 bg-transparent"
                              onClick={() => {
                                setReviewingProject(project)
                                setReviewAction("approve")
                              }}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => {
                                setReviewingProject(project)
                                setReviewAction("reject")
                              }}
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog
        open={!!reviewingProject}
        onOpenChange={() => {
          setReviewingProject(null)
          setReviewAction(null)
          setReviewFeedback("")
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction ? `${reviewAction === "approve" ? "Approve" : "Reject"} Project` : "Review Project"}
            </DialogTitle>
            <DialogDescription>{reviewingProject?.title}</DialogDescription>
          </DialogHeader>

          {reviewingProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Student</Label>
                  <p>{reviewingProject.student.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Department</Label>
                  <p>{reviewingProject.department}</p>
                </div>
                <div>
                  <Label className="font-medium">Category</Label>
                  <p>{reviewingProject.category}</p>
                </div>
                <div>
                  <Label className="font-medium">Complexity</Label>
                  <p>{reviewingProject.complexity}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{reviewingProject.description}</p>
              </div>

              {reviewAction && (
                <div className="space-y-2">
                  <Label htmlFor="feedback">
                    {reviewAction === "approve" ? "Approval Comments" : "Rejection Reason"} *
                  </Label>
                  <Textarea
                    id="feedback"
                    placeholder={
                      reviewAction === "approve"
                        ? "Provide feedback and any recommendations..."
                        : "Explain why this project is being rejected..."
                    }
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewingProject(null)
                setReviewAction(null)
                setReviewFeedback("")
              }}
            >
              Cancel
            </Button>

            {!reviewAction ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700 bg-transparent"
                  onClick={() => setReviewAction("approve")}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 bg-transparent"
                  onClick={() => setReviewAction("reject")}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            ) : (
              <Button onClick={handleReviewSubmit}>
                {reviewAction === "approve" ? "Approve Project" : "Reject Project"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
