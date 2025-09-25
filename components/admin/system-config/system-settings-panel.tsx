"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  Mail,
  Database,
  Shield,
  Globe,
  Bell,
  Users,
  FileText,
  Calendar,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const systemSettingsSchema = z.object({
  // General Settings
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().optional(),
  siteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  adminEmail: z.string().email('Invalid email address'),
  supportEmail: z.string().email('Invalid email address'),
  maintenanceMode: z.boolean(),
  registrationEnabled: z.boolean(),
  emailVerificationRequired: z.boolean(),
  
  // Security Settings
  sessionTimeout: z.number().min(5).max(1440), // 5 minutes to 24 hours
  maxLoginAttempts: z.number().min(1).max(10),
  passwordMinLength: z.number().min(6).max(50),
  requireStrongPasswords: z.boolean(),
  twoFactorEnabled: z.boolean(),
  
  // Email Settings
  emailProvider: z.enum(['smtp', 'sendgrid', 'mailgun']),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  emailFromName: z.string().min(1, 'From name is required'),
  emailFromAddress: z.string().email('Invalid email address'),
  
  // Notification Settings
  emailNotificationsEnabled: z.boolean(),
  pushNotificationsEnabled: z.boolean(),
  smsNotificationsEnabled: z.boolean(),
  notificationRetentionDays: z.number().min(1).max(365),
  
  // Content Settings
  maxProjectsPerSupervisor: z.number().min(1).max(50),
  maxStudentsPerProject: z.number().min(1).max(10),
  projectSubmissionDeadline: z.string().optional(),
  autoApproveProjects: z.boolean(),
  contentModerationEnabled: z.boolean(),
  
  // System Limits
  maxFileUploadSize: z.number().min(1).max(100), // MB
  maxUsersPerOrganization: z.number().min(10).max(10000),
  apiRateLimit: z.number().min(10).max(10000), // requests per hour
  
  // Backup Settings
  autoBackupEnabled: z.boolean(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']),
  backupRetentionDays: z.number().min(7).max(365),
})

type SystemSettingsData = z.infer<typeof systemSettingsSchema>

interface SystemSettingsPanelProps {
  settings: Partial<SystemSettingsData>
  onSave: (settings: SystemSettingsData) => Promise<void>
  onReset: () => Promise<void>
  isLoading?: boolean
  className?: string
}

export function SystemSettingsPanel({
  settings,
  onSave,
  onReset,
  isLoading = false,
  className,
}: SystemSettingsPanelProps) {
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SystemSettingsData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      siteName: 'FYP Management System',
      adminEmail: 'admin@university.edu',
      supportEmail: 'support@university.edu',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPasswords: true,
      twoFactorEnabled: false,
      emailProvider: 'smtp',
      emailFromName: 'FYP Management System',
      emailFromAddress: 'noreply@university.edu',
      emailNotificationsEnabled: true,
      pushNotificationsEnabled: true,
      smsNotificationsEnabled: false,
      notificationRetentionDays: 30,
      maxProjectsPerSupervisor: 10,
      maxStudentsPerProject: 1,
      autoApproveProjects: false,
      contentModerationEnabled: true,
      maxFileUploadSize: 10,
      maxUsersPerOrganization: 1000,
      apiRateLimit: 1000,
      autoBackupEnabled: true,
      backupFrequency: 'daily',
      backupRetentionDays: 30,
      ...settings,
    },
  })

  const handleFormSubmit = async (data: SystemSettingsData) => {
    try {
      await onSave(data)
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const handleReset = async () => {
    try {
      await onReset()
      reset()
      setShowResetDialog(false)
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const emailProvider = watch('emailProvider')

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowResetDialog(true)}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isLoading || !isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic site configuration and general settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      {...register('siteName')}
                      placeholder="FYP Management System"
                    />
                    {errors.siteName && (
                      <p className="text-sm text-destructive">{errors.siteName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      {...register('siteUrl')}
                      placeholder="https://fyp.university.edu"
                    />
                    {errors.siteUrl && (
                      <p className="text-sm text-destructive">{errors.siteUrl.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    {...register('siteDescription')}
                    placeholder="Final Year Project Management System for University"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      {...register('adminEmail')}
                      placeholder="admin@university.edu"
                    />
                    {errors.adminEmail && (
                      <p className="text-sm text-destructive">{errors.adminEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      {...register('supportEmail')}
                      placeholder="support@university.edu"
                    />
                    {errors.supportEmail && (
                      <p className="text-sm text-destructive">{errors.supportEmail.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode to prevent user access
                      </p>
                    </div>
                    <Switch
                      checked={watch('maintenanceMode')}
                      onCheckedChange={(checked) => setValue('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to register accounts
                      </p>
                    </div>
                    <Switch
                      checked={watch('registrationEnabled')}
                      onCheckedChange={(checked) => setValue('registrationEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Verification Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Require email verification for new accounts
                      </p>
                    </div>
                    <Switch
                      checked={watch('emailVerificationRequired')}
                      onCheckedChange={(checked) => setValue('emailVerificationRequired', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure authentication and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="1440"
                      {...register('sessionTimeout', { valueAsNumber: true })}
                    />
                    {errors.sessionTimeout && (
                      <p className="text-sm text-destructive">{errors.sessionTimeout.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="1"
                      max="10"
                      {...register('maxLoginAttempts', { valueAsNumber: true })}
                    />
                    {errors.maxLoginAttempts && (
                      <p className="text-sm text-destructive">{errors.maxLoginAttempts.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="50"
                    {...register('passwordMinLength', { valueAsNumber: true })}
                  />
                  {errors.passwordMinLength && (
                    <p className="text-sm text-destructive">{errors.passwordMinLength.message}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Strong Passwords</Label>
                      <p className="text-sm text-muted-foreground">
                        Enforce uppercase, lowercase, numbers, and special characters
                      </p>
                    </div>
                    <Switch
                      checked={watch('requireStrongPasswords')}
                      onCheckedChange={(checked) => setValue('requireStrongPasswords', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable 2FA for enhanced security
                      </p>
                    </div>
                    <Switch
                      checked={watch('twoFactorEnabled')}
                      onCheckedChange={(checked) => setValue('twoFactorEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure email delivery settings and SMTP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailProvider">Email Provider</Label>
                    <Select
                      value={watch('emailProvider')}
                      onValueChange={(value) => setValue('emailProvider', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailFromName">From Name</Label>
                    <Input
                      id="emailFromName"
                      {...register('emailFromName')}
                      placeholder="FYP Management System"
                    />
                    {errors.emailFromName && (
                      <p className="text-sm text-destructive">{errors.emailFromName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailFromAddress">From Email Address</Label>
                  <Input
                    id="emailFromAddress"
                    type="email"
                    {...register('emailFromAddress')}
                    placeholder="noreply@university.edu"
                  />
                  {errors.emailFromAddress && (
                    <p className="text-sm text-destructive">{errors.emailFromAddress.message}</p>
                  )}
                </div>

                {emailProvider === 'smtp' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium">SMTP Configuration</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="smtpHost">SMTP Host</Label>
                          <Input
                            id="smtpHost"
                            {...register('smtpHost')}
                            placeholder="smtp.gmail.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="smtpPort">SMTP Port</Label>
                          <Input
                            id="smtpPort"
                            type="number"
                            {...register('smtpPort', { valueAsNumber: true })}
                            placeholder="587"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="smtpUsername">SMTP Username</Label>
                          <Input
                            id="smtpUsername"
                            {...register('smtpUsername')}
                            placeholder="username@gmail.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="smtpPassword">SMTP Password</Label>
                          <Input
                            id="smtpPassword"
                            type="password"
                            {...register('smtpPassword')}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification delivery and retention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={watch('emailNotificationsEnabled')}
                      onCheckedChange={(checked) => setValue('emailNotificationsEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={watch('pushNotificationsEnabled')}
                      onCheckedChange={(checked) => setValue('pushNotificationsEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={watch('smsNotificationsEnabled')}
                      onCheckedChange={(checked) => setValue('smsNotificationsEnabled', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="notificationRetentionDays">Notification Retention (days)</Label>
                  <Input
                    id="notificationRetentionDays"
                    type="number"
                    min="1"
                    max="365"
                    {...register('notificationRetentionDays', { valueAsNumber: true })}
                  />
                  {errors.notificationRetentionDays && (
                    <p className="text-sm text-destructive">{errors.notificationRetentionDays.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Configure content limits and moderation policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxProjectsPerSupervisor">Max Projects per Supervisor</Label>
                    <Input
                      id="maxProjectsPerSupervisor"
                      type="number"
                      min="1"
                      max="50"
                      {...register('maxProjectsPerSupervisor', { valueAsNumber: true })}
                    />
                    {errors.maxProjectsPerSupervisor && (
                      <p className="text-sm text-destructive">{errors.maxProjectsPerSupervisor.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxStudentsPerProject">Max Students per Project</Label>
                    <Input
                      id="maxStudentsPerProject"
                      type="number"
                      min="1"
                      max="10"
                      {...register('maxStudentsPerProject', { valueAsNumber: true })}
                    />
                    {errors.maxStudentsPerProject && (
                      <p className="text-sm text-destructive">{errors.maxStudentsPerProject.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectSubmissionDeadline">Project Submission Deadline</Label>
                  <Input
                    id="projectSubmissionDeadline"
                    type="date"
                    {...register('projectSubmissionDeadline')}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-approve Projects</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve new project submissions
                      </p>
                    </div>
                    <Switch
                      checked={watch('autoApproveProjects')}
                      onCheckedChange={(checked) => setValue('autoApproveProjects', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Content Moderation</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable content moderation for user submissions
                      </p>
                    </div>
                    <Switch
                      checked={watch('contentModerationEnabled')}
                      onCheckedChange={(checked) => setValue('contentModerationEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Limits</CardTitle>
                <CardDescription>
                  Configure system limits and performance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
                    <Input
                      id="maxFileUploadSize"
                      type="number"
                      min="1"
                      max="100"
                      {...register('maxFileUploadSize', { valueAsNumber: true })}
                    />
                    {errors.maxFileUploadSize && (
                      <p className="text-sm text-destructive">{errors.maxFileUploadSize.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxUsersPerOrganization">Max Users per Organization</Label>
                    <Input
                      id="maxUsersPerOrganization"
                      type="number"
                      min="10"
                      max="10000"
                      {...register('maxUsersPerOrganization', { valueAsNumber: true })}
                    />
                    {errors.maxUsersPerOrganization && (
                      <p className="text-sm text-destructive">{errors.maxUsersPerOrganization.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    min="10"
                    max="10000"
                    {...register('apiRateLimit', { valueAsNumber: true })}
                  />
                  {errors.apiRateLimit && (
                    <p className="text-sm text-destructive">{errors.apiRateLimit.message}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Backup Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable automatic system backups
                      </p>
                    </div>
                    <Switch
                      checked={watch('autoBackupEnabled')}
                      onCheckedChange={(checked) => setValue('autoBackupEnabled', checked)}
                    />
                  </div>

                  {watch('autoBackupEnabled') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                        <Select
                          value={watch('backupFrequency')}
                          onValueChange={(value) => setValue('backupFrequency', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="backupRetentionDays">Backup Retention (days)</Label>
                        <Input
                          id="backupRetentionDays"
                          type="number"
                          min="7"
                          max="365"
                          {...register('backupRetentionDays', { valueAsNumber: true })}
                        />
                        {errors.backupRetentionDays && (
                          <p className="text-sm text-destructive">{errors.backupRetentionDays.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reset to Default Settings
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all settings to their default values?
              This action cannot be undone and will overwrite all current configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
