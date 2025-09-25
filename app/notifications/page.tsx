"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Bell,
  Check,
  Trash2,
  Settings,
  Clock,
  AlertTriangle,
  MessageSquare,
  FolderOpen,
  Users,
  Star,
  CheckCheck,
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"

interface Notification {
  id: string
  type: "milestone" | "project" | "ai" | "system" | "message"
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "low" | "medium" | "high"
  actionUrl?: string
  metadata?: any
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "milestone",
          title: "Milestone Deadline Approaching",
          message: "Your project proposal milestone is due in 2 days",
          timestamp: "2024-01-15T10:30:00Z",
          read: false,
          priority: "high",
          actionUrl: "/milestones/1",
          metadata: { milestoneTitle: "Project Proposal", daysLeft: 2 },
        },
        {
          id: "2",
          type: "ai",
          title: "AI Assistant Response",
          message: "Your question about machine learning algorithms has been answered",
          timestamp: "2024-01-15T09:15:00Z",
          read: false,
          priority: "medium",
          actionUrl: "/ai-assistant/conversations/123",
          metadata: { conversationId: "123", questionType: "technical" },
        },
        {
          id: "3",
          type: "project",
          title: "New Project Available",
          message: "A new project matching your interests has been posted",
          timestamp: "2024-01-15T08:45:00Z",
          read: true,
          priority: "medium",
          actionUrl: "/projects/456",
          metadata: { projectTitle: "Web Development with React", supervisor: "Dr. Smith" },
        },
        {
          id: "4",
          type: "system",
          title: "System Maintenance",
          message: "Scheduled maintenance will occur tonight from 2-4 AM",
          timestamp: "2024-01-14T16:20:00Z",
          read: true,
          priority: "low",
          metadata: { maintenanceWindow: "2-4 AM" },
        },
        {
          id: "5",
          type: "message",
          title: "Message from Supervisor",
          message: "Dr. Johnson has sent you feedback on your project proposal",
          timestamp: "2024-01-14T14:10:00Z",
          read: false,
          priority: "high",
          actionUrl: "/messages/789",
          metadata: { sender: "Dr. Johnson", messageType: "feedback" },
        },
      ]
      setNotifications(mockNotifications)
    } catch (error) {
      toast.error("Failed to load notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read)
      case "read":
        return notifications.filter((n) => n.read)
      case "high":
        return notifications.filter((n) => n.priority === "high")
      default:
        return notifications
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      setNotifications(notifications.map((n) => (notificationIds.includes(n.id) ? { ...n, read: true } : n)))
      toast.success(`Marked ${notificationIds.length} notification(s) as read`)
    } catch (error) {
      toast.error("Failed to mark notifications as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all notifications as read")
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      setNotifications(notifications.filter((n) => !notificationIds.includes(n.id)))
      setSelectedNotifications([])
      toast.success(`Deleted ${notificationIds.length} notification(s)`)
    } catch (error) {
      toast.error("Failed to delete notifications")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <Clock className="h-5 w-5 text-orange-600" />
      case "project":
        return <FolderOpen className="h-5 w-5 text-blue-600" />
      case "ai":
        return <MessageSquare className="h-5 w-5 text-green-600" />
      case "system":
        return <Settings className="h-5 w-5 text-gray-600" />
      case "message":
        return <Users className="h-5 w-5 text-purple-600" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }
    return <Badge className={variants[priority as keyof typeof variants]}>{priority}</Badge>
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
            </h1>
            <p className="text-muted-foreground">Stay updated with your latest activities</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">{notifications.filter((n) => n.priority === "high").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">
                    {
                      notifications.filter((n) => new Date(n.timestamp).toDateString() === new Date().toDateString())
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="read">Read ({notifications.length - unreadCount})</TabsTrigger>
            <TabsTrigger value="high">
              High Priority ({notifications.filter((n) => n.priority === "high").length})
            </TabsTrigger>
          </TabsList>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedNotifications.length} notification(s) selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => markAsRead(selectedNotifications)}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark Read
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteNotifications(selectedNotifications)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <TabsContent value={filter} className="space-y-4 mt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading notifications...</p>
              </div>
            ) : getFilteredNotifications().length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === "unread"
                    ? "All caught up! No unread notifications."
                    : "You don't have any notifications yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {getFilteredNotifications().map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all hover:shadow-md ${
                      !notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/50" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedNotifications([...selectedNotifications, notification.id])
                            } else {
                              setSelectedNotifications(selectedNotifications.filter((id) => id !== notification.id))
                            }
                          }}
                        />

                        <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                                  {notification.title}
                                </h3>
                                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                {getPriorityBadge(notification.priority)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{formatTimestamp(notification.timestamp)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {notification.type}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {notification.actionUrl && (
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              )}
                              {!notification.read && (
                                <Button size="sm" variant="ghost" onClick={() => markAsRead([notification.id])}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => deleteNotifications([notification.id])}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
