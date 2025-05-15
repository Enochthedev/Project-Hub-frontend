export interface Project {
  id: string
  title: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  tags: string[]
  stack: string[]
  isGroupProject: boolean
  notes: string
}
