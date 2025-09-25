"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star, Users, Calendar, TrendingUp, BookOpen, Award } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  rating: number
  students: number
  skills: string[]
  prerequisites: string[]
  outcomes: string[]
  supervisor: string
  department: string
  lastUpdated: string
}

interface ProjectCompareContentProps {
  searchParams: {
    projects?: string
    view?: string
  }
}

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: "1",
    title: "Machine Learning for Healthcare",
    description: "Develop ML models to predict patient outcomes using electronic health records.",
    category: "Machine Learning",
    difficulty: "Advanced",
    duration: "12 months",
    rating: 4.8,
    students: 156,
    skills: ["Python", "TensorFlow", "Data Analysis", "Healthcare Domain"],
    prerequisites: ["Statistics", "Programming", "Linear Algebra"],
    outcomes: ["Research Paper", "Working ML Model", "Healthcare Impact"],
    supervisor: "Dr. Sarah Johnson",
    department: "Computer Science",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    title: "Sustainable Web Development",
    description: "Create eco-friendly web applications with minimal carbon footprint.",
    category: "Web Development",
    difficulty: "Intermediate",
    duration: "8 months",
    rating: 4.6,
    students: 89,
    skills: ["React", "Node.js", "Green Computing", "Performance Optimization"],
    prerequisites: ["JavaScript", "HTML/CSS", "Basic Backend"],
    outcomes: ["Sustainable Web App", "Performance Report", "Best Practices Guide"],
    supervisor: "Prof. Michael Chen",
    department: "Software Engineering",
    lastUpdated: "2024-01-10",
  },
]

const allProjects = [
  ...mockProjects,
  {
    id: "3",
    title: "Blockchain Supply Chain",
    description: "Implement blockchain technology for transparent supply chain management.",
    category: "Blockchain",
    difficulty: "Advanced",
    duration: "10 months",
    rating: 4.7,
    students: 67,
    skills: ["Solidity", "Ethereum", "Smart Contracts", "Supply Chain"],
    prerequisites: ["Cryptography", "Distributed Systems", "Programming"],
    outcomes: ["Blockchain Solution", "Smart Contracts", "Industry Partnership"],
    supervisor: "Dr. Emily Rodriguez",
    department: "Computer Science",
    lastUpdated: "2024-01-12",
  },
  {
    id: "4",
    title: "AI-Powered Education Platform",
    description: "Build an adaptive learning platform using artificial intelligence.",
    category: "AI/Education",
    difficulty: "Intermediate",
    duration: "9 months",
    rating: 4.5,
    students: 134,
    skills: ["Python", "AI/ML", "Educational Technology", "UX Design"],
    prerequisites: ["Programming", "Basic AI", "Education Theory"],
    outcomes: ["Learning Platform", "AI Algorithms", "User Studies"],
    supervisor: "Dr. James Wilson",
    department: "Educational Technology",
    lastUpdated: "2024-01-08",
  },
]

export function ProjectCompareContent({ searchParams }: ProjectCompareContentProps) {
  const router = useRouter()
  const clientSearchParams = useSearchParams()
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([])
  const [availableProjects, setAvailableProjects] = useState<Project[]>(allProjects)
  const [view, setView] = useState<"cards" | "table">((searchParams.view as "cards" | "table") || "cards")

  useEffect(() => {
    const projectIds = searchParams.projects?.split(",") || []
    const projects = allProjects.filter((p) => projectIds.includes(p.id))
    setSelectedProjects(projects)
  }, [searchParams.projects])

  const handleProjectSelect = (projectId: string, slot: number) => {
    const project = availableProjects.find((p) => p.id === projectId)
    if (!project) return

    const newSelected = [...selectedProjects]
    newSelected[slot] = project

    setSelectedProjects(newSelected)

    // Update URL
    const projectIds = newSelected
      .filter(Boolean)
      .map((p) => p.id)
      .join(",")
    const params = new URLSearchParams(clientSearchParams.toString())
    if (projectIds) {
      params.set("projects", projectIds)
    } else {
      params.delete("projects")
    }
    router.push(`/projects/compare?${params.toString()}`)
  }

  const handleViewChange = (newView: "cards" | "table") => {
    setView(newView)
    const params = new URLSearchParams(clientSearchParams.toString())
    params.set("view", newView)
    router.push(`/projects/compare?${params.toString()}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const comparisonFields = [
    { key: "category", label: "Category", icon: BookOpen },
    { key: "difficulty", label: "Difficulty", icon: TrendingUp },
    { key: "duration", label: "Duration", icon: Calendar },
    { key: "rating", label: "Rating", icon: Star },
    { key: "students", label: "Students", icon: Users },
    { key: "supervisor", label: "Supervisor", icon: Award },
  ]

  return (
    <div className="space-y-6">
      {/* Project Selection */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select onValueChange={(value) => handleProjectSelect(value, 0)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select first project" />
          </SelectTrigger>
          <SelectContent>
            {availableProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => handleProjectSelect(value, 1)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select second project" />
          </SelectTrigger>
          <SelectContent>
            {availableProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant={view === "cards" ? "default" : "outline"} onClick={() => handleViewChange("cards")}>
            Cards
          </Button>
          <Button variant={view === "table" ? "default" : "outline"} onClick={() => handleViewChange("table")}>
            Table
          </Button>
        </div>
      </div>

      {selectedProjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Select projects above to start comparing them</p>
          </CardContent>
        </Card>
      )}

      {selectedProjects.length > 0 && view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedProjects.map((project, index) => (
            <Card key={project.id} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {project.title}
                  <Badge className={getDifficultyColor(project.difficulty)}>{project.difficulty}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{project.category}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{project.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{project.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{project.students} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{project.rating}/5.0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span className="truncate">{project.supervisor}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Skills Required</h4>
                  <div className="flex flex-wrap gap-1">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Prerequisites</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {project.prerequisites.map((prereq) => (
                      <li key={prereq}>• {prereq}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Expected Outcomes</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {project.outcomes.map((outcome) => (
                      <li key={outcome}>• {outcome}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedProjects.length > 0 && view === "table" && (
        <Card>
          <CardHeader>
            <CardTitle>Project Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aspect</TableHead>
                  {selectedProjects.map((project) => (
                    <TableHead key={project.id}>{project.title}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonFields.map((field) => (
                  <TableRow key={field.key}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <field.icon className="h-4 w-4" />
                      {field.label}
                    </TableCell>
                    {selectedProjects.map((project) => (
                      <TableCell key={project.id}>
                        {field.key === "difficulty" ? (
                          <Badge className={getDifficultyColor(project[field.key as keyof Project] as string)}>
                            {project[field.key as keyof Project] as string}
                          </Badge>
                        ) : field.key === "rating" ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {project[field.key as keyof Project]}
                          </div>
                        ) : (
                          (project[field.key as keyof Project] as string)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">Skills</TableCell>
                  {selectedProjects.map((project) => (
                    <TableCell key={project.id}>
                      <div className="flex flex-wrap gap-1">
                        {project.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {project.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
