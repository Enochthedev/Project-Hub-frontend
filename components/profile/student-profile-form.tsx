"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { ProfilePictureUpload } from './profile-picture-upload'
import { useToast } from '@/hooks/use-toast'
import { useProfileStore } from '@/lib/stores/profile-store'
import { 
  studentProfileSchema, 
  StudentProfileFormData,
  COMPUTER_SCIENCE_SKILLS,
  COMPUTER_SCIENCE_INTERESTS,
  COMPUTER_SCIENCE_SPECIALIZATIONS,
  ACADEMIC_YEARS
} from '@/lib/validations/profile'
import { StudentProfile } from '@/lib/api/types'

interface StudentProfileFormProps {
  profile: StudentProfile
  onSuccess?: () => void
}

export function StudentProfileForm({ profile, onSuccess }: StudentProfileFormProps) {
  const { toast } = useToast()
  const { 
    updateStudentProfile, 
    uploadProfilePicture, 
    deleteProfilePicture,
    isUpdating, 
    isUploadingPicture,
    error 
  } = useProfileStore()

  const form = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: profile.name || '',
      skills: profile.skills || [],
      interests: profile.interests || [],
      preferredSpecializations: profile.preferredSpecializations || [],
      currentYear: profile.currentYear || null,
      gpa: profile.gpa || null,
      bio: profile.bio || '',
      profilePicture: profile.profilePicture || null,
    },
  })

  const onSubmit = async (data: StudentProfileFormData) => {
    try {
      await updateStudentProfile(data)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePictureUpload = async (file: File): Promise<string> => {
    const url = await uploadProfilePicture(file)
    form.setValue('profilePicture', url)
    return url
  }

  const handlePictureDelete = async () => {
    await deleteProfilePicture()
    form.setValue('profilePicture', null)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Upload a profile picture to help supervisors and peers recognize you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ProfilePictureUpload
            currentPicture={form.watch('profilePicture')}
            userName={form.watch('name') || 'Student'}
            onUpload={handlePictureUpload}
            onDelete={handlePictureDelete}
            isUploading={isUploadingPicture}
            disabled={isUpdating}
            size="lg"
          />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Your basic profile information that will be visible to supervisors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Enter your full name"
              disabled={isUpdating}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentYear">Current Academic Year</Label>
              <Select
                value={form.watch('currentYear')?.toString() || ''}
                onValueChange={(value) => form.setValue('currentYear', value ? parseInt(value) : null)}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your current year" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gpa">Current GPA</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min="0"
                max="5"
                {...form.register('gpa', { 
                  setValueAs: (value) => value === '' ? null : parseFloat(value) 
                })}
                placeholder="e.g., 4.50"
                disabled={isUpdating}
              />
              {form.formState.errors.gpa && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.gpa.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...form.register('bio')}
              placeholder="Tell us about yourself, your goals, and what you're passionate about..."
              rows={4}
              disabled={isUpdating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.watch('bio')?.length || 0}/500 characters
            </p>
            {form.formState.errors.bio && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills and Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Interests</CardTitle>
          <CardDescription>
            Help us match you with the most suitable projects by selecting your skills and interests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Technical Skills *</Label>
            <MultiSelect
              options={COMPUTER_SCIENCE_SKILLS}
              value={form.watch('skills')}
              onChange={(value) => form.setValue('skills', value)}
              placeholder="Select your technical skills..."
              searchPlaceholder="Search skills..."
              emptyText="No skills found."
              maxItems={20}
              disabled={isUpdating}
            />
            {form.formState.errors.skills && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.skills.message}
              </p>
            )}
          </div>

          <div>
            <Label>Areas of Interest *</Label>
            <MultiSelect
              options={COMPUTER_SCIENCE_INTERESTS}
              value={form.watch('interests')}
              onChange={(value) => form.setValue('interests', value)}
              placeholder="Select your areas of interest..."
              searchPlaceholder="Search interests..."
              emptyText="No interests found."
              maxItems={15}
              disabled={isUpdating}
            />
            {form.formState.errors.interests && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.interests.message}
              </p>
            )}
          </div>

          <div>
            <Label>Preferred Specializations *</Label>
            <MultiSelect
              options={COMPUTER_SCIENCE_SPECIALIZATIONS}
              value={form.watch('preferredSpecializations')}
              onChange={(value) => form.setValue('preferredSpecializations', value)}
              placeholder="Select your preferred specializations..."
              searchPlaceholder="Search specializations..."
              emptyText="No specializations found."
              maxItems={10}
              disabled={isUpdating}
            />
            {form.formState.errors.preferredSpecializations && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.preferredSpecializations.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isUpdating || isUploadingPicture}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
