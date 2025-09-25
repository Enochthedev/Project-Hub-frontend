"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MultiSelect } from '@/components/ui/multi-select'
import { Upload, X, Eye, EyeOff } from 'lucide-react'
import { User, StudentProfile, SupervisorProfile } from '@/lib/api/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const userFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['student', 'supervisor', 'admin']),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  // Student profile fields
  studentName: z.string().optional(),
  studentId: z.string().optional(),
  level: z.string().optional(),
  department: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  preferredSpecializations: z.array(z.string()).optional(),
  studentBio: z.string().optional(),
  // Supervisor profile fields
  supervisorName: z.string().optional(),
  title: z.string().optional(),
  supervisorDepartment: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  researchInterests: z.array(z.string()).optional(),
  supervisorBio: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  officeLocation: z.string().optional(),
  availableSlots: z.number().min(0).optional(),
}).refine((data) => {
  // Require password for new users
  if (!data.password && !data.email) {
    return false
  }
  // Validate role-specific required fields
  if (data.role === 'student') {
    return data.studentName && data.studentId && data.department
  }
  if (data.role === 'supervisor') {
    return data.supervisorName && data.title && data.supervisorDepartment
  }
  return true
}, {
  message: "Required fields missing for selected role",
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSubmit: (data: UserFormData) => Promise<void>
  isLoading?: boolean
}

const skillOptions = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
  'Machine Learning', 'Data Science', 'Web Development', 'Mobile Development',
  'Database Design', 'UI/UX Design', 'DevOps', 'Cloud Computing'
]

const specializationOptions = [
  'Software Engineering', 'Data Science', 'Machine Learning', 'Web Development',
  'Mobile Development', 'Cybersecurity', 'Database Systems', 'Human-Computer Interaction',
  'Computer Networks', 'Artificial Intelligence', 'Computer Graphics', 'Distributed Systems'
]

const departmentOptions = [
  'Computer Science', 'Software Engineering', 'Information Technology',
  'Data Science', 'Cybersecurity', 'Information Systems'
]

