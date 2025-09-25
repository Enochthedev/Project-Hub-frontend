"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Plus, X } from 'lucide-react'

export default function SupervisorOnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    department: '',
    officeLocation: '',
    contactEmail: '',
    
    // Specializations & Research
    specializations: [] as string[],
    researchInterests: [] as string[],
    
    // Bio & Availability
    bio: '',
    availableSlots: 5,
  })

  const [newSpecialization, setNewSpecialization] = useState('')
  const [newResearchInterest, setNewResearchInterest] = useState('')

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
      
      // Redirect to dashboard after successful onboarding
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }))
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== specialization)
    }))
  }

  const addResearchInterest = () => {
    if (newResearchInterest.trim() && !formData.researchInterests.includes(newResearchInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        researchInterests: [...prev.researchInterests, newResearchInterest.trim()]
      }))
      setNewResearchInterest('')
    }
  }

  const removeResearchInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      researchInterests: prev.researchInterests.filter(i => i !== interest)
    }))
  }

  const handleInputChange = (name: string, value: string | number) => {
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
            Help students find you by completing your supervisor profile
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
              {step === 2 && "Specializations & Research"}
              {step === 3 && "About You & Availability"}
            </CardTitle>
            <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
              {step === 1 && "Let's start with your basic academic and contact information"}
              {step === 2 && "What are your areas of expertise and research interests?"}
              {step === 3 && "Tell students about yourself and your availability"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#534D56] dark:text-[#F8F1FF]">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Dr., Prof., Mr., Ms."
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
                  <Label htmlFor="officeLocation" className="text-[#534D56] dark:text-[#F8F1FF]">
                    Office Location (Optional)
                  </Label>
                  <Input
                    id="officeLocation"
                    value={formData.officeLocation}
                    onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                    placeholder="e.g., Room 201, Computer Science Building"
                    className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-[#534D56] dark:text-[#F8F1FF]">
                    Contact Email (Optional)
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="Alternative email for student contact"
                    className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#534D56] dark:text-[#F8F1FF] mb-2 block">
                      Specializations
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        placeholder="Add a specialization (e.g., Machine Learning, Software Engineering)"
                        className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                        onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                      />
                      <Button onClick={addSpecialization} size="sm" className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specializations.map((specialization) => (
                        <Badge key={specialization} variant="secondary" className="bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]">
                          {specialization}
                          <button
                            onClick={() => removeSpecialization(specialization)}
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
                      Research Interests
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newResearchInterest}
                        onChange={(e) => setNewResearchInterest(e.target.value)}
                        placeholder="Add a research interest (e.g., Natural Language Processing, Cybersecurity)"
                        className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                        onKeyPress={(e) => e.key === 'Enter' && addResearchInterest()}
                      />
                      <Button onClick={addResearchInterest} size="sm" className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.researchInterests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]">
                          {interest}
                          <button
                            onClick={() => removeResearchInterest(interest)}
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
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell students about your background, research experience, and what you look for in student projects..."
                    className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF] min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableSlots" className="text-[#534D56] dark:text-[#F8F1FF]">
                    Available Student Slots
                  </Label>
                  <Input
                    id="availableSlots"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.availableSlots}
                    onChange={(e) => handleInputChange('availableSlots', parseInt(e.target.value) || 1)}
                    className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                  />
                  <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
                    How many students can you supervise this academic year?
                  </p>
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