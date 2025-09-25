"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Download,
  Mail,
  Shield,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  projectsCount?: number
  studentsCount?: number
}

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
    projectsCount: 2,
  },
  {
    id: "2",
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@ui.edu.ng",
    role: "supervisor",
    status: "active",
    department: "Computer Science",
    joinedAt: "2023-09-01",
    lastActive: "2024-01-19",
    studentsCount: 8,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@ui.edu.ng",
    role: "student",
    status: "pending",
    department: "Engineering",
    joinedAt: "2024-01-18",
    lastActive: "2024-01-18",
    projectsCount: 0,
  },
  {
    id: "4",
    name: "Prof. David Brown",
    email: "david.brown@ui.edu.ng",
    role: "supervisor",
    status: "active",
    department: "Mathematics",
    joinedAt: "2023-08-15",
    lastActive: "2024-01-17",
    studentsCount: 12,
  },
  {
    id: "5",
    name: "Admin User",
    email: "admin@ui.edu.ng",
    role: "admin",
    status: "active",
    department: "Administration",
    joinedAt: "2023-01-01",
    lastActive: "2024-01-20",
  },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Filter users based on search and filters
  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter, statusFilter])

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

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    const selectedUserNames = users
      .filter((user) => selectedUsers.includes(user.id))
      .map((user) => user.name)
      .join(", ")

    switch (action) {
      case "activate":
        setUsers((prev) =>
          prev.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: "active" as const } : user)),
        )
        toast({
          title: "Users Activated",
          description: `Successfully activated: ${selectedUserNames}`,
        })
        break
      case "deactivate":
        setUsers((prev) =>
          prev.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: "inactive" as const } : user)),
        )
        toast({
          title: "Users Deactivated",
          description: `Successfully deactivated: ${selectedUserNames}`,
        })
        break
      case "delete":
        setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)))
        toast({
          title: "Users Deleted",
          description: `Successfully deleted: ${selectedUserNames}`,
          variant: "destructive",
        })
        break
    }
    setSelectedUsers([])
  }

  const handleCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || "",
      email: userData.email || "",
      role: userData.role || "student",
      status: "pending",
      department: userData.department || "",
      joinedAt: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString().split("T")[0],
      projectsCount: 0,
      studentsCount: 0,
    }

    setUsers((prev) => [...prev, newUser])
    setIsCreateDialogOpen(false)
    toast({
      title: "User Created",
      description: `Successfully created user: ${newUser.name}`,
    })
  }

  const handleEditUser = (userData: Partial<User>) => {
    if (!editingUser) return

    setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? { ...user, ...userData } : user)))
    setEditingUser(null)
    toast({
      title: "User Updated",
      description: `Successfully updated user: ${userData.name}`,
    })
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    setUsers((prev) => prev.filter((user) => user.id !== userId))
    toast({
      title: "User Deleted",
      description: `Successfully deleted user: ${user?.name}`,
      variant: "destructive",
    })
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Status", "Department", "Joined", "Last Active"],
      ...filteredUsers.map((user) => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.department || "",
        user.joinedAt,
        user.lastActive,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "User data has been exported to CSV",
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <GraduationCap className="h-4 w-4" />
      case "supervisor":
        return <BookOpen className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Statistics
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === "active").length
  const pendingUsers = users.filter((u) => u.status === "pending").length
  const supervisors = users.filter((u) => u.role === "supervisor").length

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">User Management</h1>
          <p className="text-[#656176] dark:text-[#DECDF5]">Manage users, roles, and permissions</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="border-[#DECDF5] text-[#534D56] hover:bg-[#F8F1FF] dark:border-[#656176] dark:text-[#F8F1FF] dark:hover:bg-[#656176] bg-transparent"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <UserFormDialog onSubmit={handleCreateUser} onCancel={() => setIsCreateDialogOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#DECDF5] dark:border-[#656176]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#656176] dark:text-[#DECDF5]">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[#1B998B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-[#DECDF5] dark:border-[#656176]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#656176] dark:text-[#DECDF5]">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-[#DECDF5] dark:border-[#656176]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#656176] dark:text-[#DECDF5]">Pending Users</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">{pendingUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-[#DECDF5] dark:border-[#656176]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#656176] dark:text-[#DECDF5]">Supervisors</CardTitle>
            <BookOpen className="h-4 w-4 text-[#1B998B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">{supervisors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-[#DECDF5] dark:border-[#656176]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656176] dark:text-[#DECDF5]" />
              <Input
                placeholder="Search users by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#DECDF5] dark:border-[#656176]"
              />
            </div>

            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32 border-[#DECDF5] dark:border-[#656176]">
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
                <SelectTrigger className="w-32 border-[#DECDF5] dark:border-[#656176]">
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
            <div className="flex items-center gap-2 p-3 bg-[#F8F1FF] dark:bg-[#656176]/30 rounded-lg">
              <span className="text-sm text-[#534D56] dark:text-[#F8F1FF]">
                {selectedUsers.length} user(s) selected
              </span>

              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("activate")}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <UserCheck className="mr-1 h-3 w-3" />
                  Activate
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("deactivate")}
                  className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                >
                  <UserX className="mr-1 h-3 w-3" />
                  Deactivate
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedUsers.length} user(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction("delete")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="rounded-md border border-[#DECDF5] dark:border-[#656176]">
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
                  <TableHead>Joined</TableHead>
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
                          <AvatarFallback className="bg-[#F8F1FF] text-[#534D56] dark:bg-[#656176] dark:text-[#F8F1FF]">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-[#534D56] dark:text-[#F8F1FF]">{user.name}</div>
                          <div className="text-sm text-[#656176] dark:text-[#DECDF5]">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="capitalize text-[#534D56] dark:text-[#F8F1FF]">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <Badge variant={getStatusBadgeVariant(user.status) as any}>{user.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#534D56] dark:text-[#F8F1FF]">{user.department}</TableCell>
                    <TableCell className="text-[#656176] dark:text-[#DECDF5]">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </TableCell>
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditingUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-[#656176] dark:text-[#DECDF5] mb-4" />
              <h3 className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF] mb-2">No users found</h3>
              <p className="text-[#656176] dark:text-[#DECDF5]">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <UserFormDialog user={editingUser} onSubmit={handleEditUser} onCancel={() => setEditingUser(null)} />
        </Dialog>
      )}
    </div>
  )
}

// User Form Dialog Component
function UserFormDialog({
  user,
  onSubmit,
  onCancel,
}: {
  user?: User
  onSubmit: (data: Partial<User>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "student",
    department: user?.department || "",
    status: user?.status || "pending",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
        <DialogDescription>
          {user ? "Update user information and settings." : "Add a new user to the system."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="user@ui.edu.ng"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
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
            <Label htmlFor="status">Status</Label>
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
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
            placeholder="e.g., Computer Science"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#1B998B] hover:bg-[#1B998B]/90">
            {user ? "Update User" : "Create User"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
