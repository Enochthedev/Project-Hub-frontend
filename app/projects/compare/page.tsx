"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, X, Plus, Share2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { Project } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function ProjectCompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectsStore = useProjectsStore()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Project[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Get project IDs from URL params
  const projectIds = searchParams.get('ids')?.split(',').filter(Boolean) || []

  useEffect(() => {
    // Load projects from URL params
    projectIds.forEach(id => {
      projectsStore.getProjectById(id).then(() => {
        const project = projectsStore.currentProject
        if (project) {
          setProjects(prev => {
            const exists = prev.find(p => p.id === project.id)
            if (!exists) {
              return [...prev, project]
            }
            return prev
          })
        }
      }).catch(console.error)
    })
  }, [projectIds])

  // Search for projects to add to comparison
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      projectsStore.searchProjects({
        query: searchQuery,
        limit: 5,
      }).then(() => {
        if (projectsStore.searchResults) {
          // Convert ProjectSummary to Project for comparison
          const results = projectsStore.searchResults.projects.map(summary => ({
            ...summary,
            description: summary.abstract,
            requiredSkills: summary.tags,
            learningOutcomes: [],
            maxGroupSize: undefined,
            estimatedDuration: "Not specified",
            status: 'approved' as const,
            isAvailable: true,
            createdAt: summary.createdAt,
            updatedAt: summary.createdAt,
          }))
          setSearchResults(results.filter(p => !projects.find(existing => existing.id === p.id)))
        }
      }).catch(console.error).finally(() => {
        setIsSearching(false)
      })
    } else {
      setSearchResults([])
    }
  }, [searchQuery, projects])

  const addProject = (project: Project) => {
    if (projects.length >= 4) {
      toast.error("You can compare up to 4 projects at once")
      return
    }
    
    setProjects(prev => [...prev, project])
    setSearchQuery("")
    setSearchResults([])
    
    // Update URL
    const newIds = [...projects.map(p => p.id), project.id]
    router.replace(`/projects/compare?ids=${newIds.join(',')}`)
  }

  const removeProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    
    // Update URL
    const newIds = projects.filter(p => p.id !== projectId).map(p => p.id)
    if (newIds.length > 0) {
      router.replace(`/projects/compare?ids=${newIds.join(',')}`)
    } else {
      router.replace('/projects/compare')
    }
  }

  const handleShare = async () => {
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({
          title: 'Project Comparison',
          text: `Compare ${projects.length} projects`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success("Comparison link copied to clipboard")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast.error("Failed to share comparison")
    }
  }

  const handleExport = () => {
    const exportData = {
      comparisonTitle: `Project Comparison - ${new Date().toLocaleDateString()}`,
      projects: projects.map(project => ({
        title: project.title,
        abstract: project.abstract,
        specialization: project.specialization,
        difficultyLevel: project.difficultyLevel,
        tags: project.tags,
        requiredSkills: project.requiredSkills,
        learningOutcomes: project.learningOutcomes,
        isGroupProject: project.isGroupProject,
        estimatedDuration: project.estimatedDuration,
        supervisor: project.supervisor,
      })),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project_comparison_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("Comparison exported successfully")
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

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-[#534D56] dark:text-[#F8F1FF]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF] lg:text-3xl">
              Project Comparison
            </h1>
            <p className="text-[#656176] dark:text-[#DECDF5]">
              Compare up to 4 projects side by side
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {projects.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-[#DECDF5] dark:border-[#656176]"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="border-[#DECDF5] dark:border-[#656176]"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Add Project Search */}
      {projects.length < 4 && (
        <Card className="mb-8 border-[#DECDF5] bg-white/50 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
          <CardHeader>
            <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF]">Add Project to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                placeholder="Search for projects to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50"
              />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-md border border-[#DECDF5] bg-white shadow-lg dark:border-[#656176] dark:bg-[#534D56]">
                  {searchResults.map((project) => (
                    <div
                      key={project.id}
                      className="cursor-pointer p-3 hover:bg-[#DECDF5]/20 dark:hover:bg-[#656176]/20"
                      onClick={() => addProject(project)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">{project.title}</h4>
                          <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
                            {formatSpecialization(project.specialization)} • {project.difficultyLevel}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-[#1B998B]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Grid */}
      {projects.length === 0 ? (
        <Card className="border-dashed border-[#DECDF5] bg-white/50 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No Projects to Compare</h3>
            <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">
              Search and add projects above to start comparing them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <Card key={project.id} className="border-[#DECDF5] bg-white/50 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF]">
                      {project.title}
                    </CardTitle>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className={cn("border-0 text-xs", getSpecializationColors(project.specialization))}>
                        {formatSpecialization(project.specialization)}
                      </Badge>
                      <Badge variant="outline" className={cn("border-0 text-xs", getDifficultyColors(project.difficultyLevel))}>
                        {project.difficultyLevel}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProject(project.id)}
                    className="h-8 w-8 text-[#656176] hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Abstract */}
                <div>
                  <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Abstract</h4>
                  <p className="mt-1 text-sm text-[#656176] dark:text-[#DECDF5] line-clamp-3">
                    {project.abstract}
                  </p>
                </div>

                <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

                {/* Supervisor */}
                <div>
                  <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Supervisor</h4>
                  <p className="mt-1 text-sm text-[#656176] dark:text-[#DECDF5]">
                    {project.supervisor.name}
                  </p>
                  <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
                    {project.supervisor.department}
                  </p>
                </div>

                <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

                {/* Project Type */}
                <div>
                  <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Project Type</h4>
                  <Badge variant="outline" className="mt-1 border-[#DECDF5] text-xs dark:border-[#656176]">
                    {project.isGroupProject ? 'Group Project' : 'Individual Project'}
                  </Badge>
                </div>

                <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

                {/* Duration */}
                <div>
                  <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Duration</h4>
                  <p className="mt-1 text-sm text-[#656176] dark:text-[#DECDF5]">
                    {project.estimatedDuration}
                  </p>
                </div>

                <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

                {/* Required Skills */}
                <div>
                  <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Required Skills</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {project.requiredSkills.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {project.requiredSkills.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]"
                      >
                        +{project.requiredSkills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="bg-[#DECDF5] dark:bg-[#656176]" />

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">Tags</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-[#DECDF5] text-[#656176] dark:border-[#656176] dark:text-[#DECDF5]"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-[#DECDF5] text-[#656176] dark:border-[#656176] dark:text-[#DECDF5]"
                      >
                        +{project.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="w-full border-[#DECDF5] dark:border-[#656176]"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectComparePage() {
  return (
    <Suspense fallback={
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Loading...</h1>
        </div>
      </div>
    }>
      <ProjectCompareContent />
    </Suspense>
  )
}