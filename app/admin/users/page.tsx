"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Search,
  MoreHorizontal,
  UserPlus,
  Download,
  Users,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "supervisor" | "admin"
  status: "active" | "inactive" | "pending"
  avatar?: string
  department?: string
  joinedAt: string
  lastActive: string
  projectCount?: number
  phone?: string
}

export default function AdminUsersPage() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@ui.edu.ng",
        role: "student",
        status: "active",
        department: "Computer Science",
        joinedAt: "2024-01-15",
        lastActive: "2024-01-20",
        projectCount: 3,
        phone: "+234 801 234 5678",
      },
      {
        id: "2",
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@ui.edu.ng",
        role: "supervisor",
        status: "active",
        department: "Computer Science",
        joinedAt: "2023-08-10",
        lastActive: "2024-01-19",
        projectCount: 12,
        phone: "+234 802 345 6789",
      },
      {
        id: "3",
        name: "Michael Johnson",
        email: "michael.johnson@ui.edu.ng",
        role: "student",
        status: "pending",
        department: "Information Systems",
        joinedAt: "2024-01-18",
        lastActive: "2024-01-18",
        projectCount: 0,
        phone: "+234 803 456 7890",
      },
      {
        id: "4",
        name: "Prof. David Brown",
        email: "david.brown@ui.edu.ng",
        role: "supervisor",
        status: "active",
        department: "Software Engineering",
        joinedAt: "2023-05-20",
        lastActive: "2024-01-20",
        projectCount: 8,
        phone: "+234 804 567 8901",
      },
      {
        id: "5",
        name: "Admin User",
        email: "admin@ui.edu.ng",
        role: "admin",
        status: "active",
        department: "IT Department",
        joinedAt: "2023-01-01",
        lastActive: "2024-01-20",
        phone: "+234 805 678 9012",
      },
    ]

    setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first")
      return
    }

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (action === "delete") {
        setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)))
        toast.success(`${selectedUsers.length} users deleted successfully`)
      } else {
        const newStatus = action === "activate" ? "active" : "inactive"
        setUsers((prev) =>
          prev.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: newStatus as any } : user)),
        )
        toast.success(`${selectedUsers.length} users ${action}d successfully`)
      }

      setSelectedUsers([])
    } catch (error) {
      toast.error(`Failed to ${action} users`)
    }
  }

  const handleCreateUser = async (userData: any) => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: "pending",
        department: userData.department,
        joinedAt: new Date().toISOString().split("T")[0],
        lastActive: new Date().toISOString().split("T")[0],
        projectCount: 0,
        phone: userData.phone,
      }

      setUsers((prev) => [...prev, newUser])
      setShowCreateDialog(false)
      toast.success("User created successfully")
    } catch (error) {
      toast.error("Failed to create user")
    }
  }

  const handleEditUser = async (userData: any) => {
    if (!editingUser) return

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? { ...user, ...userData } : user)))

      setShowEditDialog(false)
      setEditingUser(null)
      toast.success("User updated successfully")
    } catch (error) {
      toast.error("Failed to update user")
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Status", "Department", "Joined", "Projects"].join(","),
      ...filteredUsers.map((user) =>
        [
          user.name,
          user.email,
          user.role,
          user.status,
          user.department || "",
          user.joinedAt,
          user.projectCount || 0,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success("Users exported successfully")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "supervisor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">User Management</h1>
          <p className="text-[#656176] dark:text-[#DECDF5] mt-1">Manage users, roles, and permissions</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={exportUsers} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B998B] hover:bg-[#1B998B]/90 gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user to the platform</DialogDescription>
              </DialogHeader>
              <CreateUserForm onSubmit={handleCreateUser} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Total Users</p>
                <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Active Users</p>
                <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg dark:bg-yellow-900">
                <UserX className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Pending</p>
                <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
                  {users.filter((u) => u.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Supervisors</p>
                <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
                  {users.filter((u) => u.role === "supervisor").length}
                </p>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-3 mt-4 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <span className="text-sm text-blue-700 dark:text-blue-300">{selectedUsers.length} users selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                  Deactivate
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#534D56] dark:text-[#F8F1FF]">{user.name}</p>
                        <p className="text-sm text-[#656176] dark:text-[#DECDF5]">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-[#656176] dark:text-[#DECDF5]">{user.department || "-"}</TableCell>
                  <TableCell className="text-[#656176] dark:text-[#DECDF5]">{user.projectCount || 0}</TableCell>
                  <TableCell className="text-[#656176] dark:text-[#DECDF5]">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingUser(user)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No users found</p>
              <p className="text-[#656176] dark:text-[#DECDF5]">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and settings</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <EditUserForm
              user={editingUser}
              onSubmit={handleEditUser}
              onCancel={() => {
                setShowEditDialog(false)
                setEditingUser(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Create User Form Component
function CreateUserForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    department: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
    setFormData({
      name: "",
      email: "",
      role: "student",
      department: "",
      phone: "",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}>
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

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  )
}

// Edit User Form Component
function EditUserForm({
  user,
  onSubmit,
  onCancel,
}: {
  user: User
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    department: user.department || "",
    phone: user.phone || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Full Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value as any }))}
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

        <div className="space-y-2">
          <Label htmlFor="edit-status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-department">Department</Label>
        <Input
          id="edit-department"
          value={formData.department}
          onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-phone">Phone</Label>
        <Input
          id="edit-phone"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update User"}
        </Button>
      </div>
    </form>
  )
}
