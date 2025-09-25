"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Plus, X } from 'lucide-react'

export default function StudentOnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const [formData, setFormData] = useState({
    // Basic Info
    studentId: '',
    department: '',
    level: '',
    
    // Skills & Interests
    skills: [] as string[],
    interests: [] as string[],
    preferredSpecializations: [] as string[],
    
    // Bio
    bio: '',
  })

  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // TODO: Update user profile with the collected information
      // This would call an API to update the user's profile
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to explore page after successful onboarding
      router.push('/explore')
    } catch (error) {
      console.error('Onboarding failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const progress = (step / totalSteps) * 100

  return (
    <main className="container py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-2">
            Complete Your Profile
          </h1>
          <p className="text-[#656176] dark:text-[#DECDF5] mb-4">
            Help us personalize your experience by telling us more about yourself
          </p>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-[#656176] dark:text-[#DECDF5] mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        <Card className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30">
          <CardHeader>
            <CardTitle className="text-[#534D56] dark:text-[#F8F1FF]">
              {step === 1 && "Basic Information"}
              {step === 2 && "Skills & Interests"}
              {step === 3 && "Tell Us About Yourself"}
            </CardTitle>
            <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
              {step === 1 && "Let's start with some basic details about your academic background"}
              {step === 2 && "What are your technical skills and areas of interest?"}
              {step === 3 && "Share a bit about yourself and your goals"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-[#534D56] dark:text-[#F8F1FF]">
                    Student ID
                  </Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="e.g., 2021/1/12345"
                    className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-[#534D56] dark:text-[#F8F1FF]">
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g., Computer Science"
                    className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#534D56] dark:text-[#F8F1FF]">Level</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                    <SelectTrigger className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#534D56] dark:text-[#F8F1FF] mb-2 block">
                      Technical Skills
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., JavaScript, Python)"
                        className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill} size="sm" className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]">
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#534D56] dark:text-[#F8F1FF] mb-2 block">
                      Areas of Interest
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest (e.g., Machine Learning, Web Development)"
                        className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      />
                      <Button onClick={addInterest} size="sm" className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]">
                          {interest}
                          <button
                            onClick={() => removeInterest(interest)}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[#534D56] dark:text-[#F8F1FF]">
                    Bio (Optional)
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself, your goals, and what you're looking for in a final year project..."
                    className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF] min-h-[120px]"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
                className="border-[#DECDF5] text-[#534D56] hover:bg-[#F8F1FF] dark:border-[#656176] dark:text-[#F8F1FF] dark:hover:bg-[#656176]"
              >
                Previous
              </Button>

              {step < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#1B998B] hover:bg-[#1B998B]/90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-[#1B998B] hover:bg-[#1B998B]/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}