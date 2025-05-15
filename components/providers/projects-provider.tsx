"use client"

import type React from "react"

import type { Project } from "@/types/project"
import { createContext, useContext, useEffect, useState } from "react"

// Sample project data
const sampleProjects: Project[] = [
  {
    id: "1",
    title: "AI-Powered Study Assistant",
    description:
      "Create a web application that uses natural language processing to help students study more effectively. The app can analyze study materials, generate practice questions, and provide personalized learning recommendations.",
    category: "AI",
    difficulty: "Intermediate",
    tags: ["AI", "Web", "Education"],
    stack: ["React", "Python", "TensorFlow", "Flask"],
    isGroupProject: false,
    notes: "",
  },
  {
    id: "2",
    title: "Campus Navigation App",
    description:
      "Develop a mobile application that helps students navigate their campus. Include features like indoor mapping, class schedule integration, and the ability to find the shortest path between buildings.",
    category: "Mobile",
    difficulty: "Intermediate",
    tags: ["Mobile", "Maps", "UI/UX"],
    stack: ["React Native", "Firebase", "Google Maps API"],
    isGroupProject: true,
    notes: "",
  },
  {
    id: "3",
    title: "Student Budget Tracker",
    description:
      "Build a financial management tool specifically designed for students. Include features for tracking expenses, setting budget goals, and visualizing spending patterns.",
    category: "Web",
    difficulty: "Beginner",
    tags: ["Web", "Finance", "Dashboard"],
    stack: ["JavaScript", "Chart.js", "MongoDB", "Express"],
    isGroupProject: false,
    notes: "",
  },
  {
    id: "4",
    title: "Blockchain-based Academic Credential System",
    description:
      "Create a system that uses blockchain technology to securely store and verify academic credentials. This can help prevent credential fraud and simplify the verification process for employers.",
    category: "Blockchain",
    difficulty: "Advanced",
    tags: ["Blockchain", "Security", "Education"],
    stack: ["Solidity", "Ethereum", "Web3.js", "React"],
    isGroupProject: true,
    notes: "",
  },
  {
    id: "5",
    title: "Smart Campus IoT System",
    description:
      "Design an IoT system that enhances campus facilities. This could include smart lighting, occupancy monitoring for study spaces, or environmental monitoring for research labs.",
    category: "IoT",
    difficulty: "Advanced",
    tags: ["IoT", "Hardware", "Cloud"],
    stack: ["Arduino", "Raspberry Pi", "MQTT", "AWS IoT"],
    isGroupProject: true,
    notes: "",
  },
  {
    id: "6",
    title: "Collaborative Research Platform",
    description:
      "Develop a platform that facilitates collaboration among student researchers. Include features for sharing papers, discussing findings, and connecting with potential collaborators.",
    category: "Web",
    difficulty: "Intermediate",
    tags: ["Web", "Research", "Collaboration"],
    stack: ["Next.js", "PostgreSQL", "GraphQL", "Tailwind CSS"],
    isGroupProject: true,
    notes: "",
  },
  {
    id: "7",
    title: "AR Campus Tour Guide",
    description:
      "Create an augmented reality application that provides an interactive tour of your campus. Include historical information, points of interest, and fun facts about buildings and landmarks.",
    category: "Mobile",
    difficulty: "Advanced",
    tags: ["AR", "Mobile", "3D"],
    stack: ["Unity", "ARKit", "ARCore", "C#"],
    isGroupProject: false,
    notes: "",
  },
  {
    id: "8",
    title: "Student Skill Exchange Marketplace",
    description:
      "Build a platform where students can exchange skills and services. For example, a computer science student could offer programming help in exchange for language tutoring from a linguistics student.",
    category: "Web",
    difficulty: "Intermediate",
    tags: ["Web", "Marketplace", "Community"],
    stack: ["React", "Node.js", "MongoDB", "Express"],
    isGroupProject: false,
    notes: "",
  },
  {
    id: "9",
    title: "Personalized Learning Path Generator",
    description:
      "Create an application that generates personalized learning paths for students based on their goals, current knowledge, and learning style. Use AI to recommend resources and track progress.",
    category: "AI",
    difficulty: "Intermediate",
    tags: ["AI", "Education", "Personalization"],
    stack: ["Python", "React", "TensorFlow", "FastAPI"],
    isGroupProject: false,
    notes: "",
  },
  {
    id: "10",
    title: "Sustainable Campus Initiative Tracker",
    description:
      "Develop a platform to track and visualize sustainability initiatives on campus. Include features for measuring carbon footprint reduction, waste management, and energy conservation.",
    category: "Web",
    difficulty: "Beginner",
    tags: ["Web", "Sustainability", "Data Visualization"],
    stack: ["Vue.js", "D3.js", "Node.js", "MongoDB"],
    isGroupProject: true,
    notes: "",
  },
  {
    id: "11",
    title: "Peer-to-Peer Textbook Exchange",
    description:
      "Build a marketplace app specifically for students to buy, sell, or trade textbooks. Include features like barcode scanning, price comparison with online retailers, and campus-specific listings.",
    category: "Mobile",
    difficulty: "Intermediate",
    tags: ["Mobile", "Marketplace", "Education"],
    stack: ["Flutter", "Firebase", "Google Books API"],
    isGroupProject: false,
    notes: "",
  },
  {
    id: "12",
    title: "Virtual Study Group Platform",
    description:
      "Create a platform for students to form and participate in virtual study groups. Include features like video conferencing, shared notes, flashcards, and scheduling tools.",
    category: "Web",
    difficulty: "Intermediate",
    tags: ["Web", "Education", "Collaboration"],
    stack: ["React", "WebRTC", "Socket.io", "Express"],
    isGroupProject: true,
    notes: "",
  },
]

