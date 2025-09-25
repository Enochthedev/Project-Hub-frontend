"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Calendar,
  FolderOpen,
  Settings,
  Star,
  Clock,
} from "lucide-react"

interface Notification {
  id: string
  type: "message" | "project" | "milestone" | "system" | "reminder"
  title: string
  description: string
  isRead: boolean
  isStarred: boolean
  priority: "low" | "medium" | "high"
  timestamp: string
  actionUrl?: string
  metadata: {
    sender?: {
      name: string
      avatar?: string
    }
    projectId?: string
    milestoneId?: string
  }
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "New message from Dr. Sarah Wilson",
    description:
      "Regarding your project proposal submission - please review the feedback and make necessary revisions.",
    isRead: false,
    isStarred: true,
    priority: "high",
    timestamp: "2024-01-20T10:30:00Z",
    actionUrl: "/messages/1",
    metadata: {
      sender: {
        name: "Dr. Sarah Wilson",
        avatar: "/placeholder-user.jpg",
      },
    },
  },
  {
    id: "2",
    type: "project",
    title: "Project approved: AI Analytics System",
    description: 'Your project "AI-Powered Student Performance Analytics" has been approved and is now active.',
    isRead: false,
    isStarred: false,
    priority: "medium",
    timestamp: "2024-01-20T09:15:00Z",
    actionUrl: "/projects/1",
    metadata: {
      projectId: "1",
    },
  },
  {
    id: "3",
    type: "milestone",
    title: "Milestone deadline approaching",
    description: 'Your milestone "Literature Review" is due in 3 days. Make sure to complete all requirements.',
    isRead: true,
    isStarred: false,
    priority: "medium",
    timestamp: "2024-01-19T16:45:00Z",
    actionUrl: "/milestones/3",
    metadata: {
      milestoneId: "3",
    },
  },
  {
    id: "4",
    type: "system",
    title: "System maintenance scheduled",
    description: "The platform will undergo maintenance on January 25th from 2:00 AM to 4:00 AM EST.",
    isRead: true,
    isStarred: false,
    priority: "low",
    timestamp: "2024-01-19T14:20:00Z",
  },
  {
    id: "5",
    type: "reminder",
    title: "Weekly progress report due",
    description: "Don't forget to submit your weekly progress report by end of day Friday.",
    isRead: false,
    isStarred: false,
    priority: "medium",
    timestamp: "2024-01-19T08:00:00Z",
  },
  {
    id: "6",
    type: "message",
    title: "Collaboration request from Mike Johnson",
    description:
      "Mike Johnson would like to collaborate on your blockchain project. Review the request in your messages.",
    isRead: true,
    isStarred: false,
    priority: "low",
    timestamp: "2024-01-18T15:30:00Z",
    actionUrl: "/messages/6",
    metadata: {
      sender: {
        name: "Mike Johnson",
      },
    },
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("newest")

  // Filter notifications based on active tab and filters
  const filteredNotifications = notifications
    .filter((notification) => {
      if (activeTab === "unread" && notification.isRead) return false
      if (activeTab === "starred" && !notification.isStarred) return false
      if (activeTab !== "all" && activeTab !== "unread" && activeTab !== "starred" && notification.type !== activeTab)
        return false
      if (priorityFilter !== "all" && notification.priority !== priorityFilter) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        default:
          return 0
      }
    })

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const starredCount = notifications.filter((n) => n.isStarred).length

  const handleMarkAsRead = (notificationIds: string[]) => {
    setNotifications((prev) => prev.map((n) => (notificationIds.includes(n.id) ? { ...n, isRead: true } : n)))
    toast.success(`${notificationIds.length} notification(s) marked as read`)
  }

  const handleMarkAsUnread = (notificationIds: string[]) => {
    setNotifications((prev) => prev.map((n) => (notificationIds.includes(n.id) ? { ...n, isRead: false } : n)))
    toast.success(`${notificationIds.length} notification(s) marked as unread`)
  }

  const handleToggleStar = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isStarred: !n.isStarred } : n)))
  }

  const handleDelete = (notificationIds: string[]) => {
    setNotifications((prev) => prev.filter((n) => !notificationIds.includes(n.id)))
    setSelectedNotifications([])
    toast.success(`${notificationIds.length} notification(s) deleted`)
  }

  const handleBulkAction = (action: string) => {
    if (selectedNotifications.length === 0) {
      toast.error("Please select notifications first")
      return
    }

    switch (action) {
      case "read":
        handleMarkAsRead(selectedNotifications)
        break
      case "unread":
        handleMarkAsUnread(selectedNotifications)
        break
      case "delete":
        handleDelete(selectedNotifications)
        break
    }
    setSelectedNotifications([])
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "project":
        return <FolderOpen className="h-4 w-4" />
      case "milestone":
        return <Calendar className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      case "reminder":
        return <Clock className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "message":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "project":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "milestone":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "system":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "reminder":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Notifications</h1>
          <p className="text-[#656176] dark:text-[#DECDF5]">Stay updated with your latest activities</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleMarkAsRead(notifications.filter((n) => !n.isRead).map((n) => n.id))}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <BellRing className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starred</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{starredCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="priority">By Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction("read")} variant="outline">
                  <Check className="h-4 w-4 mr-1" />
                  Mark Read ({selectedNotifications.length})
                </Button>
                <Button size="sm" onClick={() => handleBulkAction("unread")} variant="outline">
                  <Bell className="h-4 w-4 mr-1" />
                  Mark Unread
                </Button>
                <Button size="sm" onClick={() => handleBulkAction("delete")} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
              <TabsTrigger value="message">Messages</TabsTrigger>
              <TabsTrigger value="project">Projects</TabsTrigger>
              <TabsTrigger value="milestone">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`transition-all hover:shadow-md ${
                        !notification.isRead ? "border-l-4 border-l-[#1B998B] bg-blue-50/50 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedNotifications.includes(notification.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedNotifications((prev) => [...prev, notification.id])
                              } else {
                                setSelectedNotifications((prev) => prev.filter((id) => id !== notification.id))
                              }
                            }}
                          />

                          {notification.metadata.sender?.avatar && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={notification.metadata.sender.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {notification.metadata.sender.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeColor(notification.type)}>
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(notification.type)}
                                  <span className="capitalize">{notification.type}</span>
                                </div>
                              </Badge>
                              <Badge className={getPriorityColor(notification.priority)}>{notification.priority}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {!notification.isRead && <div className="h-2 w-2 bg-[#1B998B] rounded-full"></div>}
                            </div>

                            <div>
                              <h3 className={`font-medium ${!notification.isRead ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                            </div>

                            {notification.actionUrl && (
                              <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                                View Details
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleToggleStar(notification.id)}>
                              <Star
                                className={`h-4 w-4 ${notification.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`}
                              />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleMarkAsRead([notification.id])}
                                  disabled={notification.isRead}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as Read
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleMarkAsUnread([notification.id])}
                                  disabled={!notification.isRead}
                                >
                                  <Bell className="h-4 w-4 mr-2" />
                                  Mark as Unread
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStar(notification.id)}>
                                  <Star className="h-4 w-4 mr-2" />
                                  {notification.isStarred ? "Unstar" : "Star"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete([notification.id])}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-2">No notifications</h3>
                    <p className="text-[#656176] dark:text-[#DECDF5]">
                      You're all caught up! No notifications to show.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
