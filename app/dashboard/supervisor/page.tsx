"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  AlertTriangle,
  FolderOpen,
  MessageSquare,
  BarChart3,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Bot,
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import Link from "next/link"

interface SupervisorDashboardData {
  studentProgress: Array<{
    id: string
    name: string
    avatar: string
    project: string
    progress: number
    status: "on-track" | "at-risk" | "behind"
    lastActivity: string
  }>
  atRiskAlerts: Array<{
    id: string
    studentName: string
    issue: string
    severity: "low" | "medium" | "high"
    daysOverdue: number
  }>
  projectSummary: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    pendingApproval: number
  }
  aiEscalations: Array<{
    id: string
    studentName: string
    question: string
    timestamp: string
    priority: "low" | "medium" | "high"
  }>
}

export default function SupervisorDashboard() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<SupervisorDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "supervisor") {
      router.push("/")
      return
    }

    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        studentProgress: [
          {
            id: "1",
            name: "Alice Johnson",
            avatar: "/placeholder-user.jpg",
            project: "AI Healthcare Diagnosis",
            progress: 75,
            status: "on-track",
            lastActivity: "2 hours ago",
          },
          {
            id: "2",
            name: "Bob Smith",
            avatar: "/placeholder-user.jpg",
            project: "Blockchain Supply Chain",
            progress: 45,
            status: "at-risk",
            lastActivity: "5 days ago",
          },
          {
            id: "3",
            name: "Carol Davis",
            avatar: "/placeholder-user.jpg",
            project: "IoT Energy Management",
            progress: 90,
            status: "on-track",
            lastActivity: "1 day ago",
          },
          {
            id: "4",
            name: "David Wilson",
            avatar: "/placeholder-user.jpg",
            project: "Mobile Learning App",
            progress: 30,
            status: "behind",
            lastActivity: "1 week ago",
          },
        ],
        atRiskAlerts: [
          {
            id: "1",
            studentName: "Bob Smith",
            issue: "No milestone updates for 5 days",
            severity: "high",
            daysOverdue: 5,
          },
          {
            id: "2",
            studentName: "David Wilson",
            issue: "Literature review overdue",
            severity: "medium",
            daysOverdue: 3,
          },
        ],
        projectSummary: {
          totalProjects: 12,
          activeProjects: 8,
          completedProjects: 3,
          pendingApproval: 1,
        },
        aiEscalations: [
          {
            id: "1",
            studentName: "Alice Johnson",
            question: "Need help with neural network architecture",
            timestamp: "30 minutes ago",
            priority: "medium",
          },
          {
            id: "2",
            studentName: "Carol Davis",
            question: "IoT sensor integration issues",
            timestamp: "2 hours ago",
            priority: "high",
          },
        ],
      })
      setIsLoading(false)
    }, 1000)
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">Monitor your students' progress and manage projects</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData!.projectSummary.totalProjects}</div>
              <p className="text-xs text-muted-foreground">All supervised projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData!.projectSummary.activeProjects}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardData!.atRiskAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Escalations</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData!.aiEscalations.length}</div>
              <p className="text-xs text-muted-foreground">Pending responses</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Progress
              </CardTitle>
              <CardDescription>Track your students' project progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData!.studentProgress.map((student) => (
                <div key={student.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">{student.name}</p>
                      <Badge
                        variant={
                          student.status === "on-track"
                            ? "default"
                            : student.status === "at-risk"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {student.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">{student.project}</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={student.progress} className="flex-1" />
                      <span className="text-sm font-medium">{student.progress}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Last activity: {student.lastActivity}</p>
                  </div>
                </div>
              ))}
              <Link href="/supervisor/students">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Students
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* At-Risk Student Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                At-Risk Alerts
              </CardTitle>
              <CardDescription>Students who need immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData!.atRiskAlerts.map((alert) => (
                <div key={alert.id} className="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-red-800 dark:text-red-200">{alert.studentName}</h4>
                    <Badge variant="destructive">{alert.severity}</Badge>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">{alert.issue}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">{alert.daysOverdue} days overdue</p>
                </div>
              ))}
              {dashboardData!.atRiskAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>All students are on track!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Escalations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Escalations
            </CardTitle>
            <CardDescription>Questions from students that need your expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData!.aiEscalations.map((escalation) => (
                <div key={escalation.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{escalation.studentName}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={escalation.priority === "high" ? "destructive" : "secondary"}>
                        {escalation.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{escalation.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{escalation.question}</p>
                  <Button size="sm" className="mt-2">
                    Respond
                  </Button>
                </div>
              ))}
              {dashboardData!.aiEscalations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-2" />
                  <p>No pending escalations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common supervisor tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/supervisor/projects">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <FolderOpen className="h-6 w-6" />
                  <span>Manage Projects</span>
                </Button>
              </Link>
              <Link href="/supervisor/students">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <Users className="h-6 w-6" />
                  <span>View Students</span>
                </Button>
              </Link>
              <Link href="/supervisor/analytics">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <BarChart3 className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
              </Link>
              <Link href="/supervisor/ai-monitoring">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <Bot className="h-6 w-6" />
                  <span>AI Monitoring</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
