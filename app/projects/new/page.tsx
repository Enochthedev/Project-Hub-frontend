"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Save, Eye, ArrowLeft, X, Users, Calendar, Tag, Code, Target, BookOpen } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { useToast } from "@/hooks/use-toast"

interface ProjectFormData {
  title: string
  abstract: string
  description: string
  specialization: string
  difficultyLevel: string
  tags: string[]
  requiredSkills: string[]
  learningOutcomes: string[]
  isGroupProject: boolean
  maxGroupSize?: number
  estimatedDuration: string
  applicationDeadline?: string
  prerequisites: string[]
  resources: string[]
}

const specializationOptions = [
  { value: "WebDev", label: "Web Development" },
  { value: "MobileDev", label: "Mobile Development" },
  { value: "AI", label: "Artificial Intelligence" },
  { value: "ML", label: "Machine Learning" },
  { value: "DataScience", label: "Data Science" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "IoT", label: "Internet of Things" },
  { value: "Blockchain", label: "Blockchain" },
  { value: "GameDev", label: "Game Development" },
  { value: "DevOps", label: "DevOps" },
]

const skillSuggestions = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "TypeScript",
  "Java",
  "C++",
  "SQL",
  "Machine Learning",
  "Data Analysis",
  "UI/UX Design",
  "Project Management",
  "Git",
  "Docker",
  "AWS",
  "MongoDB",
  "PostgreSQL",
  "REST APIs",
  "GraphQL",
]

const tagSuggestions = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "web",
  "api",
  "database",
  "machine-learning",
  "data-science",
  "ai",
  "blockchain",
  "iot",
  "security",
  "testing",
  "deployment",
  "cloud",
  "microservices",
  "real-time",
]

