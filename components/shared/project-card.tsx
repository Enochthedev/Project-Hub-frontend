"use client"

import type { ProjectSummary } from "@/lib/api/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Users, GitCompare, ExternalLink } from "lucide-react"
import { useState } from "react"
import { useProjects } from "@/components/providers/projects-provider"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMobile } from "@/hooks/use-mobile"
import { TouchButton } from "@/components/ui/touch-button"

interface ProjectCardProps {
  project: ProjectSummary
  className?: string
  showCompareButton?: boolean
  onCompare?: (project: ProjectSummary) => void
}

export function ProjectCard({ project, className, showCompareButton = true, onCompare }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { savedProjects, saveProject, removeProject } = useProjects()
  const router = useRouter()
  const { isMobile, isMobileSmall, isTouch } = useMobile()

  const isSaved = savedProjects.some((p) => p.id === project.id)

  const toggleSave = () => {
    // Convert to legacy format for bookmark compatibility
    const legacyProject = {
      id: project.id,
      title: project.title,
      description: project.abstract,
      category: project.specialization,
      difficulty: project.difficultyLevel.charAt(0).toUpperCase() + project.difficultyLevel.slice(1),
      tags: project.tags,
      stack: project.tags, // Use tags as stack for compatibility
      isGroupProject: project.isGroupProject,
      notes: "",
    }

    if (isSaved) {
      removeProject(project.id)
      toast.success("Project removed from bookmarks")
    } else {
      saveProject(legacyProject)
      toast.success("Project bookmarked successfully")
    }
  }

  const handleCompare = () => {
    if (onCompare) {
      onCompare(project)
    } else {
      // Navigate to compare page with this project
      router.push(`/projects/compare?ids=${project.id}`)
    }
  }

  const handleViewDetails = () => {
    router.push(`/projects/${project.id}`)
  }

  // Determine badge colors based on specialization
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

  // Determine badge colors based on difficulty
  const getDifficultyColors = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
      intermediate: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300",
      advanced: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300",
      expert: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    }
    return colors[difficulty as keyof typeof colors] || "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }

  // Format specialization for display
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

  return (
    <Card
      className={cn(
        "card-hover-effect group overflow-hidden border bg-white/50 backdrop-blur transition-all border-[#DECDF5] dark:border-[#656176] dark:bg-[#656176]/30",
        isTouch && "active:scale-[0.98]",
        className,
      )}
    >
      <CardHeader className={cn("pb-3", isMobileSmall ? "p-4" : "p-6")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              "group-hover:text-[#1B998B] transition-colors text-[#534D56] dark:text-[#F8F1FF] leading-tight",
              isMobileSmall ? "text-lg" : "text-xl"
            )}>
              {project.title}
            </CardTitle>
            <div className={cn("flex flex-wrap gap-2", isMobileSmall ? "pt-2" : "pt-3")}>
              <Badge variant="outline" className={cn("border-0", getSpecializationColors(project.specialization))}>
                {formatSpecialization(project.specialization)}
              </Badge>
              {project.isGroupProject && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-0 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                >
                  <Users className="h-3 w-3" />
                  Group
                </Badge>
              )}
              <Badge variant="outline" className={cn("border-0", getDifficultyColors(project.difficultyLevel))}>
                {project.difficultyLevel.charAt(0).toUpperCase() + project.difficultyLevel.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <TouchButton
              variant="ghost"
              size="icon"
              onClick={toggleSave}
              className="text-[#656176] hover:text-[#534D56] dark:text-[#DECDF5] dark:hover:text-[#F8F1FF]"
              touchSize={isMobile ? "touch" : "default"}
            >
              {isSaved ? <BookmarkCheck className="h-4 w-4 text-[#1B998B]" /> : <Bookmark className="h-4 w-4" />}
              <span className="sr-only">{isSaved ? "Unsave project" : "Save project"}</span>
            </TouchButton>
            {showCompareButton && (
              <TouchButton
                variant="ghost"
                size="icon"
                onClick={handleCompare}
                className="text-[#656176] hover:text-[#534D56] dark:text-[#DECDF5] dark:hover:text-[#F8F1FF]"
                touchSize={isMobile ? "touch" : "default"}
              >
                <GitCompare className="h-4 w-4" />
                <span className="sr-only">Compare project</span>
              </TouchButton>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn(isMobileSmall ? "p-4 pt-0" : "p-6 pt-0")}>
        <p className={cn(
          "text-[#656176] dark:text-[#DECDF5] leading-relaxed",
          isMobileSmall ? "text-sm" : "text-base"
        )}>
          {expanded
            ? project.abstract
            : `${project.abstract.slice(0, isMobileSmall ? 120 : 150)}${project.abstract.length > (isMobileSmall ? 120 : 150) ? "..." : ""}`}
        </p>
        {project.abstract.length > (isMobileSmall ? 120 : 150) && (
          <TouchButton
            variant="ghost"
            size="sm"
            className="mt-3 h-auto px-2 py-1 text-xs text-[#534D56] dark:text-[#F8F1FF]"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-3 w-3" /> Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3 w-3" /> Show More
              </>
            )}
          </TouchButton>
        )}

        {/* Supervisor Information */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Supervisor:</h4>
          <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
            {project.supervisor.name} - {project.supervisor.department}
          </p>
        </div>

        {/* Project Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-[#656176] dark:text-[#DECDF5]">
          <span>{project.viewCount || 0} views</span>
          <span>{project.bookmarkCount || 0} bookmarks</span>
        </div>

        {/* Tags */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Tags:</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {project.tags.slice(0, 5).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-[#DECDF5] text-[#656176] dark:border-[#656176] dark:text-[#DECDF5]"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > 5 && (
              <Badge
                variant="outline"
                className="text-xs border-[#DECDF5] text-[#656176] dark:border-[#656176] dark:text-[#DECDF5]"
              >
                +{project.tags.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={cn("flex gap-2", isMobileSmall ? "mt-4" : "mt-6")}>
          <TouchButton
            variant="outline"
            size={isMobileSmall ? "sm" : "default"}
            onClick={handleViewDetails}
            className="flex-1 border-[#DECDF5] text-[#534D56] hover:bg-[#DECDF5]/20 dark:border-[#656176] dark:text-[#F8F1FF] dark:hover:bg-[#656176]/20"
          >
            <ExternalLink className={cn("mr-2", isMobileSmall ? "h-3 w-3" : "h-4 w-4")} />
            {isMobileSmall ? "View" : "View Details"}
          </TouchButton>
          {showCompareButton && (
            <TouchButton
              variant="outline"
              size={isMobileSmall ? "sm" : "default"}
              onClick={handleCompare}
              className="border-[#DECDF5] text-[#534D56] hover:bg-[#DECDF5]/20 dark:border-[#656176] dark:text-[#F8F1FF] dark:hover:bg-[#656176]/20"
              touchSize={isMobile ? "touch" : "default"}
            >
              <GitCompare className={cn(isMobileSmall ? "h-3 w-3" : "h-4 w-4")} />
              <span className="sr-only">Compare</span>
            </TouchButton>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
