"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, MessageCircle, TrendingUp, AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useSupervisorStore } from "@/lib/stores/supervisor-store"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  enrollmentDate: string
  currentProject?: {
    id: string
    title: string
    status: "active" | "completed" | "on-hold"
    progress: number
    startDate: string
    expectedCompletion: string
  }
  milestones: {
    total: number
    completed: number
    overdue: number
    upcoming: number
  }
  performance: {
    overallScore: number
    communicationRating: number
    technicalRating: number
    timeManagementRating: number
  }
  lastActivity: string
  riskLevel: "low" | "medium" | "high"
  aiInteractions: {
    totalQuestions: number
    lastInteraction: string
    commonTopics: string[]
  }
}

export default function SupervisorStudentsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { studentProgress, fetchStudentProgress } = useSupervisorStore()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user && user.role !== "supervisor" && user.role !== "admin") {
      router.push("/")
      return
    }

    loadStudents()
  }, [isAuthenticated, user, router])

  const loadStudents = async () => {
    try {
      setIsLoading(true)

      // Mock data for demonstration
      const mockStudents: Student[] = [
        {
          id: "student-1",
          firstName: "Alice",
          lastName: "Johnson",
          email: "alice.johnson@university.edu",
          phone: "+1-555-0123",
          avatar: "/placeholder-user.jpg",
          enrollmentDate: "2024-01-15",
          currentProject: {
            id: "proj-1",
            title: "AI-Powered Chatbot for Customer Service",
            status: "active",
            progress: 75,
            startDate: "2024-02-01",
            expectedCompletion: "2024-05-01",
          },
          milestones: {
            total: 8,
            completed: 6,
            overdue: 1,
            upcoming: 1,
          },
          performance: {
            overallScore: 85,
            communicationRating: 90,
            technicalRating: 80,
            timeManagementRating: 85,
          },
          lastActivity: "2024-01-20T10:30:00Z",
          riskLevel: "low",
          aiInteractions: {
            totalQuestions: 45,
            lastInteraction: "2024-01-20T09:15:00Z",
            commonTopics: ["React", "API Integration", "Testing"],
          },
        },
        {
          id: "student-2",
          firstName: "Bob",
          lastName: "Smith",
          email: "bob.smith@university.edu",
          enrollmentDate: "2024-01-10",
          currentProject: {
            id: "proj-2",
            title: "Mobile App for Food Delivery",
            status: "active",
            progress: 45,
            startDate: "2024-01-20",
            expectedCompletion: "2024-06-01",
          },
          milestones: {
            total: 10,
            completed: 3,
            overdue: 2,
            upcoming: 5,
          },
          performance: {
            overallScore: 65,
            communicationRating: 60,
            technicalRating: 70,
            timeManagementRating: 65,
          },
          lastActivity: "2024-01-18T14:20:00Z",
          riskLevel: "high",
          aiInteractions: {
            totalQuestions: 78,
            lastInteraction: "2024-01-19T16:45:00Z",
            commonTopics: ["React Native", "State Management", "Debugging"],
          },
        },
        {
          id: "student-3",
          firstName: "Carol",
          lastName: "Davis",
          email: "carol.davis@university.edu",
          enrollmentDate: "2024-01-05",
          currentProject: {
            id: "proj-3",
            title: "Blockchain Voting System",
            status: "completed",
            progress: 100,
            startDate: "2024-01-05",
            expectedCompletion: "2024-04-01",
          },
          milestones: {
            total: 12,
            completed: 12,
            overdue: 0,
            upcoming: 0,
          },
          performance: {
            overallScore: 95,
            communicationRating: 95,
            technicalRating: 95,
            timeManagementRating: 95,
          },
          lastActivity: "2024-01-19T11:00:00Z",
          riskLevel: "low",
          aiInteractions: {
            totalQuestions: 32,
            lastInteraction: "2024-01-15T13:30:00Z",
            commonTopics: ["Blockchain", "Smart Contracts", "Security"],
          },
        },
      ]

      setStudents(mockStudents)
    } catch (error) {
      console.error("Failed to load students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.currentProject?.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRiskLevel = selectedRiskLevel === "all" || student.riskLevel === selectedRiskLevel
    const matchesStatus = selectedStatus === "all" || student.currentProject?.status === selectedStatus

    return matchesSearch && matchesRiskLevel && matchesStatus
  })

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-50 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-50 text-blue-700"
      case "completed":
        return "bg-green-50 text-green-700"
      case "on-hold":
        return "bg-yellow-50 text-yellow-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>
  }

  if (user.role !== "supervisor" && user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You need supervisor or admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8" />
            Student Management
          </h1>
          <p className="text-muted-foreground">Monitor and manage your students' progress and performance</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {students.filter((s) => s.currentProject?.status === "active").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {students.filter((s) => s.riskLevel === "high").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {students.filter((s) => s.currentProject?.status === "completed").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Students List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {student.firstName} {student.lastName}
                          </CardTitle>
                          <CardDescription>{student.email}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getRiskLevelColor(student.riskLevel)}>{student.riskLevel} risk</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Project */}
                    {student.currentProject && (
                      <div>
                        <h4 className="font-medium mb-2">Current Project</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{student.currentProject.title}</span>
                            <Badge className={getStatusColor(student.currentProject.status)}>
                              {student.currentProject.status}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{student.currentProject.progress}%</span>
                            </div>
                            <Progress value={student.currentProject.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Milestones Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Milestones</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{student.milestones.completed} completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{student.milestones.upcoming} upcoming</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span>{student.milestones.overdue} overdue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-600" />
                          <span>{student.milestones.total} total</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Score */}
                    <div>
                      <h4 className="font-medium mb-2">Overall Performance</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={student.performance.overallScore} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{student.performance.overallScore}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Last Activity */}
                    <div className="text-xs text-muted-foreground">
                      Last active: {new Date(student.lastActivity).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No students found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance comparison will be implemented here */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Detailed performance metrics and comparisons</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Performance analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            {/* AI insights will be implemented here */}
            <Card>
              <CardHeader>
                <CardTitle>AI Interaction Insights</CardTitle>
                <CardDescription>Analysis of student AI assistant usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">AI insights dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
