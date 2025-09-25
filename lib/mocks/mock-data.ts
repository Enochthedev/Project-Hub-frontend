// Mock data for the application
export const mockProjects = [
  {
    id: "1",
    title: "AI-Powered Student Portal",
    description: "A comprehensive portal for student management with AI features",
    category: "Web Development",
    tags: ["React", "AI", "TypeScript"],
    author: {
      id: "1",
      name: "John Doe",
      email: "john@ui.edu.ng",
      role: "student",
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    status: "active",
    githubUrl: "https://github.com/johndoe/student-portal",
    liveUrl: "https://student-portal.vercel.app",
  },
  {
    id: "2",
    title: "Smart Library Management System",
    description: "Digital library system with book recommendations",
    category: "Full Stack",
    tags: ["Node.js", "MongoDB", "React"],
    author: {
      id: "2",
      name: "Jane Smith",
      email: "jane@ui.edu.ng",
      role: "student",
    },
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-18T12:00:00Z",
    status: "active",
    githubUrl: "https://github.com/janesmith/library-system",
  },
]

export const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@ui.edu.ng",
  role: "student",
  isEmailVerified: true,
  profile: {
    department: "Computer Science",
    level: "400",
    interests: ["AI", "Web Development", "Mobile Apps"],
  },
}

export const mockMilestones = [
  {
    id: "1",
    title: "Project Proposal",
    description: "Submit initial project proposal",
    dueDate: "2024-02-15T23:59:59Z",
    status: "completed",
    progress: 100,
  },
  {
    id: "2",
    title: "Literature Review",
    description: "Complete literature review and research",
    dueDate: "2024-03-01T23:59:59Z",
    status: "in_progress",
    progress: 65,
  },
]
