"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Bell,
  BellOff,
  Check,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  FolderOpen,
  Target,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react"

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  category: "project" | "milestone" | "message" | "system" | "reminder"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  metadata?: any
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "success",
        category: "project",
        title: "Project Approved",
        message: 'Your project "AI-Powered Student Analytics" has been approved by the admin team.',
        isRead: false,
        createdAt: "2024-01-20T10:30:00Z",
        actionUrl: "/projects/1",
        metadata: { projectId: "1", approvedBy: "Admin User" },
      },
      {
        id: "2",
        type: "warning",
        category: "milestone",
        title: "Milestone Due Soon",
        message: 'Your milestone "Literature Review" is due in 2 days. Make sure to complete it on time.',
        isRead: false,
        createdAt: "2024-01-20T09:15:00Z",
        actionUrl: "/milestones/2",
        metadata: { milestoneId: "2", dueDate: "2024-01-22" },
      },
      {
        id: "3",
        type: "info",
        category: "message",
        title: "New Message from Supervisor",
        message: "Dr. Sarah Wilson has sent you a message regarding your project progress.",
        isRead: true,
        createdAt: "2024-01-19T16:45:00Z",
        actionUrl: "/messages/3",
        metadata: { senderId: "supervisor-1", senderName: "Dr. Sarah Wilson" },
      },
      {
        id: "4",
        type: "error",
        category: "project",
        title: "Project Submission Failed",
        message: "There was an error submitting your project. Please check the file format and try again.",
        isRead: false,
        createdAt: "2024-01-19T14:20:00Z",
        actionUrl: "/projects/new",
        metadata: { error: "Invalid file format" },
      },
      {
        id: "5",
        type: "info",
        category: "system",
        title: "System Maintenance",
        message: "The platform will undergo scheduled maintenance on January 25th from 2:00 AM to 4:00 AM.",
        isRead: true,
        createdAt: "2024-01-18T12:00:00Z",
        metadata: { maintenanceDate: "2024-01-25", duration: "2 hours" },
      },
      {
        id: "6",
        type: "success",
        category: "milestone",
        title: "Milestone Completed",
        message: 'Congratulations! You have successfully completed the "Research Proposal" milestone.',
        isRead: true,
        createdAt: "2024-01-17T11:30:00Z",
        actionUrl: "/milestones/1",
        metadata: { milestoneId: "1", completedAt: "2024-01-17T11:30:00Z" },
      },
      {
        id: "7",
        type: "info",
        category: "reminder",
        title: "Weekly Progress Update",
        message: "Don't forget to submit your weekly progress update for this week.",
        isRead: false,
        createdAt: "2024-01-16T08:00:00Z",
        actionUrl: "/progress/weekly",
        metadata: { week: "2024-W03" },
      },
    ]

    setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 1000)
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getNotificationsByCategory = (category: string) => {
    if (category === "all") return notifications
    if (category === "unread") return notifications.filter((n) => !n.isRead)
    return notifications.filter((n) => n.category === category)
  }

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId) ? prev.filter((id) => id !== notificationId) : [...prev, notificationId],
    )
  }

  const handleSelectAll = () => {
    const currentNotifications = getNotificationsByCategory(activeTab)
    if (selectedNotifications.length === currentNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(currentNotifications.map((n) => n.id))
    }
  }

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setNotifications((prev) =>
        prev.map((notification) =>
          notificationIds.includes(notification.id) ? { ...notification, isRead: true } : notification,
        ),
      )

      toast.success(`${notificationIds.length} notification(s) marked as read`)
      setSelectedNotifications([])
    } catch (error) {
      toast.error("Failed to mark notifications as read")
    }
  }

  const handleMarkAsUnread = async (notificationIds: string[]) => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setNotifications((prev) =>
        prev.map((notification) =>
          notificationIds.includes(notification.id) ? { ...notification, isRead: false } : notification,
        ),
      )

      toast.success(`${notificationIds.length} notification(s) marked as unread`)
      setSelectedNotifications([])
    } catch (error) {
      toast.error("Failed to mark notifications as unread")
    }
  }

  const handleDelete = async (notificationIds: string[]) => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setNotifications((prev) => prev.filter((n) => !notificationIds.includes(n.id)))
      toast.success(`${notificationIds.length} notification(s) deleted`)
      setSelectedNotifications([])
    } catch (error) {
      toast.error("Failed to delete notifications")
    }
  }

  const getNotificationIcon = (type: string, category: string) => {
    if (category === "project") return <FolderOpen className="h-4 w-4" />
    if (category === "milestone") return <Target className="h-4 w-4" />
    if (category === "message") return <MessageSquare className="h-4 w-4" />
    if (category === "system") return <Settings className="h-4 w-4" />

    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50 dark:bg-green-900/20"
      case "warning":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      case "error":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/20"
      default:
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20"
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
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF] flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
          </h1>
          <p className="text-[#656176] dark:text-[#DECDF5] mt-1">Stay updated with your projects and activities</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="project">Projects ({getNotificationsByCategory("project").length})</TabsTrigger>
          <TabsTrigger value="milestone">Milestones ({getNotificationsByCategory("milestone").length})</TabsTrigger>
          <TabsTrigger value="message">Messages ({getNotificationsByCategory("message").length})</TabsTrigger>
          <TabsTrigger value="system">System ({getNotificationsByCategory("system").length})</TabsTrigger>
        </TabsList>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#656176] dark:text-[#DECDF5]">
                  {selectedNotifications.length} notification(s) selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(selectedNotifications)}>
                    <Check className="h-4 w-4 mr-1" />
                    Mark as Read
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleMarkAsUnread(selectedNotifications)}>
                    <BellOff className="h-4 w-4 mr-1" />
                    Mark as Unread
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedNotifications)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Contents */}
        {["all", "unread", "project", "milestone", "message", "system"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <NotificationsList
              notifications={getNotificationsByCategory(tab)}
              selectedNotifications={selectedNotifications}
              onSelectNotification={handleSelectNotification}
              onSelectAll={handleSelectAll}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
              onDelete={handleDelete}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// Notifications List Component
function NotificationsList({
  notifications,
  selectedNotifications,
  onSelectNotification,
  onSelectAll,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  getNotificationIcon,
  getNotificationColor,
}: {
  notifications: Notification[]
  selectedNotifications: string[]
  onSelectNotification: (id: string) => void
  onSelectAll: () => void
  onMarkAsRead: (ids: string[]) => void
  onMarkAsUnread: (ids: string[]) => void
  onDelete: (ids: string[]) => void
  getNotificationIcon: (type: string, category: string) => React.ReactNode
  getNotificationColor: (type: string) => string
}) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No notifications</p>
        <p className="text-[#656176] dark:text-[#DECDF5]">You're all caught up!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Select All */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Checkbox
          checked={selectedNotifications.length === notifications.length && notifications.length > 0}
          onCheckedChange={onSelectAll}
        />
        <span className="text-sm text-[#656176] dark:text-[#DECDF5]">Select all notifications</span>
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`border-l-4 ${getNotificationColor(notification.type)} ${!notification.isRead ? "shadow-md" : ""}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={selectedNotifications.includes(notification.id)}
                onCheckedChange={() => onSelectNotification(notification.id)}
              />

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getNotificationIcon(notification.type, notification.category)}
                    <div>
                      <h3
                        className={`font-medium ${
                          !notification.isRead
                            ? "text-[#534D56] dark:text-[#F8F1FF]"
                            : "text-[#656176] dark:text-[#DECDF5]"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-sm text-[#656176] dark:text-[#DECDF5] mt-1">{notification.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!notification.isRead ? (
                          <DropdownMenuItem onClick={() => onMarkAsRead([notification.id])}>
                            <Check className="h-4 w-4 mr-2" />
                            Mark as Read
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onMarkAsUnread([notification.id])}>
                            <BellOff className="h-4 w-4 mr-2" />
                            Mark as Unread
                          </DropdownMenuItem>
                        )}
                        {notification.actionUrl && (
                          <DropdownMenuItem>
                            <FolderOpen className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onDelete([notification.id])} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#656176] dark:text-[#DECDF5]">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="capitalize">
                      {notification.category}
                    </Badge>
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  </div>

                  {notification.actionUrl && (
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                      View →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
