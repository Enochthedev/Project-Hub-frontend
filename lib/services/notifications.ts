import { getWebSocketService } from './websocket'
import { toast } from 'sonner'

export interface Notification {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: string
    isRead: boolean
    userId: string
    data?: any
    actions?: NotificationAction[]
}

export interface NotificationAction {
    id: string
    label: string
    action: 'navigate' | 'api_call' | 'custom'
    payload?: any
}

export interface ToastNotification {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message?: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

class NotificationService {
    private notifications: Notification[] = []
    private listeners: Set<(notifications: Notification[]) => void> = new Set()
    private websocket = getWebSocketService()
    private isInitialized = false

    constructor() {
        this.initialize()
    }

    private initialize(): void {
        if (this.isInitialized) return

        // Set up WebSocket listeners
        this.websocket.on('notification:new', this.handleNewNotification.bind(this))
        this.websocket.on('notification:read', this.handleNotificationRead.bind(this))
        this.websocket.on('notification:bulk_read', this.handleBulkNotificationRead.bind(this))
        this.websocket.on('system:announcement', this.handleSystemAnnouncement.bind(this))
        this.websocket.on('system:maintenance', this.handleMaintenanceNotification.bind(this))

        // Set up milestone notifications
        this.websocket.on('milestone:created', this.handleMilestoneCreated.bind(this))
        this.websocket.on('milestone:updated', this.handleMilestoneUpdated.bind(this))
        this.websocket.on('milestone:progress_updated', this.handleMilestoneProgressUpdated.bind(this))

        // Set up message notifications
        this.websocket.on('message:new', this.handleNewMessage.bind(this))

        this.isInitialized = true
    }

    // Notification management
    addNotification(notification: Notification): void {
        this.notifications.unshift(notification)
        this.notifyListeners()
    }

    removeNotification(id: string): void {
        this.notifications = this.notifications.filter(n => n.id !== id)
        this.notifyListeners()
    }

    markAsRead(id: string): void {
        const notification = this.notifications.find(n => n.id === id)
        if (notification && !notification.isRead) {
            notification.isRead = true
            this.websocket.markNotificationAsRead(id)
            this.notifyListeners()
        }
    }

    markAllAsRead(): void {
        const unreadNotifications = this.notifications.filter(n => !n.isRead)
        if (unreadNotifications.length > 0) {
            unreadNotifications.forEach(n => n.isRead = true)
            this.websocket.markAllNotificationsAsRead()
            this.notifyListeners()
        }
    }

    getNotifications(): Notification[] {
        return [...this.notifications]
    }

    getUnreadCount(): number {
        return this.notifications.filter(n => !n.isRead).length
    }

    // Toast notifications
    showToast(notification: ToastNotification): void {
        const { type, title, message, duration = 5000, action } = notification

        const toastOptions: any = {
            duration,
            action: action ? {
                label: action.label,
                onClick: action.onClick,
            } : undefined,
        }

        switch (type) {
            case 'success':
                toast.success(title, { description: message, ...toastOptions })
                break
            case 'error':
                toast.error(title, { description: message, ...toastOptions })
                break
            case 'warning':
                toast.warning(title, { description: message, ...toastOptions })
                break
            default:
                toast(title, { description: message, ...toastOptions })
        }
    }

    // Browser notifications (requires permission)
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('Browser notifications not supported')
            return false
        }

        if (Notification.permission === 'granted') {
            return true
        }

        if (Notification.permission === 'denied') {
            return false
        }

        const permission = await Notification.requestPermission()
        return permission === 'granted'
    }

    showBrowserNotification(title: string, options?: NotificationOptions): void {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options,
            })
        }
    }

    // Event listeners
    subscribe(listener: (notifications: Notification[]) => void): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.notifications))
    }

    // WebSocket event handlers
    private handleNewNotification(data: { notification: Notification }): void {
        const notification = data.notification
        this.addNotification(notification)

        // Show toast for important notifications
        if (notification.type === 'error' || notification.type === 'warning') {
            this.showToast({
                type: notification.type,
                title: notification.title,
                message: notification.message,
            })
        }

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            this.showBrowserNotification(notification.title, {
                body: notification.message,
                tag: notification.id,
            })
        }
    }

    private handleNotificationRead(data: { notificationId: string }): void {
        const notification = this.notifications.find(n => n.id === data.notificationId)
        if (notification) {
            notification.isRead = true
            this.notifyListeners()
        }
    }

    private handleBulkNotificationRead(data: { notificationIds: string[] }): void {
        data.notificationIds.forEach(id => {
            const notification = this.notifications.find(n => n.id === id)
            if (notification) {
                notification.isRead = true
            }
        })
        this.notifyListeners()
    }

    private handleSystemAnnouncement(data: { announcement: any }): void {
        this.showToast({
            type: 'info',
            title: 'System Announcement',
            message: data.announcement.message,
            duration: 10000, // Show for 10 seconds
        })

        // Also add as persistent notification
        this.addNotification({
            id: `announcement_${Date.now()}`,
            type: 'info',
            title: 'System Announcement',
            message: data.announcement.message,
            timestamp: new Date().toISOString(),
            isRead: false,
            userId: '', // System notification
            data: data.announcement,
        })
    }

    private handleMaintenanceNotification(data: { message: string; scheduledAt?: string }): void {
        this.showToast({
            type: 'warning',
            title: 'Maintenance Notice',
            message: data.message,
            duration: 15000, // Show for 15 seconds
        })

        this.addNotification({
            id: `maintenance_${Date.now()}`,
            type: 'warning',
            title: 'Maintenance Notice',
            message: data.message,
            timestamp: new Date().toISOString(),
            isRead: false,
            userId: '', // System notification
            data: { scheduledAt: data.scheduledAt },
        })
    }

    private handleMilestoneCreated(data: { milestone: any; projectId?: string }): void {
        this.showToast({
            type: 'success',
            title: 'New Milestone',
            message: `Milestone "${data.milestone.title}" has been created`,
        })
    }

    private handleMilestoneUpdated(data: { milestone: any; projectId?: string }): void {
        this.showToast({
            type: 'info',
            title: 'Milestone Updated',
            message: `Milestone "${data.milestone.title}" has been updated`,
        })
    }

    private handleMilestoneProgressUpdated(data: { milestoneId: string; progress: number; projectId?: string }): void {
        if (data.progress === 100) {
            this.showToast({
                type: 'success',
                title: 'Milestone Completed!',
                message: 'Congratulations on completing your milestone',
            })
        }
    }

    private handleNewMessage(data: { conversationId: string; message: any }): void {
        // Only show notification if the conversation is not currently active
        // This would need to be integrated with the chat interface state
        this.showToast({
            type: 'info',
            title: 'New Message',
            message: 'You have a new message from the AI assistant',
        })
    }
}

// Singleton instance
let notificationService: NotificationService | null = null

export const getNotificationService = (): NotificationService => {
    if (!notificationService) {
        notificationService = new NotificationService()
    }
    return notificationService
}

// React hook for notifications
export const useNotifications = () => {
    const service = getNotificationService()

    return {
        notifications: service.getNotifications(),
        unreadCount: service.getUnreadCount(),
        addNotification: service.addNotification.bind(service),
        removeNotification: service.removeNotification.bind(service),
        markAsRead: service.markAsRead.bind(service),
        markAllAsRead: service.markAllAsRead.bind(service),
        showToast: service.showToast.bind(service),
        requestPermission: service.requestPermission.bind(service),
        subscribe: service.subscribe.bind(service),
    }
}

export default NotificationService
