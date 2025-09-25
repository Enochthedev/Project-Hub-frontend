"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, Download, Users, Calendar, Eye, Heart, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { useProjects } from "@/components/providers/projects-provider"
import { Project } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { AIAssistantButton } from "@/components/ai/assistant-button"
import { toast } from "sonner"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const projectsStore = useProjectsStore()
  const { savedProjects, saveProject, removeProject } = useProjects()
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    if (projectId) {
      projectsStore.getProjectById(projectId)
      projectsStore.getRelatedProjects(projectId, 4)
    }
  }, [projectId])

  const project = projectsStore.currentProject
  const relatedProjects = projectsStore.relatedProjects
  const isLoading = projectsStore.isLoadingProject
  const error = projectsStore.error

  // Convert to legacy format for bookmark compatibility
  const legacyProject = project ? {
    id: project.id,
    title: project.title,
    description: project.abstract,
    category: project.specialization,
    difficulty: project.difficultyLevel.charAt(0).toUpperCase() + project.difficultyLevel.slice(1),
    tags: project.tags,
    stack: project.requiredSkills,
    isGroupProject: project.isGroupProject,
    notes: "",
  } : null

  const isSaved = legacyProject ? savedProjects.some((p) => p.id === legacyProject.id) : false

  const handleBookmark = () => {
    if (!legacyProject) return
    
    if (isSaved) {
      removeProject(legacyProject.id)
      toast.success("Project removed from bookmarks")
    } else {
      saveProject(legacyProject)
      toast.success("Project bookmarked successfully")
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      if (navigator.share && project) {
        await navigator.share({
          title: project.title,
          text: project.abstract,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Project link copied to clipboard")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast.error("Failed to share project")
    } finally {
      setIsSharing(false)
    }
  }

  const handleExport = () => {
    if (!project) return

    const exportData = {
      title: project.title,
      abstract: project.abstract,
      description: project.description,
      specialization: project.specialization,
      difficulty: project.difficultyLevel,
      tags: project.tags,
      requiredSkills: project.requiredSkills,
      learningOutcomes: project.learningOutcomes,
      isGroupProject: project.isGroupProject,
      maxGroupSize: project.maxGroupSize,
      estimatedDuration: project.estimatedDuration,
      supervisor: project.supervisor,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("Project exported successfully")
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

  if (error) {
    return (
      <div className="container py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/30">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Project</h3>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button
              onClick={() => {
                projectsStore.clearError()
                if (projectId) {
                  projectsStore.getProjectById(projectId)
                }
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !project) {
    return (
      <div className="container py-12">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-[#DECDF5] dark:border-[#656176]">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="border-[#DECDF5] dark:border-[#656176]">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-[#534D56] dark:text-[#F8F1FF]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="border-[#DECDF5] bg-white/50 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF] lg:text-3xl">
                    {project.title}
                  </CardTitle>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn("border-0", getSpecializationColors(project.specialization))}>
                      {formatSpecialization(project.specialization)}
                    </Badge>
                    <Badge variant="outline" className={cn("border-0", getDifficultyColors(project.difficultyLevel))}>
                      {project.difficultyLevel.charAt(0).toUpperCase() + project.difficultyLevel.slice(1)}
                    </Badge>
                    {project.isGroupProject && (
                      <Badge variant="outline" className="flex items-center gap-1 border-0 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300">
                        <Users className="h-3 w-3" />
                        Group Project
                        {project.maxGroupSize && ` (Max ${project.maxGroupSize})`}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleBookmark}
                    className="border-[#DECDF5] dark:border-[#656176]"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-[#1B998B]" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    disabled={isSharing}
                    className="border-[#DECDF5] dark:border-[#656176]"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleExport}
                    className="border-[#DECDF5] dark:border-[#656176]"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Project Stats */}
              <div className="flex items-center gap-6 text-sm text-[#656176] dark:text-[#DECDF5]">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {project.viewCount || 0} views
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {project.bookmarkCount || 0} bookmarks
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {project.estimatedDuration}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Abstract */}
              <div>
                <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Abstract</h3>
                <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">{project.abstract}</p>
              </div>

              <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Description</h3>
                <div className="mt-2 whitespace-pre-wrap text-[#656176] dark:text-[#DECDF5]">
                  {project.description}
                </div>
              </div>

              <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

              {/* Learning Outcomes */}
              {project.learningOutcomes && project.learningOutcomes.length > 0 && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Learning Outcomes</h3>
                    <ul className="mt-2 space-y-1">
                      {project.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2 text-[#656176] dark:text-[#DECDF5]">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1B998B]" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />
                </>
              )}

              {/* Required Skills */}
              <div>
                <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Required Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-[#DECDF5] text-[#656176] dark:border-[#656176] dark:text-[#DECDF5]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supervisor Information */}
          <Card className="border-[#DECDF5] bg-white/50 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader>
              <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF]">Supervisor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">{project.supervisor.name}</h4>
                  <p className="text-sm text-[#656176] dark:text-[#DECDF5]">{project.supervisor.title}</p>
                  <p className="text-sm text-[#656176] dark:text-[#DECDF5]">{project.supervisor.department}</p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Specializations</h5>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {project.supervisor.specializations.map((spec) => (
                      <Badge
                        key={spec}
                        variant="outline"
                        className="text-xs border-[#DECDF5] text-[#656176] dark:border-[#656176] dark:text-[#DECDF5]"
                      >
                        {formatSpecialization(spec)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card className="border-[#DECDF5] bg-white/50 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader>
              <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF]">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#656176] dark:text-[#DECDF5]">Status</span>
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
                  {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-[#656176] dark:text-[#DECDF5]">Duration</span>
                <span className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">{project.estimatedDuration}</span>
              </div>
              
              {project.applicationDeadline && (
                <div className="flex justify-between">
                  <span className="text-sm text-[#656176] dark:text-[#DECDF5]">Deadline</span>
                  <span className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                    {new Date(project.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-[#656176] dark:text-[#DECDF5]">Available</span>
                <Badge variant={project.isAvailable ? "default" : "secondary"} className={project.isAvailable ? "bg-[#1B998B]" : ""}>
                  {project.isAvailable ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <Card className="border-[#DECDF5] bg-white/50 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
              <CardHeader>
                <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF]">Related Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedProjects.map((relatedProject) => (
                  <div
                    key={relatedProject.id}
                    className="cursor-pointer rounded-lg border border-[#DECDF5] p-3 transition-colors hover:bg-[#DECDF5]/20 dark:border-[#656176] dark:hover:bg-[#656176]/20"
                    onClick={() => router.push(`/projects/${relatedProject.id}`)}
                  >
                    <h5 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">{relatedProject.title}</h5>
                    <p className="mt-1 text-xs text-[#656176] dark:text-[#DECDF5] line-clamp-2">
                      {relatedProject.abstract}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-[#DECDF5] dark:border-[#656176]">
                        {formatSpecialization(relatedProject.specialization)}
                      </Badge>
                      <ExternalLink className="h-3 w-3 text-[#656176] dark:text-[#DECDF5]" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AIAssistantButton />
    </div>
  )
}
