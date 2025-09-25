"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { History, Search, TrendingUp, ThumbsUp, ThumbsDown, Calendar } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { cn } from "@/lib/utils"

interface HistoricalRecommendation {
  id: string
  projectId: string
  title: string
  abstract: string
  specialization: string
  difficultyLevel: string
  similarityScore: number
  reasoning: string
  generatedAt: string
  rating?: "positive" | "negative"
  wasViewed: boolean
  wasBookmarked: boolean
  feedback?: string
}

interface RecommendationTrend {
  period: string
  totalRecommendations: number
  averageScore: number
  positiveRatings: number
  negativeRatings: number
  viewRate: number
  bookmarkRate: number
}

export default function RecommendationHistoryPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<HistoricalRecommendation[]>([])
  const [trends, setTrends] = useState<RecommendationTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")
  const [selectedRating, setSelectedRating] = useState<string>("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    loadRecommendationHistory()
  }, [isAuthenticated, router])

  const loadRecommendationHistory = async () => {
    try {
      setIsLoading(true)

      // Mock data for demonstration
      const mockRecommendations: HistoricalRecommendation[] = [
        {
          id: "rec-1",
          projectId: "proj-1",
          title: "AI-Powered Chatbot for Customer Service",
          abstract:
            "Develop an intelligent chatbot using natural language processing to handle customer inquiries automatically.",
          specialization: "AI",
          difficultyLevel: "intermediate",
          similarityScore: 0.92,
          reasoning: "Matches your AI interests and Python skills perfectly",
          generatedAt: "2024-01-15T10:30:00Z",
          rating: "positive",
          wasViewed: true,
          wasBookmarked: true,
        },
        {
          id: "rec-2",
          projectId: "proj-2",
          title: "React Native Mobile App for Food Delivery",
          abstract: "Create a cross-platform mobile application for food ordering and delivery tracking.",
          specialization: "MobileDev",
          difficultyLevel: "advanced",
          similarityScore: 0.78,
          reasoning: "Aligns with your mobile development experience",
          generatedAt: "2024-01-14T14:20:00Z",
          rating: "negative",
          wasViewed: true,
          wasBookmarked: false,
          feedback: "Too complex for current skill level",
        },
        {
          id: "rec-3",
          projectId: "proj-3",
          title: "Blockchain-based Voting System",
          abstract:
            "Design a secure voting system using blockchain technology to ensure transparency and immutability.",
          specialization: "Blockchain",
          difficultyLevel: "expert",
          similarityScore: 0.65,
          reasoning: "Explores new technology area based on your learning goals",
          generatedAt: "2024-01-13T09:15:00Z",
          wasViewed: false,
          wasBookmarked: false,
        },
      ]

      const mockTrends: RecommendationTrend[] = [
        {
          period: "Last 7 days",
          totalRecommendations: 12,
          averageScore: 0.78,
          positiveRatings: 8,
          negativeRatings: 2,
          viewRate: 0.83,
          bookmarkRate: 0.42,
        },
        {
          period: "Last 30 days",
          totalRecommendations: 45,
          averageScore: 0.75,
          positiveRatings: 28,
          negativeRatings: 8,
          viewRate: 0.8,
          bookmarkRate: 0.38,
        },
        {
          period: "Last 90 days",
          totalRecommendations: 120,
          averageScore: 0.73,
          positiveRatings: 75,
          negativeRatings: 20,
          viewRate: 0.78,
          bookmarkRate: 0.35,
        },
      ]

      setRecommendations(mockRecommendations)
      setTrends(mockTrends)
    } catch (error) {
      console.error("Failed to load recommendation history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch =
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.specialization.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPeriod =
      selectedPeriod === "all" ||
      (selectedPeriod === "week" && new Date(rec.generatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (selectedPeriod === "month" && new Date(rec.generatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

    const matchesRating =
      selectedRating === "all" ||
      (selectedRating === "positive" && rec.rating === "positive") ||
      (selectedRating === "negative" && rec.rating === "negative") ||
      (selectedRating === "unrated" && !rec.rating)

    return matchesSearch && matchesPeriod && matchesRating
  })

  const getSpecializationColors = (specialization: string) => {
    const colors = {
      AI: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
      MobileDev: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
      Blockchain: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
      WebDev: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    }
    return colors[specialization as keyof typeof colors] || "bg-gray-50 text-gray-700"
  }

  const getDifficultyColors = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
      intermediate: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300",
      advanced: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300",
      expert: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    }
    return colors[difficulty as keyof typeof colors] || "bg-gray-50 text-gray-700"
  }

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
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <History className="h-8 w-8" />
            Recommendation History
          </h1>
          <p className="text-muted-foreground">
            Track your past recommendations and analyze trends in your project preferences
          </p>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Recommendation History</TabsTrigger>
            <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search recommendation history..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Ratings</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="unrated">Unrated</option>
                </select>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">{recommendation.abstract}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {recommendation.rating === "positive" && <ThumbsUp className="h-4 w-4 text-green-600" />}
                        {recommendation.rating === "negative" && <ThumbsDown className="h-4 w-4 text-red-600" />}
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {Math.round(recommendation.similarityScore * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={cn("border-0", getSpecializationColors(recommendation.specialization))}
                      >
                        {recommendation.specialization}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("border-0", getDifficultyColors(recommendation.difficultyLevel))}
                      >
                        {recommendation.difficultyLevel}
                      </Badge>
                      {recommendation.wasViewed && <Badge variant="secondary">Viewed</Badge>}
                      {recommendation.wasBookmarked && <Badge variant="secondary">Bookmarked</Badge>}
                    </div>

                    {/* Reasoning */}
                    <div>
                      <h4 className="text-sm font-medium mb-1">Why recommended?</h4>
                      <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
                    </div>

                    {/* Feedback */}
                    {recommendation.feedback && (
                      <div className="p-3 bg-muted rounded-md">
                        <h4 className="text-sm font-medium mb-1">Your feedback:</h4>
                        <p className="text-sm">{recommendation.feedback}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(recommendation.generatedAt).toLocaleDateString()}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/projects/${recommendation.projectId}`)}
                      >
                        View Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecommendations.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No recommendations found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* Trend Analysis */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trends.map((trend) => (
                <Card key={trend.period}>
                  <CardHeader>
                    <CardTitle className="text-lg">{trend.period}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Recommendations</span>
                        <span className="font-medium">{trend.totalRecommendations}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Match Score</span>
                        <span className="font-medium">{Math.round(trend.averageScore * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>View Rate</span>
                        <span className="font-medium">{Math.round(trend.viewRate * 100)}%</span>
                      </div>
                      <Progress value={trend.viewRate * 100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bookmark Rate</span>
                        <span className="font-medium">{Math.round(trend.bookmarkRate * 100)}%</span>
                      </div>
                      <Progress value={trend.bookmarkRate * 100} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm">{trend.positiveRatings}</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-600">
                        <ThumbsDown className="h-4 w-4" />
                        <span className="text-sm">{trend.negativeRatings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      Most Successful Recommendations
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      AI and Machine Learning projects have the highest engagement rates (85% view rate, 45% bookmark
                      rate)
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Improvement Opportunity</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Consider exploring more intermediate-level projects to match your growing skill set
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
