"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, BookmarkPlus } from "lucide-react"
import { useProjectsStore } from "@/lib/stores/projects-store"

interface ProjectCompareContentProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ProjectCompareContent({ searchParams }: ProjectCompareContentProps) {
  const searchParamsHook = useSearchParams()
  const { projects, fetchProjects } = useProjectsStore()
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        await fetchProjects()

        // Get project IDs from search params
        const projectIds = searchParamsHook.get("projects")?.split(",") || []
        setSelectedProjects(projectIds.slice(0, 2)) // Limit to 2 projects
      } catch (error) {
        console.error("Failed to load projects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [fetchProjects, searchParamsHook])

  const handleProjectSelect = (projectId: string, index: number) => {
    const newSelected = [...selectedProjects]
    newSelected[index] = projectId
    setSelectedProjects(newSelected)
  }

  const getProjectById = (id: string) => {
    return projects.find((p) => p.id === id)
  }

  const selectedProjectData = selectedProjects.map((id) => getProjectById(id)).filter(Boolean)

  const comparisonFields = [
    { key: "title", label: "Project Title" },
    { key: "description", label: "Description" },
    { key: "category", label: "Category" },
    { key: "difficulty", label: "Difficulty Level" },
    { key: "duration", label: "Estimated Duration" },
    { key: "technologies", label: "Technologies" },
    { key: "prerequisites", label: "Prerequisites" },
    { key: "learningOutcomes", label: "Learning Outcomes" },
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-2">Compare Projects</h1>
        <p className="text-[#656176] dark:text-[#DECDF5]">
          Compare up to 2 projects side by side to help you make the best choice
        </p>
      </div>

      {/* Project Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#534D56] dark:text-[#F8F1FF]">Select Projects to Compare</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Project {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedProjects[index] || ""}
                  onValueChange={(value) => handleProjectSelect(value, index)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter((p) => !selectedProjects.includes(p.id) || p.id === selectedProjects[index])
                      .map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedProjectData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Project Comparison</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Feature</th>
                    {selectedProjectData.map((project, index) => (
                      <th key={index} className="text-left py-3 px-4 font-semibold">
                        {project?.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFields.map((field) => (
                    <tr key={field.key} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#534D56] dark:text-[#F8F1FF]">{field.label}</td>
                      {selectedProjectData.map((project, index) => (
                        <td key={index} className="py-3 px-4 text-[#656176] dark:text-[#DECDF5]">
                          {field.key === "technologies" && project?.technologies ? (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map((tech, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.technologies.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : field.key === "difficulty" ? (
                            <Badge
                              variant={
                                project?.difficulty === "Beginner"
                                  ? "secondary"
                                  : project?.difficulty === "Intermediate"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {project?.difficulty || "N/A"}
                            </Badge>
                          ) : field.key === "description" ? (
                            <div className="max-w-xs">
                              <p className="text-sm line-clamp-3">
                                {(project?.[field.key as keyof typeof project] as string) || "N/A"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm">
                              {(project?.[field.key as keyof typeof project] as string) || "N/A"}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProjectData.length < 2 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[#656176] dark:text-[#DECDF5] mb-4">Select 2 projects to start comparing</p>
            <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
              Choose projects from the dropdowns above to see a detailed side-by-side comparison
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
