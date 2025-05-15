"use client"

import type { Project } from "@/types/project"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Users } from "lucide-react"
import { useState } from "react"
import { useProjects } from "@/components/providers/projects-provider"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { savedProjects, saveProject, removeProject } = useProjects()

  const isSaved = savedProjects.some((p) => p.id === project.id)

  const toggleSave = () => {
    if (isSaved) {
      removeProject(project.id)
    } else {
      saveProject(project)
    }
  }

  // Determine badge colors based on category
  const getCategoryColors = (category: string) => {
    const colors = {
      Web: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
      Mobile: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
      AI: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
      "Data Science": "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300",
      IoT: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300",
      Blockchain: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
      "Game Dev": "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    }
    return colors[category as keyof typeof colors] || "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }

  // Determine badge colors based on difficulty
  const getDifficultyColors = (difficulty: string) => {
    const colors = {
      Beginner: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
      Intermediate: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300",
      Advanced: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    }
    return colors[difficulty as keyof typeof colors] || ""
  }

  return (
    <Card
      className={cn(
        "card-hover-effect group overflow-hidden border bg-white/50 backdrop-blur transition-all border-[#DECDF5] dark:border-[#656176] dark:bg-[#656176]/30",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl group-hover:text-[#1B998B] transition-colors text-[#534D56] dark:text-[#F8F1FF]">
              {project.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className={cn("border-0", getCategoryColors(project.category))}>
                {project.category}
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
              <Badge variant="outline" className={cn("border-0", getDifficultyColors(project.difficulty))}>
                {project.difficulty}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSave}
            className="text-[#656176] hover:text-[#534D56] dark:text-[#DECDF5] dark:hover:text-[#F8F1FF]"
          >
            {isSaved ? <BookmarkCheck className="h-5 w-5 text-[#1B998B]" /> : <Bookmark className="h-5 w-5" />}
            <span className="sr-only">{isSaved ? "Unsave project" : "Save project"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[#656176] dark:text-[#DECDF5]">
          {expanded
            ? project.description
            : `${project.description.slice(0, 150)}${project.description.length > 150 ? "..." : ""}`}
        </p>
        {project.description.length > 150 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-8 px-2 text-xs text-[#534D56] dark:text-[#F8F1FF]"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" /> Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" /> Show More
              </>
            )}
          </Button>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Suggested Stack:</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {project.stack.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="text-xs bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Tags:</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-[#DECDF5] text-[#656176] dark:border-[#656176] dark:text-[#DECDF5]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