const levelOptions = [
  'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Masters', 'PhD'
]

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading = false,
}: UserFormDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const isEditing = !!user

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      isActive: true,
      isEmailVerified: false,
      availableSlots: 5,
    },
  })

  const selectedRole = watch('role')

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        // Populate form with existing user data
        reset({
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          // Student profile
          studentName: user.studentProfile?.name || '',
          studentId: user.studentProfile?.studentId || '',
          level: user.studentProfile?.level || '',
          department: user.studentProfile?.department || '',
          skills: user.studentProfile?.skills || [],
          interests: user.studentProfile?.interests || [],
          preferredSpecializations: user.studentProfile?.preferredSpecializations || [],
          studentBio: user.studentProfile?.bio || '',
          // Supervisor profile
          supervisorName: user.supervisorProfile?.name || '',
          title: user.supervisorProfile?.title || '',
          supervisorDepartment: user.supervisorProfile?.department || '',
          specializations: user.supervisorProfile?.specializations || [],
          researchInterests: user.supervisorProfile?.researchInterests || [],
          supervisorBio: user.supervisorProfile?.bio || '',
          contactEmail: user.supervisorProfile?.contactEmail || '',
          officeLocation: user.supervisorProfile?.officeLocation || '',
          availableSlots: user.supervisorProfile?.availableSlots || 5,
        })
        setProfilePicture(
          user.studentProfile?.profilePicture || 
          user.supervisorProfile?.profilePicture || 
          null
        )
      } else {
        // Reset form for new user
        reset({
          isActive: true,
          isEmailVerified: false,
          availableSlots: 5,
        })
        setProfilePicture(null)
      }
    }
  }, [open, user, reset])

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update user information and profile details.'
              : 'Create a new user account with profile information.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Basic account details and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="user@university.edu"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={watch('role')}
                        onValueChange={(value) => setValue('role', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-sm text-destructive">{errors.role.message}</p>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          placeholder="Enter password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              {selectedRole === 'student' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Student Profile</CardTitle>
                    <CardDescription>
                      Student-specific information and academic details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profilePicture || undefined} />
                        <AvatarFallback>
                          {watch('studentName')?.split(' ').map(n => n[0]).join('') || 'ST'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="profile-picture">Profile Picture</Label>
                        <Input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Full Name</Label>
                        <Input
                          id="studentName"
                          {...register('studentName')}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          {...register('studentId')}
                          placeholder="CS2024001"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level">Academic Level</Label>
                        <Select
                          value={watch('level')}
                          onValueChange={(value) => setValue('level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {levelOptions.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={watch('department')}
                          onValueChange={(value) => setValue('department', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentOptions.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Skills</Label>
                      <MultiSelect
                        options={skillOptions.map(skill => ({ label: skill, value: skill }))}
                        value={watch('skills') || []}
                        onValueChange={(values) => setValue('skills', values)}
                        placeholder="Select skills"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Interests</Label>
                      <MultiSelect
                        options={skillOptions.map(interest => ({ label: interest, value: interest }))}
                        value={watch('interests') || []}
                        onValueChange={(values) => setValue('interests', values)}
                        placeholder="Select interests"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Specializations</Label>
                      <MultiSelect
                        options={specializationOptions.map(spec => ({ label: spec, value: spec }))}
                        value={watch('preferredSpecializations') || []}
                        onValueChange={(values) => setValue('preferredSpecializations', values)}
                        placeholder="Select specializations"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentBio">Bio</Label>
                      <Textarea
                        id="studentBio"
                        {...register('studentBio')}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedRole === 'supervisor' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Supervisor Profile</CardTitle>
                    <CardDescription>
                      Supervisor-specific information and research details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profilePicture || undefined} />
                        <AvatarFallback>
                          {watch('supervisorName')?.split(' ').map(n => n[0]).join('') || 'SV'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="profile-picture">Profile Picture</Label>
                        <Input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supervisorName">Full Name</Label>
                        <Input
                          id="supervisorName"
                          {...register('supervisorName')}
                          placeholder="Dr. Jane Smith"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          {...register('title')}
                          placeholder="Professor, Associate Professor, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supervisorDepartment">Department</Label>
                        <Select
                          value={watch('supervisorDepartment')}
                          onValueChange={(value) => setValue('supervisorDepartment', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentOptions.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="availableSlots">Available Slots</Label>
                        <Input
                          id="availableSlots"
                          type="number"
                          min="0"
                          {...register('availableSlots', { valueAsNumber: true })}
                          placeholder="5"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          {...register('contactEmail')}
                          placeholder="jane.smith@university.edu"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="officeLocation">Office Location</Label>
                        <Input
                          id="officeLocation"
                          {...register('officeLocation')}
                          placeholder="Building A, Room 123"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Specializations</Label>
                      <MultiSelect
                        options={specializationOptions.map(spec => ({ label: spec, value: spec }))}
                        value={watch('specializations') || []}
                        onValueChange={(values) => setValue('specializations', values)}
                        placeholder="Select specializations"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Research Interests</Label>
                      <MultiSelect
                        options={specializationOptions.map(interest => ({ label: interest, value: interest }))}
                        value={watch('researchInterests') || []}
                        onValueChange={(values) => setValue('researchInterests', values)}
                        placeholder="Select research interests"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supervisorBio">Bio</Label>
                      <Textarea
                        id="supervisorBio"
                        {...register('supervisorBio')}
                        placeholder="Research background and interests..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Account status and verification settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Account Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable user account access
                      </p>
                    </div>
                    <Switch
                      checked={watch('isActive')}
                      onCheckedChange={(checked) => setValue('isActive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Mark email as verified or unverified
                      </p>
                    </div>
                    <Switch
                      checked={watch('isEmailVerified')}
                      onCheckedChange={(checked) => setValue('isEmailVerified', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}