interface ProjectsContextType {
  allProjects: Project[]
  savedProjects: Project[]
  generatedProjects: Project[]
  isGenerating: boolean
  saveProject: (project: Project) => void
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
  const [allProjects, setAllProjects] = useState<Project[]>(sampleProjects)
  const [savedProjects, setSavedProjects] = useState<Project[]>([])
  const [generatedProjects, setGeneratedProjects] = useState<Project[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

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

  const saveProject = (project: Project) => {
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

  // This function simulates generating projects with AI
  // In a real application, this would call an API
  const generateProjects = (formData: any) => {
    setIsGenerating(true)

    // Simulate API call delay
    setTimeout(() => {
      // Generate 2-3 project ideas based on the form data
      const newProjects: Project[] = []

      // Project 1
      newProjects.push({
        id: `gen-${Date.now()}-1`,
        title: `${formData.interests.split(",")[0]} Learning Platform`,
        description: `Create an interactive learning platform focused on ${
          formData.interests.split(",")[0]
        }. This project will help you apply your knowledge of ${
          formData.tools.split(",")[0]
        } and expand your skills in building educational technology. The platform should include interactive lessons, quizzes, and progress tracking.`,
        category: "Web",
        difficulty: formData.level === "freshman" || formData.level === "sophomore" ? "Beginner" : "Intermediate",
        tags: ["Education", "Web", formData.interests.split(",")[0]],
        stack: formData.tools.split(",").slice(0, 3),
        isGroupProject: false,
        notes: "",
      })

      // Project 2
      newProjects.push({
        id: `gen-${Date.now()}-2`,
        title: `${formData.discipline} Data Visualization Tool`,
        description: `Build a data visualization dashboard for ${formData.discipline} students and researchers. This tool will help users understand complex datasets through interactive charts and graphs. You'll gain experience with data processing and frontend visualization libraries.`,
        category: "Data Science",
        difficulty:
          formData.level === "freshman" ? "Beginner" : formData.level === "graduate" ? "Advanced" : "Intermediate",
        tags: ["Data", "Visualization", formData.discipline],
        stack: [...formData.tools.split(",").slice(0, 2), "D3.js", "Chart.js"],
        isGroupProject: true,
        notes: "",
      })

      // Project 3 (if user is advanced)
      if (formData.level === "junior" || formData.level === "senior" || formData.level === "graduate") {
        newProjects.push({
          id: `gen-${Date.now()}-3`,
          title: `${formData.interests.split(",")[1] || "Mobile"} App with AI Features`,
          description: `Develop a mobile application that incorporates AI capabilities to solve a problem in the ${formData.discipline} field. This project will challenge you to integrate machine learning models with a user-friendly interface, providing valuable experience in both AI and app development.`,
          category: "AI",
          difficulty: "Advanced",
          tags: ["AI", "Mobile", formData.discipline],
          stack: [...formData.tools.split(",").slice(0, 2), "TensorFlow", "React Native"],
          isGroupProject: formData.level === "graduate",
          notes: "",
        })
      }

      setGeneratedProjects(newProjects)
      setIsGenerating(false)
    }, 2000)
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
