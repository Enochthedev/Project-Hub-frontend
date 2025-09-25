"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Target,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Calendar,
  BookmarkPlus,
  Bot,
  ArrowRight,
  Clock,
  CheckCircle,
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import Link from "next/link"

interface DashboardData {
  upcomingMilestones: Array<{
    id: string
    title: string
    dueDate: string
    status: "pending" | "in-progress" | "completed"
    priority: "low" | "medium" | "high"
  }>
  recommendedProjects: Array<{
    id: string
    title: string
    description: string
    matchScore: number
    category: string
  }>
  recentConversations: Array<{
    id: string
    title: string
    lastMessage: string
    timestamp: string
  }>
  progressOverview: {
    completedMilestones: number
    totalMilestones: number
    savedProjects: number
    aiInteractions: number
  }
}

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "student") {
      router.push("/")
      return
    }

    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        upcomingMilestones: [
          {
            id: "1",
            title: "Project Proposal Submission",
            dueDate: "2024-02-15",
            status: "pending",
            priority: "high",
          },
          {
            id: "2",
            title: "Literature Review Draft",
            dueDate: "2024-02-20",
            status: "in-progress",
            priority: "medium",
          },
          {
            id: "3",
            title: "Supervisor Meeting",
            dueDate: "2024-02-12",
            status: "pending",
            priority: "medium",
          },
        ],
        recommendedProjects: [
          {
            id: "1",
            title: "AI-Powered Healthcare Diagnosis System",
            description: "Develop a machine learning system for medical diagnosis",
            matchScore: 95,
            category: "AI/ML",
          },
          {
            id: "2",
            title: "Sustainable Energy Management Platform",
            description: "IoT-based system for monitoring and optimizing energy usage",
            matchScore: 88,
            category: "IoT",
          },
          {
            id: "3",
            title: "Blockchain-Based Supply Chain Tracker",
            description: "Transparent supply chain management using blockchain",
            matchScore: 82,
            category: "Blockchain",
          },
        ],
        recentConversations: [
          {
            id: "1",
            title: "Project Ideas Discussion",
            lastMessage: "Based on your interests in AI and healthcare...",
            timestamp: "2 hours ago",
          },
          {
            id: "2",
            title: "Research Methodology Help",
            lastMessage: "For your literature review, I recommend...",
            timestamp: "1 day ago",
          },
          {
            id: "3",
            title: "Technical Implementation",
            lastMessage: "Here are some Python libraries you might find useful...",
            timestamp: "3 days ago",
          },
        ],
        progressOverview: {
          completedMilestones: 3,
          totalMilestones: 8,
          savedProjects: 12,
          aiInteractions: 47,
        },
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

  const progressPercentage =
    (dashboardData!.progressOverview.completedMilestones / dashboardData!.progressOverview.totalMilestones) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your FYP journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
              <Progress value={progressPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {dashboardData!.progressOverview.completedMilestones} of{" "}
                {dashboardData!.progressOverview.totalMilestones} milestones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Projects</CardTitle>
              <BookmarkPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData!.progressOverview.savedProjects}</div>
              <p className="text-xs text-muted-foreground">Projects bookmarked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData!.progressOverview.aiInteractions}</div>
              <p className="text-xs text-muted-foreground">Questions asked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData!.recommendedProjects.length}</div>
              <p className="text-xs text-muted-foreground">New suggestions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Milestones
              </CardTitle>
              <CardDescription>Stay on track with your project deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData!.upcomingMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        milestone.priority === "high"
                          ? "bg-red-500"
                          : milestone.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={milestone.status === "completed" ? "default" : "secondary"}>
                    {milestone.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {milestone.status.replace("-", " ")}
                  </Badge>
                </div>
              ))}
              <Link href="/milestones">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Milestones
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recommended Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recommended Projects
              </CardTitle>
              <CardDescription>AI-curated projects based on your interests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData!.recommendedProjects.map((project) => (
                <div key={project.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{project.title}</h4>
                    <Badge variant="secondary">{project.matchScore}% match</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  <Badge variant="outline">{project.category}</Badge>
                </div>
              ))}
              <Link href="/recommendations">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Recommendations
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent AI Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent AI Conversations
            </CardTitle>
            <CardDescription>Continue your discussions with the AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {dashboardData!.recentConversations.map((conversation) => (
                <div key={conversation.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">{conversation.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{conversation.lastMessage}</p>
                  <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
                </div>
              ))}
            </div>
            <Link href="/ai-assistant">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Open AI Assistant
                <Bot className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to help you stay productive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/projects">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <TrendingUp className="h-6 w-6" />
                  <span>Discover Projects</span>
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <Bot className="h-6 w-6" />
                  <span>Ask AI</span>
                </Button>
              </Link>
              <Link href="/milestones">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <Target className="h-6 w-6" />
                  <span>Track Progress</span>
                </Button>
              </Link>
              <Link href="/bookmarks">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                  <BookmarkPlus className="h-6 w-6" />
                  <span>View Bookmarks</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
