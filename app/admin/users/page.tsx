"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Search, Plus, Edit, Trash2, UserCheck, UserX, Shield, Activity, Download } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "supervisor" | "admin"
  status: "active" | "inactive" | "pending"
  lastActive: string
  joinedDate: string
  projectCount?: number
  studentCount?: number
}

interface UserFormData {
  name: string
  email: string
  role: "student" | "supervisor" | "admin"
  status: "active" | "inactive" | "pending"
}

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "student",
    status: "active",
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/dashboard")
      return
    }
    loadUsers()
  }, [isAuthenticated, user, router])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter, statusFilter])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockUsers: User[] = [
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice@university.edu",
          role: "student",
          status: "active",
          lastActive: "2024-01-15T10:30:00Z",
          joinedDate: "2023-09-01T00:00:00Z",
          projectCount: 2,
        },
        {
          id: "2",
          name: "Dr. Bob Smith",
          email: "bob.smith@university.edu",
          role: "supervisor",
          status: "active",
          lastActive: "2024-01-15T14:20:00Z",
          joinedDate: "2020-08-15T00:00:00Z",
          studentCount: 12,
        },
        {
          id: "3",
          name: "Carol Davis",
          email: "carol@university.edu",
          role: "student",
          status: "inactive",
          lastActive: "2024-01-10T09:15:00Z",
          joinedDate: "2023-09-01T00:00:00Z",
          projectCount: 1,
        },
        {
          id: "4",
          name: "David Wilson",
          email: "david@university.edu",
          role: "student",
          status: "pending",
          lastActive: "2024-01-14T16:45:00Z",
          joinedDate: "2024-01-14T00:00:00Z",
          projectCount: 0,
        },
      ]
      setUsers(mockUsers)
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setUserFormData({
      name: "",
      email: "",
      role: "student",
      status: "active",
    })
    setShowUserForm(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setShowUserForm(true)
  }

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Update existing user
        const updatedUsers = users.map((user) => (user.id === editingUser.id ? { ...user, ...userFormData } : user))
        setUsers(updatedUsers)
        toast.success("User updated successfully")
      } else {
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          ...userFormData,
          lastActive: new Date().toISOString(),
          joinedDate: new Date().toISOString(),
          projectCount: 0,
          studentCount: 0,
        }
        setUsers([...users, newUser])
        toast.success("User created successfully")
      }
      setShowUserForm(false)
    } catch (error) {
      toast.error("Failed to save user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setUsers(users.filter((user) => user.id !== userId))
      toast.success("User deleted successfully")
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case "activate":
          setUsers(
            users.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: "active" as const } : user)),
          )
          toast.success(`Activated ${selectedUsers.length} users`)
          break
        case "deactivate":
          setUsers(
            users.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: "inactive" as const } : user)),
          )
          toast.success(`Deactivated ${selectedUsers.length} users`)
          break
        case "delete":
          setUsers(users.filter((user) => !selectedUsers.includes(user.id)))
          toast.success(`Deleted ${selectedUsers.length} users`)
          break
      }
      setSelectedUsers([])
    } catch (error) {
      toast.error("Failed to perform bulk action")
    }
  }

  const handleExportUsers = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Status", "Last Active", "Joined Date"],
      ...filteredUsers.map((user) => [
        user.name,
        user.email,
        user.role,
        user.status,
        new Date(user.lastActive).toLocaleDateString(),
        new Date(user.joinedDate).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Users exported successfully")
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      student: "bg-blue-100 text-blue-800",
      supervisor: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    }
    return <Badge className={variants[role as keyof typeof variants]}>{role}</Badge>
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <div>Access denied</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportUsers} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Supervisors</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.role === "supervisor").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="supervisor">Supervisors</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{selectedUsers.length} user(s) selected</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers(filteredUsers.map((u) => u.id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Projects/Students</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id])
                            } else {
                              setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {user.role === "supervisor" ? `${user.studentCount} students` : `${user.projectCount} projects`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Update user information and settings" : "Add a new user to the platform"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={userFormData.role}
                  onValueChange={(value: any) => setUserFormData({ ...userFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={userFormData.status}
                  onValueChange={(value: any) => setUserFormData({ ...userFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUserForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveUser}>{editingUser ? "Update User" : "Create User"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
