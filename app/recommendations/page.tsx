"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Lightbulb, TrendingUp, Star, ThumbsUp, ThumbsDown, BookmarkPlus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { recommendationsApi } from "@/lib/api/recommendations"
import { Recommendation, RecommendationResult } from "@/lib/api/types"
import { useProjects } from "@/components/providers/projects-provider"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { AIAssistantButton } from "@/components/ai/assistant-button"

export default function RecommendationsPage() {
  const router = useRouter()
  const { saveProject } = useProjects()
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ratedRecommendations, setRatedRecommendations] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async (forceRefresh = false) => {
    try {
      setIsLoading(!forceRefresh)
      setIsRefreshing(forceRefresh)
      setError(null)

      const result = await recommendationsApi.generateRecommendations({
        limit: 6,
        forceRefresh,
        includeDiversityBoost: true,
      })

      setRecommendations(result)
    } catch (error: any) {
      console.error('Failed to load recommendations:', error)
      setError(error.response?.data?.message || 'Failed to load recommendations')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadRecommendations(true)
  }

  const handleRating = async (recommendationId: string, rating: 'positive' | 'negative') => {
    try {
      await recommendationsApi.rateRecommendation(recommendationId, rating)
      setRatedRecommendations(prev => new Set([...prev, recommendationId]))
      toast.success(`Thank you for your feedback!`)
    } catch (error) {
      console.error('Failed to rate recommendation:', error)
      toast.error('Failed to submit rating')
    }
  }

  const handleBookmark = (recommendation: Recommendation) => {
    // Convert to legacy format for bookmark compatibility
    const legacyProject = {
      id: recommendation.projectId,
      title: recommendation.title,
      description: recommendation.abstract,
      category: recommendation.specialization,
      difficulty: recommendation.difficultyLevel.charAt(0).toUpperCase() + recommendation.difficultyLevel.slice(1),
      tags: recommendation.matchingSkills,
      stack: recommendation.matchingSkills,
      isGroupProject: false, // Default for recommendations
      notes: `Recommended with ${Math.round(recommendation.similarityScore * 100)}% match`,
    }

    saveProject(legacyProject)
    toast.success("Project bookmarked successfully")
  }

  const getSpecializationColors = (specialization: string) => {
    const colors = {
      WebDev: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
      MobileDev: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
      AI: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
      ML: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
      DataScience: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300",
      IoT: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300",
      Blockchain: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
      GameDev: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
      Cybersecurity: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
      DevOps: "bg-gray-50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300",
    }
    return colors[specialization as keyof typeof colors] || "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }

  const getDifficultyColors = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
      intermediate: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300",
      advanced: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300",
      expert: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    }
    return colors[difficulty as keyof typeof colors] || "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }

  const formatSpecialization = (specialization: string) => {
    const specializations: Record<string, string> = {
      'AI': 'Artificial Intelligence',
      'ML': 'Machine Learning',
      'WebDev': 'Web Development',
      'MobileDev': 'Mobile Development',
      'DataScience': 'Data Science',
      'Cybersecurity': 'Cybersecurity',
      'IoT': 'Internet of Things',
      'Blockchain': 'Blockchain',
      'GameDev': 'Game Development',
      'DevOps': 'DevOps',
    }
    return specializations[specialization] || specialization
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 dark:text-green-400"
    if (score >= 0.6) return "text-yellow-600 dark:text-yellow-400"
    return "text-orange-600 dark:text-orange-400"
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/30">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Recommendations</h3>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button
              onClick={() => loadRecommendations()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF] sm:text-4xl">
            Project Recommendations
          </h1>
          <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">
            Personalized project suggestions based on your profile and interests
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-[#1B998B] hover:bg-[#1B998B]/90"
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Recommendation Summary */}
      {recommendations && !isLoading && (
        <Card className="mb-8 border-[#DECDF5] bg-white/50 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[#534D56] dark:text-[#F8F1FF]">
              <Lightbulb className="h-5 w-5 text-[#1B998B]" />
              Recommendation Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1B998B]">
                  {recommendations.recommendations.length}
                </div>
                <div className="text-sm text-[#656176] dark:text-[#DECDF5]">Projects Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1B998B]">
                  {Math.round(recommendations.averageSimilarityScore * 100)}%
                </div>
                <div className="text-sm text-[#656176] dark:text-[#DECDF5]">Average Match</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1B998B]">
                  {recommendations.metadata.projectsAnalyzed}
                </div>
                <div className="text-sm text-[#656176] dark:text-[#DECDF5]">Projects Analyzed</div>
              </div>
            </div>

            <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

            <div>
              <h4 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">Why these recommendations?</h4>
              <p className="mt-1 text-sm text-[#656176] dark:text-[#DECDF5]">
                {recommendations.reasoning}
              </p>
            </div>

            {recommendations.fromCache && (
              <div className="flex items-center gap-2 text-xs text-[#656176] dark:text-[#DECDF5]">
                <TrendingUp className="h-3 w-3" />
                Cached results • Generated {new Date(recommendations.generatedAt).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-[#DECDF5] dark:border-[#656176]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="mt-2 flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations && !isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.recommendations.map((recommendation) => (
            <Card
              key={recommendation.projectId}
              className="group border-[#DECDF5] bg-white/50 backdrop-blur transition-all hover:shadow-lg dark:border-[#656176] dark:bg-[#656176]/30"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF] group-hover:text-[#1B998B] transition-colors">
                      {recommendation.title}
                    </CardTitle>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className={cn("border-0", getSpecializationColors(recommendation.specialization))}>
                        {formatSpecialization(recommendation.specialization)}
                      </Badge>
                      <Badge variant="outline" className={cn("border-0", getDifficultyColors(recommendation.difficultyLevel))}>
                        {recommendation.difficultyLevel.charAt(0).toUpperCase() + recommendation.difficultyLevel.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Similarity Score */}
                  <div className="text-center">
                    <div className={cn("text-lg font-bold", getSimilarityColor(recommendation.similarityScore))}>
                      {Math.round(recommendation.similarityScore * 100)}%
                    </div>
                    <div className="text-xs text-[#656176] dark:text-[#DECDF5]">Match</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Abstract */}
                <p className="text-sm text-[#656176] dark:text-[#DECDF5] line-clamp-3">
                  {recommendation.abstract}
                </p>

                {/* Match Progress */}
                <div>
                  <div className="flex justify-between text-xs text-[#656176] dark:text-[#DECDF5] mb-1">
                    <span>Compatibility</span>
                    <span>{Math.round(recommendation.similarityScore * 100)}%</span>
                  </div>
                  <Progress 
                    value={recommendation.similarityScore * 100} 
                    className="h-2"
                  />
                </div>

                <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

                {/* Supervisor */}
                <div>
                  <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Supervisor</h4>
                  <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
                    {recommendation.supervisor.name} • {recommendation.supervisor.specialization}
                  </p>
                </div>

                {/* Matching Skills */}
                <div>
                  <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Matching Skills</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {recommendation.matchingSkills.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs bg-[#1B998B]/10 text-[#1B998B] border-[#1B998B]/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {recommendation.matchingSkills.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]"
                      >
                        +{recommendation.matchingSkills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Matching Interests */}
                {recommendation.matchingInterests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Matching Interests</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {recommendation.matchingInterests.slice(0, 2).map((interest) => (
                        <Badge
                          key={interest}
                          variant="outline"
                          className="text-xs border-[#1B998B]/30 text-[#1B998B]"
                        >
                          {interest}
                        </Badge>
                      ))}
                      {recommendation.matchingInterests.length > 2 && (
                        <Badge
                          variant="outline"
                          className="text-xs border-[#DECDF5] text-[#656176] dark:border-[#656176] dark:text-[#DECDF5]"
                        >
                          +{recommendation.matchingInterests.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                <div>
                  <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Why recommended?</h4>
                  <p className="mt-1 text-xs text-[#656176] dark:text-[#DECDF5] line-clamp-2">
                    {recommendation.reasoning}
                  </p>
                </div>

                {/* Diversity Boost */}
                {recommendation.diversityBoost && recommendation.diversityBoost > 0 && (
                  <div className="flex items-center gap-2 text-xs text-[#1B998B]">
                    <Star className="h-3 w-3" />
                    Diversity pick • Expands your horizons
                  </div>
                )}

                <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/projects/${recommendation.projectId}`)}
                      className="border-[#DECDF5] dark:border-[#656176]"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBookmark(recommendation)}
                      className="border-[#DECDF5] dark:border-[#656176]"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Rating */}
                  {!ratedRecommendations.has(recommendation.projectId) ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRating(recommendation.projectId, 'positive')}
                        className="h-8 w-8 p-0 text-[#656176] hover:text-green-600"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRating(recommendation.projectId, 'negative')}
                        className="h-8 w-8 p-0 text-[#656176] hover:text-red-600"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-[#1B998B]">
                      Thanks for feedback!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Recommendations */}
      {recommendations && recommendations.recommendations.length === 0 && !isLoading && (
        <Card className="border-dashed border-[#DECDF5] bg-white/50 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
          <CardContent className="py-12 text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-[#656176] dark:text-[#DECDF5]" />
            <h3 className="mt-4 text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No Recommendations Available</h3>
            <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">
              Complete your profile to get personalized project recommendations.
            </p>
            <Button
              onClick={() => router.push('/profile')}
              className="mt-4 bg-[#1B998B] hover:bg-[#1B998B]/90"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      )}

      <AIAssistantButton />
    </div>
  )
}