export default function NewProjectPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { createProject, isCreating } = useProjectsStore()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    abstract: "",
    description: "",
    specialization: "",
    difficultyLevel: "",
    tags: [],
    requiredSkills: [],
    learningOutcomes: [],
    isGroupProject: false,
    maxGroupSize: undefined,
    estimatedDuration: "",
    applicationDeadline: undefined,
    prerequisites: [],
    resources: [],
  })

  const [customTag, setCustomTag] = useState("")
  const [customSkill, setCustomSkill] = useState("")
  const [customOutcome, setCustomOutcome] = useState("")
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user && user.role !== "supervisor" && user.role !== "admin") {
      router.push("/")
      return
    }
  }, [isAuthenticated, user, router])

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()],
      }))
      setCustomTag("")
    }
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.requiredSkills.includes(customSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, customSkill.trim()],
      }))
      setCustomSkill("")
    }
  }

  const addCustomOutcome = () => {
    if (customOutcome.trim() && !formData.learningOutcomes.includes(customOutcome.trim())) {
      setFormData((prev) => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, customOutcome.trim()],
      }))
      setCustomOutcome("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }))
  }

  const removeOutcome = (outcome: string) => {
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((o) => o !== outcome),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.abstract.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await createProject(formData)
      toast({
        title: "Project created",
        description: "Your project has been successfully created and submitted for review.",
      })
      router.push("/projects/my-projects")
    } catch (error: any) {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>
  }

  if (user.role !== "supervisor" && user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You need supervisor or admin privileges to create projects.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Plus className="h-8 w-8" />
              Create New Project
            </h1>
            <p className="text-muted-foreground">Define a new project for students to work on</p>
          </div>
        </div>

        <Tabs value={isPreviewMode ? "preview" : "edit"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" onClick={() => setIsPreviewMode(false)}>
              Edit Project
            </TabsTrigger>
            <TabsTrigger value="preview" onClick={() => setIsPreviewMode(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Core details about your project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter a descriptive project title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="abstract">Abstract *</Label>
                    <Textarea
                      id="abstract"
                      value={formData.abstract}
                      onChange={(e) => handleInputChange("abstract", e.target.value)}
                      placeholder="Brief summary of the project (2-3 sentences)"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Comprehensive description of the project, including objectives, scope, and expected deliverables"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="specialization">Specialization *</Label>
                      <select
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        required
                      >
                        <option value="">Select specialization</option>
                        {specializationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
                      <select
                        id="difficultyLevel"
                        value={formData.difficultyLevel}
                        onChange={(e) => handleInputChange("difficultyLevel", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        required
                      >
                        <option value="">Select difficulty</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="estimatedDuration">Estimated Duration *</Label>
                    <Input
                      id="estimatedDuration"
                      value={formData.estimatedDuration}
                      onChange={(e) => handleInputChange("estimatedDuration", e.target.value)}
                      placeholder="e.g., 3-4 months, 1 semester"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags and Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags & Skills
                  </CardTitle>
                  <CardDescription>Help students find your project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Project Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Add a custom tag..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                      />
                      <Button type="button" onClick={addCustomTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {tagSuggestions.map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!formData.tags.includes(tag)) {
                              handleInputChange("tags", [...formData.tags, tag])
                            }
                          }}
                          className="text-xs"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Required Skills</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        placeholder="Add a required skill..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                      />
                      <Button type="button" onClick={addCustomSkill} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {skillSuggestions.map((skill) => (
                        <Button
                          key={skill}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!formData.requiredSkills.includes(skill)) {
                              handleInputChange("requiredSkills", [...formData.requiredSkills, skill])
                            }
                          }}
                          className="text-xs"
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Outcomes
                  </CardTitle>
                  <CardDescription>What will students learn from this project?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Learning Outcomes</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={customOutcome}
                        onChange={(e) => setCustomOutcome(e.target.value)}
                        placeholder="Add a learning outcome..."
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomOutcome())}
                      />
                      <Button type="button" onClick={addCustomOutcome} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 border rounded">
                          <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="flex-1 text-sm">{outcome}</span>
                          <button
                            type="button"
                            onClick={() => removeOutcome(outcome)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Project Settings
                  </CardTitle>
                  <CardDescription>Configure project parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isGroupProject"
                      checked={formData.isGroupProject}
                      onChange={(e) => handleInputChange("isGroupProject", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isGroupProject">This is a group project</Label>
                  </div>

                  {formData.isGroupProject && (
                    <div>
                      <Label htmlFor="maxGroupSize">Maximum Group Size</Label>
                      <Input
                        id="maxGroupSize"
                        type="number"
                        min="2"
                        max="10"
                        value={formData.maxGroupSize || ""}
                        onChange={(e) =>
                          handleInputChange("maxGroupSize", Number.parseInt(e.target.value) || undefined)
                        }
                        placeholder="e.g., 4"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="applicationDeadline">Application Deadline (Optional)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="applicationDeadline"
                        type="date"
                        value={formData.applicationDeadline || ""}
                        onChange={(e) => handleInputChange("applicationDeadline", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preview">
            {/* Project Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{formData.title || "Project Title"}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.specialization && <Badge variant="outline">{formData.specialization}</Badge>}
                  {formData.difficultyLevel && <Badge variant="outline">{formData.difficultyLevel}</Badge>}
                  {formData.isGroupProject && (
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      Group Project
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Abstract</h3>
                  <p className="text-muted-foreground">{formData.abstract || "Project abstract will appear here..."}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="whitespace-pre-wrap text-muted-foreground">
                    {formData.description || "Detailed project description will appear here..."}
                  </div>
                </div>

                {formData.learningOutcomes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Learning Outcomes</h3>
                    <ul className="space-y-1">
                      {formData.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {formData.requiredSkills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium">Duration</h4>
                    <p className="text-sm text-muted-foreground">{formData.estimatedDuration || "Not specified"}</p>
                  </div>
                  {formData.applicationDeadline && (
                    <div>
                      <h4 className="font-medium">Application Deadline</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(formData.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
