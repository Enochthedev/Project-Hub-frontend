"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Settings, User, Lock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useProfileStore } from '@/lib/stores/profile-store'
import { StudentProfileForm } from '@/components/profile/student-profile-form'
import { SupervisorProfileForm } from '@/components/profile/supervisor-profile-form'
import { ChangePasswordForm } from '@/components/profile/change-password-form'
import { ProfileCompletion } from '@/components/profile/profile-completion'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { 
    profile, 
    isLoading, 
    isUpdating,
    error,
    completionPercentage,
    missingFields,
    fetchProfile,
    deleteAccount,
    clearError
  } = useProfileStore()

  const [activeTab, setActiveTab] = useState('profile')
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchProfile()
  }, [isAuthenticated, fetchProfile, router])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      clearError()
    }
  }, [error, toast, clearError])

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm account deletion.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      await deleteAccount(deletePassword)
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      })
      await logout()
      router.push('/')
    } catch (error: any) {
      toast({
        title: "Deletion failed",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletePassword('')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load your profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const userProfile = profile.role === 'student' ? profile.studentProfile : profile.supervisorProfile

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-2">
          Profile Settings
        </h1>
        <p className="text-[#656176] dark:text-[#DECDF5]">
          Manage your profile information, security settings, and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Completion Sidebar */}
        <div className="lg:col-span-1">
          <ProfileCompletion
            completionPercentage={completionPercentage}
            missingFields={missingFields}
            onEditProfile={() => setActiveTab('profile')}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {userProfile ? (
                profile.role === 'student' ? (
                  <StudentProfileForm 
                    profile={userProfile}
                    onSuccess={() => {
                      toast({
                        title: "Profile updated",
                        description: "Your profile has been successfully updated.",
                      })
                    }}
                  />
                ) : (
                  <SupervisorProfileForm 
                    profile={userProfile}
                    onSuccess={() => {
                      toast({
                        title: "Profile updated",
                        description: "Your profile has been successfully updated.",
                      })
                    }}
                  />
                )
              ) : (
                <Alert>
                  <AlertDescription>
                    Your profile information is not available. Please contact support if this issue persists.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <ChangePasswordForm
                onSuccess={() => {
                  toast({
                    title: "Password changed",
                    description: "Your password has been successfully updated.",
                  })
                }}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your basic account details and status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email Address</Label>
                      <Input value={profile.email} disabled />
                    </div>
                    <div>
                      <Label>Account Type</Label>
                      <Input 
                        value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} 
                        disabled 
                      />
                    </div>
                    <div>
                      <Label>Email Verified</Label>
                      <Input 
                        value={profile.isEmailVerified ? 'Yes' : 'No'} 
                        disabled 
                      />
                    </div>
                    <div>
                      <Label>Account Status</Label>
                      <Input 
                        value={profile.isActive ? 'Active' : 'Inactive'} 
                        disabled 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions that will permanently affect your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </p>
                          <p>
                            Please enter your password to confirm account deletion:
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="delete-password">Password</Label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Enter your password"
                          disabled={isDeleting}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || !deletePassword.trim()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Account'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
