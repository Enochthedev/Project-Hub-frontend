"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  User,
  Save,
  ArrowLeft,
  Plus,
  X,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useProfileStore } from "@/lib/stores/profile-store"
import { useToast } from "@/hooks/use-toast"

interface SkillOption {
  value: string
  label: string
  category: string
}

interface InterestOption {
  value: string
  label: string
}

const skillOptions: SkillOption[] = [
  { value: "javascript", label: "JavaScript", category: "Programming" },
  { value: "python", label: "Python", category: "Programming" },
  { value: "react", label: "React", category: "Frontend" },
  { value: "nodejs", label: "Node.js", category: "Backend" },
  { value: "machine-learning", label: "Machine Learning", category: "AI/ML" },
  { value: "data-analysis", label: "Data Analysis", category: "Data Science" },
  { value: "ui-design", label: "UI Design", category: "Design" },
  { value: "project-management", label: "Project Management", category: "Management" },
]

const interestOptions: InterestOption[] = [
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "artificial-intelligence", label: "Artificial Intelligence" },
  { value: "data-science", label: "Data Science" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "blockchain", label: "Blockchain" },
  { value: "game-development", label: "Game Development" },
  { value: "iot", label: "Internet of Things" },
]

export default function ProfileEditPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { profile, updateProfile, isUpdating } = useProfileStore()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [] as string[],
    interests: [] as string[],
    education: {
      degree: "",
      institution: "",
      graduationYear: "",
      gpa: "",
    },
    experience: {
      level: "",
      previousProjects: "",
      workExperience: "",
    },
    preferences: {
      projectTypes: [] as string[],
      workingStyle: "",
      availability: "",
    },
  })

  const [customSkill, setCustomSkill] = useState("")
  const [customInterest, setCustomInterest] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (profile) {
      const userProfile = profile.role === "student" ? profile.studentProfile : profile.supervisorProfile
      if (userProfile) {
        setFormData({
          firstName: userProfile.firstName || "",
          lastName: userProfile.lastName || "",
          email: profile.email || "",
          phone: userProfile.phone || "",
          location: userProfile.location || "",
          bio: userProfile.bio || "",
          skills: userProfile.skills || [],
          interests: userProfile.interests || [],
          education: {
            degree: userProfile.education?.degree || "",
            institution: userProfile.education?.institution || "",
            graduationYear: userProfile.education?.graduationYear || "",
            gpa: userProfile.education?.gpa || "",
          },
          experience: {
            level: userProfile.experience?.level || "",
            previousProjects: userProfile.experience?.previousProjects || "",
            workExperience: userProfile.experience?.workExperience || "",
          },
          preferences: {
            projectTypes: userProfile.preferences?.projectTypes || [],
            workingStyle: userProfile.preferences?.workingStyle || "",
            availability: userProfile.preferences?.availability || "",
          },
        })
      }
    }
  }, [isAuthenticated, profile, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNestedInputChange = (section: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value,
      },
    }))
  }

  const handleSkillsChange = (skills: string[]) => {
    setFormData((prev) => ({
      ...prev,
      skills,
    }))
  }

  const handleInterestsChange = (interests: string[]) => {
    setFormData((prev) => ({
      ...prev,
      interests,
    }))
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, customSkill.trim()],
      }))
      setCustomSkill("")
    }
  }

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, customInterest.trim()],
      }))
      setCustomInterest("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateProfile(formData)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
      router.push("/profile")
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated || !user || !profile) {
    return <div>Loading...</div>
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
              <User className="h-8 w-8" />
              Edit Profile
            </h1>
            <p className="text-muted-foreground">Update your profile information and preferences</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="pl-10"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
              <CardDescription>Add your technical and soft skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Skills</Label>
                <MultiSelect
                  options={skillOptions.map((skill) => ({ value: skill.value, label: skill.label }))}
                  selected={formData.skills}
                  onChange={handleSkillsChange}
                  placeholder="Select your skills..."
                />
              </div>

              <div>
                <Label>Add Custom Skill</Label>
                <div className="flex gap-2">
                  <Input
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Enter a custom skill..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                  />
                  <Button type="button" onClick={addCustomSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Interests & Preferences</CardTitle>
              <CardDescription>Areas you're interested in exploring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Interests</Label>
                <MultiSelect
                  options={interestOptions}
                  selected={formData.interests}
                  onChange={handleInterestsChange}
                  placeholder="Select your interests..."
                />
              </div>

              <div>
                <Label>Add Custom Interest</Label>
                <div className="flex gap-2">
                  <Input
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    placeholder="Enter a custom interest..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                  />
                  <Button type="button" onClick={addCustomInterest} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <Badge key={interest} variant="outline" className="flex items-center gap-1">
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
              <CardDescription>Your educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={formData.education.degree}
                    onChange={(e) => handleNestedInputChange("education", "degree", e.target.value)}
                    placeholder="e.g., Bachelor of Computer Science"
                  />
                </div>
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={formData.education.institution}
                    onChange={(e) => handleNestedInputChange("education", "institution", e.target.value)}
                    placeholder="University name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="graduationYear"
                      value={formData.education.graduationYear}
                      onChange={(e) => handleNestedInputChange("education", "graduationYear", e.target.value)}
                      className="pl-10"
                      placeholder="2024"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="gpa">GPA (Optional)</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="gpa"
                      value={formData.education.gpa}
                      onChange={(e) => handleNestedInputChange("education", "gpa", e.target.value)}
                      className="pl-10"
                      placeholder="3.8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experience
              </CardTitle>
              <CardDescription>Your professional and project experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="level">Experience Level</Label>
                <select
                  id="level"
                  value={formData.experience.level}
                  onChange={(e) => handleNestedInputChange("experience", "level", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <Label htmlFor="previousProjects">Previous Projects</Label>
                <Textarea
                  id="previousProjects"
                  value={formData.experience.previousProjects}
                  onChange={(e) => handleNestedInputChange("experience", "previousProjects", e.target.value)}
                  placeholder="Describe your previous projects..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="workExperience">Work Experience</Label>
                <Textarea
                  id="workExperience"
                  value={formData.experience.workExperience}
                  onChange={(e) => handleNestedInputChange("experience", "workExperience", e.target.value)}
                  placeholder="Describe your work experience..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
