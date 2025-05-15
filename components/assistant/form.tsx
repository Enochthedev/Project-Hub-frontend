"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useProjects } from "@/components/providers/projects-provider"
import { Loader2, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

const courseLevels = [
  { value: "100", label: "100 Level (Freshman)" },
  { value: "200", label: "200 Level (Sophomore)" },
  { value: "300", label: "300 Level (Junior)" },
  { value: "400", label: "400 Level (Senior)" },
  { value: "500", label: "500 Level (Graduate)" },
]

const disciplines = [
  "Computer Science",
  "Information Technology",
  "Data Science",
  "Engineering",
  "Design",
  "Business",
  "Mathematics",
  "Physics",
  "Other",
]

export function AIAssistantForm() {
  const { generateProjects, isGenerating } = useProjects()
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    discipline: "",
    interests: "",
    tools: "",
  })
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateProjects(formData)
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const isStepComplete = () => {
    if (currentStep === 1) {
      return !!formData.name && !!formData.level
    } else if (currentStep === 2) {
      return !!formData.discipline
    }
    return true
  }

  const renderStepIndicator = () => {
    return (
      <div className="mb-6 flex items-center justify-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                currentStep > index
                  ? "bg-[#1B998B] text-white"
                  : currentStep === index + 1
                    ? "border-2 border-[#1B998B] bg-white text-[#1B998B] dark:bg-[#656176]"
                    : "border border-[#DECDF5] bg-white text-[#656176] dark:border-[#656176] dark:bg-[#656176] dark:text-[#DECDF5]"
              }`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`h-1 w-10 ${currentStep > index + 1 ? "bg-[#1B998B]" : "bg-[#DECDF5] dark:bg-[#656176]"}`}
              ></div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3 className="mb-4 text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">Tell us about yourself</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Course Level</Label>
                <Select value={formData.level} onValueChange={(value) => handleSelectChange("level", value)} required>
                  <SelectTrigger
                    id="level"
                    className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                  >
                    <SelectValue placeholder="Select your course level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]">
                    {courseLevels.map((level) => (
                      <SelectItem
                        key={level.value}
                        value={level.value}
                        className="text-[#534D56] dark:text-[#F8F1FF] focus:bg-[#DECDF5]/20 dark:focus:bg-[#656176]/50"
                      >
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <h3 className="mb-4 text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">Your academic background</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discipline">Discipline</Label>
                <Select
                  value={formData.discipline}
                  onValueChange={(value) => handleSelectChange("discipline", value)}
                  required
                >
                  <SelectTrigger
                    id="discipline"
                    className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                  >
                    <SelectValue placeholder="Select your discipline" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]">
                    {disciplines.map((discipline) => (
                      <SelectItem
                        key={discipline}
                        value={discipline}
                        className="text-[#534D56] dark:text-[#F8F1FF] focus:bg-[#DECDF5]/20 dark:focus:bg-[#656176]/50"
                      >
                        {discipline}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )
      case 3:
        return (
          <>
            <h3 className="mb-4 text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">Your interests and skills</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interests">Your Interests</Label>
                <Textarea
                  id="interests"
                  name="interests"
                  placeholder="AI, Web Development, Mobile Apps, etc."
                  value={formData.interests}
                  onChange={handleChange}
                  required
                  className="min-h-[100px] border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tools">Tools & Technologies You Know</Label>
                <Textarea
                  id="tools"
                  name="tools"
                  placeholder="JavaScript, Python, React, etc."
                  value={formData.tools}
                  onChange={handleChange}
                  required
                  className="min-h-[100px] border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                />
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {renderStepIndicator()}

      <Card className="border-[#DECDF5] bg-white/90 p-6 dark:border-[#656176] dark:bg-[#656176]/20">
        {renderStepContent()}
      </Card>

      <div className="mt-6 flex justify-between">
        {currentStep > 1 ? (
          <Button
            type="button"
            onClick={prevStep}
            variant="outline"
            className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
          >
            Back
          </Button>
        ) : (
          <div></div>
        )}

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
            className="bg-[#1B998B] hover:bg-[#1B998B]/90"
            disabled={!isStepComplete()}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            className="gap-2 bg-[#1B998B] hover:bg-[#1B998B]/90"
            disabled={isGenerating || !isStepComplete()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Project Ideas
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  )
}
