"use client"

import { Suspense } from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Star, Users, Calendar, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Component that handles search and filtering
function ProjectExplorer() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")

  // Mock project data
  const projects = [
    {
      id: "1",
      title: "E-commerce Platform with React",
      description: "Build a full-stack e-commerce platform using React, Node.js, and MongoDB",
      category: "Web Development",
      difficulty: "Intermediate",
      duration: "8-12 weeks",
      technologies: ["React", "Node.js", "MongoDB", "Express"],
      rating: 4.8,
      students: 1234,
      featured: true,
    },
    {
      id: "2",
      title: "Machine Learning Image Classifier",
      description: "Create an image classification system using TensorFlow and Python",
      category: "Machine Learning",
      difficulty: "Advanced",
      duration: "6-10 weeks",
      technologies: ["Python", "TensorFlow", "OpenCV", "Jupyter"],
      rating: 4.9,
      students: 856,
      featured: false,
    },
    {
      id: "3",
      title: "Mobile Weather App",
      description: "Develop a cross-platform weather application using React Native",
      category: "Mobile Development",
      difficulty: "Beginner",
      duration: "4-6 weeks",
      technologies: ["React Native", "JavaScript", "API Integration"],
      rating: 4.6,
      students: 2103,
      featured: true,
    },
    {
      id: "4",
      title: "Blockchain Voting System",
      description: "Build a secure voting system using blockchain technology",
      category: "Blockchain",
      difficulty: "Advanced",
      duration: "10-14 weeks",
      technologies: ["Solidity", "Web3.js", "Ethereum", "React"],
      rating: 4.7,
      students: 432,
      featured: false,
    },
    {
      id: "5",
      title: "Data Visualization Dashboard",
      description: "Create interactive dashboards for data analysis and visualization",
      category: "Data Science",
      difficulty: "Intermediate",
      duration: "6-8 weeks",
      technologies: ["D3.js", "Python", "Pandas", "Flask"],
      rating: 4.5,
      students: 967,
      featured: false,
    },
    {
      id: "6",
      title: "IoT Home Automation",
      description: "Design a smart home system using IoT devices and sensors",
      category: "IoT",
      difficulty: "Advanced",
      duration: "12-16 weeks",
      technologies: ["Arduino", "Raspberry Pi", "Python", "MQTT"],
      rating: 4.8,
      students: 543,
      featured: true,
    },
  ]

  const categories = [
    "all",
    "Web Development",
    "Mobile Development",
    "Machine Learning",
    "Data Science",
    "Blockchain",
    "IoT",
  ]
  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || project.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Projects</h1>
        <p className="text-muted-foreground">Discover and explore a wide variety of projects to enhance your skills</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty === "all" ? "All Levels" : difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
      </div>

      {/* Project Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {project.title}
                    {project.featured && <Badge className="ml-2 bg-yellow-100 text-yellow-800">Featured</Badge>}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">{project.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(project.difficulty)}>{project.difficulty}</Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{project.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.technologies.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{project.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{project.students.toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full bg-transparent" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters.</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedDifficulty("all")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Loading component for the Suspense boundary
function ProjectExplorerSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full md:w-48" />
          <Skeleton className="h-10 w-full md:w-48" />
        </div>
      </div>

      <Skeleton className="h-4 w-48 mb-4" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-18" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ProjectExplorerSkeleton />}>
      <ProjectExplorer />
    </Suspense>
  )
}
