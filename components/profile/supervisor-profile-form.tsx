"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, User, Mail, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { MultiSelect } from '@/components/ui/multi-select'
import { ProfilePictureUpload } from './profile-picture-upload'
import { useToast } from '@/hooks/use-toast'
import { useProfileStore } from '@/lib/stores/profile-store'
import { 
  supervisorProfileSchema, 
  SupervisorProfileFormData,
  COMPUTER_SCIENCE_SPECIALIZATIONS,
  COMPUTER_SCIENCE_INTERESTS,
  SUPERVISOR_TITLES,
  DEPARTMENTS
} from '@/lib/validations/profile'
import { SupervisorProfile } from '@/lib/api/types'

interface SupervisorProfileFormProps {
  profile: SupervisorProfile
  onSuccess?: () => void
}

export function SupervisorProfileForm({ profile, onSuccess }: SupervisorProfileFormProps) {
  const { toast } = useToast()
  const { 
    updateSupervisorProfile, 
    uploadProfilePicture, 
    deleteProfilePicture,
    isUpdating, 
    isUploadingPicture,
    error 
  } = useProfileStore()

  const form = useForm<SupervisorProfileFormData>({
    resolver: zodResolver(supervisorProfileSchema),
    defaultValues: {
      name: profile.name || '',
      title: profile.title || '',
      department: profile.department || '',
      specializations: profile.specializations || [],
      researchInterests: profile.researchInterests || [],
      bio: profile.bio || '',
      profilePicture: profile.profilePicture || null,
      contactEmail: profile.contactEmail || null,
      officeLocation: profile.officeLocation || null,
      maxStudents: profile.availableSlots || 5,
      isAvailable: profile.isAvailable !== false,
    },
  })

  const onSubmit = async (data: SupervisorProfileFormData) => {
    try {
      await updateSupervisorProfile(data)
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
            Upload a professional profile picture to help students recognize you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ProfilePictureUpload
            currentPicture={form.watch('profilePicture')}
            userName={form.watch('name') || 'Supervisor'}
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
            Your basic profile information that will be visible to students.
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
              <Label htmlFor="title">Title *</Label>
              <Select
                value={form.watch('title')}
                onValueChange={(value) => form.setValue('title', value)}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your title" />
                </SelectTrigger>
                <SelectContent>
                  {SUPERVISOR_TITLES.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Select
                value={form.watch('department')}
                onValueChange={(value) => form.setValue('department', value)}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.department && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.department.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...form.register('bio')}
              placeholder="Tell students about your background, research interests, and what you look for in students..."
              rows={4}
              disabled={isUpdating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.watch('bio')?.length || 0}/1000 characters
            </p>
            {form.formState.errors.bio && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Optional contact information for students to reach you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              {...form.register('contactEmail')}
              placeholder="your.email@ui.edu.ng"
              disabled={isUpdating}
            />
            {form.formState.errors.contactEmail && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.contactEmail.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="officeLocation">Office Location</Label>
            <Input
              id="officeLocation"
              {...form.register('officeLocation')}
              placeholder="e.g., Room 201, Computer Science Building"
              disabled={isUpdating}
            />
            {form.formState.errors.officeLocation && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.officeLocation.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
          <CardDescription>
            Your specializations and research interests to help match you with suitable students.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Specializations *</Label>
            <MultiSelect
              options={COMPUTER_SCIENCE_SPECIALIZATIONS}
              value={form.watch('specializations')}
              onChange={(value) => form.setValue('specializations', value)}
              placeholder="Select your specializations..."
              searchPlaceholder="Search specializations..."
              emptyText="No specializations found."
              maxItems={10}
              disabled={isUpdating}
            />
            {form.formState.errors.specializations && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.specializations.message}
              </p>
            )}
          </div>

          <div>
            <Label>Research Interests *</Label>
            <MultiSelect
              options={COMPUTER_SCIENCE_INTERESTS}
              value={form.watch('researchInterests')}
              onChange={(value) => form.setValue('researchInterests', value)}
              placeholder="Select your research interests..."
              searchPlaceholder="Search research interests..."
              emptyText="No research interests found."
              maxItems={15}
              disabled={isUpdating}
            />
            {form.formState.errors.researchInterests && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.researchInterests.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supervision Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supervision Settings
          </CardTitle>
          <CardDescription>
            Configure your availability and capacity for supervising students.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Available for New Students</Label>
              <p className="text-sm text-muted-foreground">
                Toggle whether you're currently accepting new students
              </p>
            </div>
            <Switch
              checked={form.watch('isAvailable')}
              onCheckedChange={(checked) => form.setValue('isAvailable', checked)}
              disabled={isUpdating}
            />
          </div>

          <div>
            <Label htmlFor="maxStudents">Maximum Students</Label>
            <Input
              id="maxStudents"
              type="number"
              min="1"
              max="20"
              {...form.register('maxStudents', { 
                setValueAs: (value) => parseInt(value) 
              })}
              placeholder="5"
              disabled={isUpdating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum number of students you can supervise simultaneously
            </p>
            {form.formState.errors.maxStudents && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.maxStudents.message}
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