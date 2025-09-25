"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { recommendationsApi } from "@/lib/api/recommendations"
import type { Project, ProjectSummary, Recommendation } from "@/lib/api/types"

// Legacy Project type for backward compatibility
interface LegacyProject {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  tags: string[]
  stack: string[]
  isGroupProject: boolean
  notes: string
}

interface ProjectsContextType {
  allProjects: LegacyProject[]
  savedProjects: LegacyProject[]
  generatedProjects: LegacyProject[]
  isGenerating: boolean
  saveProject: (project: LegacyProject) => void
  removeProject: (id: string) => void
  updateProjectNotes: (id: string, notes: string) => void
  generateProjects: (formData: any) => void
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const projectsStore = useProjectsStore()
  const [savedProjects, setSavedProjects] = useState<LegacyProject[]>([])
  const [generatedProjects, setGeneratedProjects] = useState<LegacyProject[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Convert API projects to legacy format for backward compatibility
  const convertToLegacyProject = (project: ProjectSummary | Project | Recommendation): LegacyProject => {
    if ('similarityScore' in project) {
      // It's a Recommendation
      return {
        id: project.projectId,
        title: project.title,
        description: project.abstract,
        category: project.specialization,
        difficulty: project.difficultyLevel,
        tags: project.matchingSkills.slice(0, 3),
        stack: project.matchingSkills,
        isGroupProject: false, // Default for recommendations
        notes: "",
      }
    } else {
      // It's a Project or ProjectSummary
      return {
        id: project.id,
        title: project.title,
        description: 'abstract' in project ? project.abstract : project.title,
        category: project.specialization,
        difficulty: project.difficultyLevel,
        tags: project.tags,
        stack: 'requiredSkills' in project ? project.requiredSkills : project.tags,
        isGroupProject: project.isGroupProject,
        notes: "",
      }
    }
  }

  // Convert store projects to legacy format
  const allProjects = projectsStore.projects.map(convertToLegacyProject)

  // Load saved projects from localStorage on initial render
  useEffect(() => {
    const savedProjectsFromStorage = localStorage.getItem("savedProjects")
    if (savedProjectsFromStorage) {
      setSavedProjects(JSON.parse(savedProjectsFromStorage))
    }
  }, [])

  // Save to localStorage whenever savedProjects changes
  useEffect(() => {
    localStorage.setItem("savedProjects", JSON.stringify(savedProjects))
  }, [savedProjects])

  // Load popular projects on mount
  useEffect(() => {
    projectsStore.getPopularProjects(12).catch(console.error)
  }, [])

  const saveProject = (project: LegacyProject) => {
    setSavedProjects((prev) => {
      if (prev.some((p) => p.id === project.id)) {
        return prev
      }
      return [...prev, project]
    })
  }

  const removeProject = (id: string) => {
    setSavedProjects((prev) => prev.filter((project) => project.id !== id))
  }

  const updateProjectNotes = (id: string, notes: string) => {
    setSavedProjects((prev) => prev.map((project) => (project.id === id ? { ...project, notes } : project)))
  }

  // Generate projects using the recommendations API
  const generateProjects = async (formData: any) => {
    setIsGenerating(true)

    try {
      // Use the recommendations API to generate projects
      const result = await recommendationsApi.generateRecommendations({
        limit: 3,
        forceRefresh: true,
      })

      // Convert recommendations to legacy project format
      const newProjects = result.recommendations.map(convertToLegacyProject)
      setGeneratedProjects(newProjects)
    } catch (error) {
      console.error('Failed to generate projects:', error)
      
      // Fallback to mock data if API fails
      const newProjects: LegacyProject[] = []

      // Project 1
      newProjects.push({
        id: `gen-${Date.now()}-1`,
        title: `${formData.interests?.split(",")[0] || "Web"} Learning Platform`,
        description: `Create an interactive learning platform focused on ${
          formData.interests?.split(",")[0] || "web development"
        }. This project will help you apply your knowledge of ${
          formData.tools?.split(",")[0] || "JavaScript"
        } and expand your skills in building educational technology. The platform should include interactive lessons, quizzes, and progress tracking.`,
        category: "Web",
        difficulty: formData.level === "freshman" || formData.level === "sophomore" ? "Beginner" : "Intermediate",
        tags: ["Education", "Web", formData.interests?.split(",")[0] || "Learning"],
        stack: formData.tools?.split(",").slice(0, 3) || ["JavaScript", "React", "Node.js"],
        isGroupProject: false,
        notes: "",
      })

      // Project 2
      newProjects.push({
        id: `gen-${Date.now()}-2`,
        title: `${formData.discipline || "Computer Science"} Data Visualization Tool`,
        description: `Build a data visualization dashboard for ${formData.discipline || "Computer Science"} students and researchers. This tool will help users understand complex datasets through interactive charts and graphs. You'll gain experience with data processing and frontend visualization libraries.`,
        category: "Data Science",
        difficulty:
          formData.level === "freshman" ? "Beginner" : formData.level === "graduate" ? "Advanced" : "Intermediate",
        tags: ["Data", "Visualization", formData.discipline || "CS"],
        stack: [...(formData.tools?.split(",").slice(0, 2) || ["Python", "JavaScript"]), "D3.js", "Chart.js"],
        isGroupProject: true,
        notes: "",
      })

      // Project 3 (if user is advanced)
      if (formData.level === "junior" || formData.level === "senior" || formData.level === "graduate") {
        newProjects.push({
          id: `gen-${Date.now()}-3`,
          title: `${formData.interests?.split(",")[1] || "Mobile"} App with AI Features`,
          description: `Develop a mobile application that incorporates AI capabilities to solve a problem in the ${formData.discipline || "Computer Science"} field. This project will challenge you to integrate machine learning models with a user-friendly interface, providing valuable experience in both AI and app development.`,
          category: "AI",
          difficulty: "Advanced",
          tags: ["AI", "Mobile", formData.discipline || "CS"],
          stack: [...(formData.tools?.split(",").slice(0, 2) || ["Python", "JavaScript"]), "TensorFlow", "React Native"],
          isGroupProject: formData.level === "graduate",
          notes: "",
        })
      }

      setGeneratedProjects(newProjects)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <ProjectsContext.Provider
      value={{
        allProjects,
        savedProjects,
        generatedProjects,
        isGenerating,
        saveProject,
        removeProject,
        updateProjectNotes,
        generateProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)

  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}
