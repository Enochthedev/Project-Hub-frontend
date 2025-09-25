"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FolderOpen, Search, Check, X, Eye, Clock, AlertTriangle, Download } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"

interface Project {
  id: string
  title: string
  description: string
  supervisor: string
  supervisorEmail: string
  status: "pending" | "approved" | "rejected" | "under_review"
  submittedDate: string
  reviewedDate?: string
  tags: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: string
  maxStudents: number
  currentStudents: number
}

export default function AdminProjectsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/dashboard")
      return
    }
    loadProjects()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    filterProjects()
  }, [projects, searchQuery, statusFilter])

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockProjects: Project[] = [
        {
          id: "1",
          title: "AI-Powered Student Performance Analytics",
          description:
            "Develop a machine learning system to analyze student performance patterns and provide predictive insights for academic success.",
          supervisor: "Dr. Sarah Johnson",
          supervisorEmail: "sarah.johnson@university.edu",
          status: "pending",
          submittedDate: "2024-01-10T09:00:00Z",
          tags: ["Machine Learning", "Analytics", "Education"],
          difficulty: "advanced",
          duration: "6 months",
          maxStudents: 2,
          currentStudents: 0,
        },
        {
          id: "2",
          title: "Sustainable Campus Energy Management System",
          description:
            "Create a web application to monitor and optimize energy consumption across campus buildings using IoT sensors.",
          supervisor: "Prof. Michael Chen",
          supervisorEmail: "michael.chen@university.edu",
          status: "under_review",
          submittedDate: "2024-01-08T14:30:00Z",
          tags: ["IoT", "Sustainability", "Web Development"],
          difficulty: "intermediate",
          duration: "4 months",
          maxStudents: 3,
          currentStudents: 0,
        },
        {
          id: "3",
          title: "Virtual Reality Campus Tour Application",
          description:
            "Develop an immersive VR application that allows prospective students to take virtual tours of the campus.",
          supervisor: "Dr. Emily Rodriguez",
          supervisorEmail: "emily.rodriguez@university.edu",
          status: "approved",
          submittedDate: "2024-01-05T11:15:00Z",
          reviewedDate: "2024-01-12T16:20:00Z",
          tags: ["VR", "Unity", "3D Modeling"],
          difficulty: "advanced",
          duration: "5 months",
          maxStudents: 2,
          currentStudents: 1,
        },
        {
          id: "4",
          title: "Blockchain-Based Academic Credential System",
          description:
            "Build a secure system for issuing and verifying academic credentials using blockchain technology.",
          supervisor: "Dr. Robert Kim",
          supervisorEmail: "robert.kim@university.edu",
          status: "rejected",
          submittedDate: "2024-01-03T08:45:00Z",
          reviewedDate: "2024-01-11T10:30:00Z",
          tags: ["Blockchain", "Security", "Credentials"],
          difficulty: "advanced",
          duration: "8 months",
          maxStudents: 1,
          currentStudents: 0,
        },
      ]
      setProjects(mockProjects)
    } catch (error) {
      toast.error("Failed to load projects")
    } finally {
      setIsLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }

    setFilteredProjects(filtered)
  }

  const handleApproveProject = async (projectId: string) => {
    try {
      setProjects(
        projects.map((project) =>
          project.id === projectId
            ? { ...project, status: "approved" as const, reviewedDate: new Date().toISOString() }
            : project,
        ),
      )
      toast.success("Project approved successfully")
    } catch (error) {
      toast.error("Failed to approve project")
    }
  }

  const handleRejectProject = async (projectId: string, reason: string) => {
    try {
      setProjects(
        projects.map((project) =>
          project.id === projectId
            ? { ...project, status: "rejected" as const, reviewedDate: new Date().toISOString() }
            : project,
        ),
      )
      setReviewingProject(null)
      setRejectionReason("")
      toast.success("Project rejected")
    } catch (error) {
      toast.error("Failed to reject project")
    }
  }

  const handleBulkApprove = async () => {
    try {
      setProjects(
        projects.map((project) =>
          selectedProjects.includes(project.id)
            ? { ...project, status: "approved" as const, reviewedDate: new Date().toISOString() }
            : project,
        ),
      )
      setSelectedProjects([])
      toast.success(`Approved ${selectedProjects.length} projects`)
    } catch (error) {
      toast.error("Failed to approve projects")
    }
  }

  const handleBulkReject = async () => {
    try {
      setProjects(
        projects.map((project) =>
          selectedProjects.includes(project.id)
            ? { ...project, status: "rejected" as const, reviewedDate: new Date().toISOString() }
            : project,
        ),
      )
      setSelectedProjects([])
      toast.success(`Rejected ${selectedProjects.length} projects`)
    } catch (error) {
      toast.error("Failed to reject projects")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      under_review: "bg-blue-100 text-blue-800",
    }
    const labels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      under_review: "Under Review",
    }
    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    }
    return <Badge className={variants[difficulty as keyof typeof variants]}>{difficulty}</Badge>
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <div>Access denied</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="h-8 w-8" />
              Project Management
            </h1>
            <p className="text-muted-foreground">Review and approve project submissions</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{projects.filter((p) => p.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{projects.filter((p) => p.status === "approved").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <X className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{projects.filter((p) => p.status === "rejected").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold">{projects.filter((p) => p.status === "under_review").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedProjects.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{selectedProjects.length} project(s) selected</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-2" />
                    Approve All
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkReject}>
                    <X className="h-4 w-4 mr-2" />
                    Reject All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProjects.length === filteredProjects.length}
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
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading projects...
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProjects.includes(project.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProjects([...selectedProjects, project.id])
                            } else {
                              setSelectedProjects(selectedProjects.filter((id) => id !== project.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">{project.description}</div>
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
                        <div>
                          <div className="font-medium">{project.supervisor}</div>
                          <div className="text-sm text-muted-foreground">{project.supervisorEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>{getDifficultyBadge(project.difficulty)}</TableCell>
                      <TableCell>{new Date(project.submittedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {project.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveProject(project.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => setReviewingProject(project)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Rejection Dialog */}
        <Dialog open={!!reviewingProject} onOpenChange={() => setReviewingProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Project</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this project. This will be sent to the supervisor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{reviewingProject?.title}</h4>
                <p className="text-sm text-muted-foreground">by {reviewingProject?.supervisor}</p>
              </div>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReviewingProject(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => reviewingProject && handleRejectProject(reviewingProject.id, rejectionReason)}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
