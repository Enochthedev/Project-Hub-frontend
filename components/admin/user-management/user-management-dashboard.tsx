"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  Download,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { UserManagementTable } from './user-management-table'
import { UserFormDialog } from './user-form-dialog'
import { User } from '@/lib/api/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { adminApi } from '@/lib/api/admin'

interface UserManagementDashboardProps {
  className?: string
}

export function UserManagementDashboard({ className }: UserManagementDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const queryClient = useQueryClient()

  // Fetch users
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: () => adminApi.getUserStats().then(res => res.data),
    refetchInterval: 60000, // Refresh every minute
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => adminApi.createUser(userData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] })
      toast.success('User created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user')
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: any }) =>
      adminApi.updateUser(userId, userData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user')
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] })
      toast.success('User deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user')
    },
  })

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminApi.toggleUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] })
      toast.success('User status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user status')
    },
  })

  // Send verification email mutation
  const sendVerificationMutation = useMutation({
    mutationFn: (userId: string) => adminApi.sendVerificationEmail(userId),
    onSuccess: () => {
      toast.success('Verification email sent successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send verification email')
    },
  })

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ action, userIds }: { action: string; userIds: string[] }) =>
      adminApi.bulkUserAction(action, userIds),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] })
      toast.success(`Bulk ${action} completed successfully`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Bulk action failed')
    },
  })

  // Filter users based on active tab
  const filteredUsers = users.filter((user) => {
    switch (activeTab) {
      case 'students':
        return user.role === 'student'
      case 'supervisors':
        return user.role === 'supervisor'
      case 'admins':
        return user.role === 'admin'
      case 'inactive':
        return !user.isActive
      case 'unverified':
        return !user.isEmailVerified
      default:
        return true
    }
  })

  const handleCreateUser = () => {
    setSelectedUser(null)
    setShowUserDialog(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete)
      setUserToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  const handleToggleUserStatus = (userId: string, isActive: boolean) => {
    toggleStatusMutation.mutate({ userId, isActive })
  }

  const handleSendVerificationEmail = (userId: string) => {
    sendVerificationMutation.mutate(userId)
  }

  const handleBulkAction = (action: string, userIds: string[]) => {
    bulkActionMutation.mutate({ action, userIds })
  }

  const handleUserFormSubmit = async (data: any) => {
    if (selectedUser) {
      await updateUserMutation.mutateAsync({ userId: selectedUser.id, userData: data })
    } else {
      await createUserMutation.mutateAsync(data)
    }
  }

  const handleExportUsers = async (format: 'csv' | 'excel') => {
    try {
      const response = await adminApi.exportUsers(format)
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `users.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`Users exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export users')
    }
  }

  const handleRefresh = () => {
    refetchUsers()
    toast.success('User data refreshed')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, profiles, and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={usersLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportUsers('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{userStats?.growthRate || 0}%
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.totalUsers ? 
                Math.round((userStats.activeUsers / userStats.totalUsers) * 100) : 0
              }% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.inactiveUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unverified</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.unverifiedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need email verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            View and manage all user accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All Users
                <Badge variant="secondary" className="ml-2">
                  {users.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="students">
                Students
                <Badge variant="secondary" className="ml-2">
                  {userStats?.studentCount || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="supervisors">
                Supervisors
                <Badge variant="secondary" className="ml-2">
                  {userStats?.supervisorCount || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="admins">
                Admins
                <Badge variant="secondary" className="ml-2">
                  {userStats?.adminCount || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive
                <Badge variant="destructive" className="ml-2">
                  {userStats?.inactiveUsers || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unverified">
                Unverified
                <Badge variant="destructive" className="ml-2">
                  {userStats?.unverifiedUsers || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <UserManagementTable
                users={filteredUsers}
                isLoading={usersLoading}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onToggleUserStatus={handleToggleUserStatus}
                onSendVerificationEmail={handleSendVerificationEmail}
                onBulkAction={handleBulkAction}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <UserFormDialog
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        user={selectedUser}
        onSubmit={handleUserFormSubmit}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}