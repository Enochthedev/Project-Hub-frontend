"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, Download, Bookmark } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  difficulty: string
  duration: string
  technologies: string[]
  category: string
  supervisor: string
  requirements: string[]
  outcomes: string[]
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI-Powered Chatbot",
    description: "Build an intelligent chatbot using natural language processing",
    difficulty: "Advanced",
    duration: "12 weeks",
    technologies: ["Python", "TensorFlow", "React", "Node.js"],
    category: "Artificial Intelligence",
    supervisor: "Dr. Sarah Johnson",
    requirements: ["Python programming", "Machine learning basics", "Web development"],
    outcomes: ["Working chatbot application", "Research paper", "Presentation"],
  },
  {
    id: "2",
    title: "E-commerce Platform",
    description: "Develop a full-stack e-commerce solution with payment integration",
    difficulty: "Intermediate",
    duration: "10 weeks",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    category: "Web Development",
    supervisor: "Prof. Michael Chen",
    requirements: ["JavaScript proficiency", "Database knowledge", "API integration"],
    outcomes: ["Complete e-commerce site", "Technical documentation", "Demo presentation"],
  },
]

interface ProjectCompareContentProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export function ProjectCompareContent({ searchParams }: ProjectCompareContentProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get project IDs from search params
    const projectIds = Array.isArray(searchParams.projects)
      ? searchParams.projects
      : searchParams.projects?.split(",") || []

    // Filter mock projects based on IDs
    const selectedProjects = mockProjects.filter((project) => projectIds.includes(project.id))

    setProjects(selectedProjects)
    setLoading(false)
  }, [searchParams])

  const handleExport = () => {
    // Export comparison as PDF or CSV
    console.log("Exporting comparison...")
  }

  const handleShare = () => {
    // Share comparison link
    navigator.clipboard.writeText(window.location.href)
  }

  const handleSave = () => {
    // Save comparison to user's saved comparisons
    console.log("Saving comparison...")
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (projects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Projects Selected</h1>
          <p className="text-gray-600 mb-4">Please select projects to compare from the projects page.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Comparison</h1>
        <p className="text-gray-600">Compare {projects.length} selected projects side by side</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button onClick={handleShare} variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button onClick={handleSave} variant="outline">
          <Bookmark className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Criteria</th>
                  {projects.map((project) => (
                    <th key={project.id} className="text-center p-4 min-w-[250px]">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <Badge variant="secondary">{project.category}</Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">Description</td>
                  {projects.map((project) => (
                    <td key={project.id} className="p-4 text-center">
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Difficulty</td>
                  {projects.map((project) => (
                    <td key={project.id} className="p-4 text-center">
                      <Badge
                        variant={
                          project.difficulty === "Advanced"
                            ? "destructive"
                            : project.difficulty === "Intermediate"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {project.difficulty}
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Duration</td>
                  {projects.map((project) => (
                    <td key={project.id} className="p-4 text-center">
                      {project.duration}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Technologies</td>
                  {projects.map((project) => (
                    <td key={project.id} className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Supervisor</td>
                  {projects.map((project) => (
                    <td key={project.id} className="p-4 text-center">
                      {project.supervisor}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Requirements</td>
                  {projects.map((project) => (
                    <td key={project.id} className="p-4">
                      <ul className="text-sm text-left space-y-1">
                        {project.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium">Expected Outcomes</td>
                  {projects.map((project) => (
                    <td key={project.id} className="p-4">
                      <ul className="text-sm text-left space-y-1">
                        {project.outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
