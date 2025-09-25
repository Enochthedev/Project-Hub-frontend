"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Shield, FolderOpen, Bot, CheckCircle, Clock, ArrowRight, Activity, Server } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import Link from "next/link"

interface AdminDashboardData {
  systemHealth: {
    status: "healthy" | "warning" | "critical"
    uptime: string
    responseTime: number
    activeUsers: number
  }
  userSummary: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    pendingVerification: number
  }
  projectSummary: {
    totalProjects: number
    pendingApproval: number
    activeProjects: number
    completedProjects: number
  }
  aiSystemStatus: {
    status: "operational" | "degraded" | "down"
    totalQueries: number
    averageResponseTime: number
    escalations: number
  }
  pendingApprovals: Array<{
    id: string
    type: "project" | "user" | "supervisor"
    title: string
    submittedBy: string
    submittedAt: string
    priority: "low" | "medium" | "high"
  }>
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "admin") {
      router.push("/")
      return
    }

    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        systemHealth: {
          status: "healthy",
          uptime: "99.9%",
          responseTime: 245,
          activeUsers: 1247,
        },
        userSummary: {
          totalUsers: 3456,
          activeUsers: 1247,
          newUsers: 23,
          pendingVerification: 12,
        },
        projectSummary: {
          totalProjects: 892,
          pendingApproval: 15,
          activeProjects: 234,
          completedProjects: 643,
        },
        aiSystemStatus: {
          status: "operational",
          totalQueries: 15678,
          averageResponseTime: 1.2,
          escalations: 8,
        },
        pendingApprovals: [
          {
            id: "1",
            type: "project",
            title: "AI-Powered Medical Diagnosis System",
            submittedBy: "Dr. Sarah Johnson",
            submittedAt: "2 hours ago",
            priority: "high",
          },
          {
            id: "2",
            type: "user",
            title: "New Supervisor Registration",
            submittedBy: "Prof. Michael Chen",
            submittedAt: "5 hours ago",
            priority: "medium",
          },
          {
            id: "3",
            type: "project",
            title: "Blockchain Supply Chain Tracker",
            submittedBy: "Alice Smith",
            submittedAt: "1 day ago",
            priority: "medium",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return "text-green-600"
      case "warning":
      case "degraded":
        return "text-yellow-600"
      case "critical":
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return "default"
      case "warning":
      case "degraded":
        return "secondary"
      case "critical":
      case "down":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and platform management</p>
        </div>

        {/* System Health Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadge(dashboardData!.systemHealth.status)}>
                  {dashboardData!.systemHealth.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Uptime: {dashboardData!.systemHealth.uptime}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData!.systemHealth.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData!.systemHealth.responseTime}ms</div>
              <p className="text-xs text-muted-foreground">Average response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboardData!.pendingApprovals.length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Users</span>
                <span className="font-bold">{dashboardData!.userSummary.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users</span>
                <span className="font-bold text-green-600">
                  {dashboardData!.userSummary.activeUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">New This Week</span>
                <span className="font-bold text-blue-600">{dashboardData!.userSummary.newUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Verification</span>
                <span className="font-bold text-orange-600">{dashboardData!.userSummary.pendingVerification}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Project Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Projects</span>
                <span className="font-bold">{dashboardData!.projectSummary.totalProjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Projects</span>
                <span className="font-bold text-green-600">{dashboardData!.projectSummary.activeProjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <span className="font-bold text-blue-600">{dashboardData!.projectSummary.completedProjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Approval</span>
                <span className="font-bold text-orange-600">{dashboardData!.projectSummary.pendingApproval}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status</span>
                <Badge variant={getStatusBadge(dashboardData!.aiSystemStatus.status)}>
                  {dashboardData!.aiSystemStatus.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Queries</span>
                <span className="font-bold">{dashboardData!.aiSystemStatus.totalQueries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Response Time</span>
                <span className="font-bold">{dashboardData!.aiSystemStatus.averageResponseTime}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Escalations</span>
                <span className="font-bold text-orange-600">{dashboardData!.aiSystemStatus.escalations}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring administrative approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData!.pendingApprovals.map((approval) => (
                <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        approval.priority === "high"
                          ? "bg-red-500"
                          : approval.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{approval.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)} by {approval.submittedBy}
                      </p>
                      <p className="text-xs text-muted-foreground">{approval.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              ))}
              {dashboardData!.pendingApprovals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No pending approvals</p>
                </div>
              )}
            </div>
            <Link href="/admin/approvals">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Approvals
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Button>
              </Link>
              <Link href="/admin/projects">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <FolderOpen className="h-6 w-6" />
                  <span>Review Projects</span>
                </Button>
              </Link>
              <Link href="/admin/ai">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <Bot className="h-6 w-6" />
                  <span>AI Management</span>
                </Button>
              </Link>
              <Link href="/admin/system">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <Shield className="h-6 w-6" />
                  <span>System Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
