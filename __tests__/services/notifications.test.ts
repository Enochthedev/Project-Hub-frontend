import { getNotificationService, Notification } from '@/lib/services/notifications'
import { getWebSocketService } from '@/lib/services/websocket'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/lib/services/websocket')
jest.mock('sonner')

const mockWebSocket = {
    on: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
}

const mockToast = toast as jest.Mocked<typeof toast>
mockToast.success = jest.fn()
mockToast.error = jest.fn()
mockToast.warning = jest.fn()

    ; (getWebSocketService as jest.Mock).mockReturnValue(mockWebSocket)

describe('NotificationService', () => {
    let service: ReturnType<typeof getNotificationService>

    beforeEach(() => {
        service = getNotificationService()
        jest.clearAllMocks()

        // Clear notifications
        service['notifications'] = []
    })

    describe('notification management', () => {
        const mockNotification: Notification = {
            id: 'test-1',
            type: 'info',
            title: 'Test Notification',
            message: 'This is a test',
            timestamp: new Date().toISOString(),
            isRead: false,
            userId: 'user-1',
        }

        it('should add notification', () => {
            service.addNotification(mockNotification)

            const notifications = service.getNotifications()
            expect(notifications).toHaveLength(1)
            expect(notifications[0]).toEqual(mockNotification)
        })

        it('should remove notification', () => {
            service.addNotification(mockNotification)
            service.removeNotification('test-1')

            const notifications = service.getNotifications()
            expect(notifications).toHaveLength(0)
        })

        it('should mark notification as read', () => {
            service.addNotification(mockNotification)
            service.markAsRead('test-1')

            const notifications = service.getNotifications()
            expect(notifications[0].isRead).toBe(true)
            expect(mockWebSocket.markNotificationAsRead).toHaveBeenCalledWith('test-1')
        })

        it('should mark all notifications as read', () => {
            const notification1 = { ...mockNotification, id: 'test-1' }
            const notification2 = { ...mockNotification, id: 'test-2' }

            service.addNotification(notification1)
            service.addNotification(notification2)
            service.markAllAsRead()

            const notifications = service.getNotifications()
            expect(notifications.every(n => n.isRead)).toBe(true)
            expect(mockWebSocket.markAllNotificationsAsRead).toHaveBeenCalled()
        })

        it('should get unread count', () => {
            const notification1 = { ...mockNotification, id: 'test-1', isRead: false }
            const notification2 = { ...mockNotification, id: 'test-2', isRead: true }

            service.addNotification(notification1)
            service.addNotification(notification2)

            expect(service.getUnreadCount()).toBe(1)
        })
    })

    describe('toast notifications', () => {
        it('should show success toast', () => {
            service.showToast({
                type: 'success',
                title: 'Success!',
                message: 'Operation completed',
            })

            expect(mockToast.success).toHaveBeenCalledWith('Success!', {
                description: 'Operation completed',
                duration: 5000,
                action: undefined,
            })
        })

        it('should show error toast', () => {
            service.showToast({
                type: 'error',
                title: 'Error!',
                message: 'Something went wrong',
            })

            expect(mockToast.error).toHaveBeenCalledWith('Error!', {
                description: 'Something went wrong',
                duration: 5000,
                action: undefined,
            })
        })

        it('should show toast with action', () => {
            const action = { label: 'Retry', onClick: jest.fn() }

            service.showToast({
                type: 'warning',
                title: 'Warning!',
                message: 'Please check',
                action,
            })

            expect(mockToast.warning).toHaveBeenCalledWith('Warning!', {
                description: 'Please check',
                duration: 5000,
                action: {
                    label: 'Retry',
                    onClick: action.onClick,
                },
            })
        })
    })

    describe('browser notifications', () => {
        beforeEach(() => {
            // Mock Notification API
            global.Notification = {
                permission: 'default',
                requestPermission: jest.fn(),
            } as any
        })

        it('should request permission', async () => {
            ; (global.Notification.requestPermission as jest.Mock).mockResolvedValue('granted')

            const result = await service.requestPermission()

            expect(result).toBe(true)
            expect(global.Notification.requestPermission).toHaveBeenCalled()
        })

        it('should return false if permission denied', async () => {
            ; (global.Notification.requestPermission as jest.Mock).mockResolvedValue('denied')

            const result = await service.requestPermission()

            expect(result).toBe(false)
        })

        it('should show browser notification when permission granted', () => {
            global.Notification.permission = 'granted'
            const mockNotificationConstructor = jest.fn()
            global.Notification = mockNotificationConstructor as any

            service.showBrowserNotification('Test Title', { body: 'Test body' })

            expect(mockNotificationConstructor).toHaveBeenCalledWith('Test Title', {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                body: 'Test body',
            })
        })
    })

    describe('WebSocket event handlers', () => {
        it('should handle new notification event', () => {
            const mockNotification: Notification = {
                id: 'ws-1',
                type: 'error',
                title: 'WebSocket Notification',
                message: 'From WebSocket',
                timestamp: new Date().toISOString(),
                isRead: false,
                userId: 'user-1',
            }

            // Simulate WebSocket event
            const handler = mockWebSocket.on.mock.calls.find(call => call[0] === 'notification:new')?.[1]
            handler?.({ notification: mockNotification })

            const notifications = service.getNotifications()
            expect(notifications).toHaveLength(1)
            expect(notifications[0]).toEqual(mockNotification)
            expect(mockToast.error).toHaveBeenCalled()
        })

        it('should handle system announcement', () => {
            const announcement = {
                message: 'System will be down for maintenance',
            }

            const handler = mockWebSocket.on.mock.calls.find(call => call[0] === 'system:announcement')?.[1]
            handler?.({ announcement })

            expect(mockToast).toHaveBeenCalledWith('System Announcement', {
                description: announcement.message,
                duration: 10000,
                action: undefined,
            })

            const notifications = service.getNotifications()
            expect(notifications).toHaveLength(1)
            expect(notifications[0].title).toBe('System Announcement')
        })

        it('should handle maintenance notification', () => {
            const maintenanceData = {
                message: 'Scheduled maintenance in 1 hour',
                scheduledAt: '2023-12-01T10:00:00Z',
            }

            const handler = mockWebSocket.on.mock.calls.find(call => call[0] === 'system:maintenance')?.[1]
            handler?.(maintenanceData)

            expect(mockToast.warning).toHaveBeenCalledWith('Maintenance Notice', {
                description: maintenanceData.message,
                duration: 15000,
                action: undefined,
            })

            const notifications = service.getNotifications()
            expect(notifications).toHaveLength(1)
            expect(notifications[0].title).toBe('Maintenance Notice')
        })

        it('should handle milestone created event', () => {
            const milestoneData = {
                milestone: { title: 'New Milestone', id: 'milestone-1' },
                projectId: 'project-1',
            }

            const handler = mockWebSocket.on.mock.calls.find(call => call[0] === 'milestone:created')?.[1]
            handler?.(milestoneData)

            expect(mockToast.success).toHaveBeenCalledWith('New Milestone', {
                description: 'Milestone "New Milestone" has been created',
                duration: 5000,
                action: undefined,
            })
        })

        it('should handle milestone completion', () => {
            const progressData = {
                milestoneId: 'milestone-1',
                progress: 100,
                projectId: 'project-1',
            }

            const handler = mockWebSocket.on.mock.calls.find(call => call[0] === 'milestone:progress_updated')?.[1]
            handler?.(progressData)

            expect(mockToast.success).toHaveBeenCalledWith('Milestone Completed!', {
                description: 'Congratulations on completing your milestone',
                duration: 5000,
                action: undefined,
            })
        })
    })

    describe('subscription management', () => {
        it('should subscribe and unsubscribe listeners', () => {
            const listener = jest.fn()

            const unsubscribe = service.subscribe(listener)

            // Add notification to trigger listener
            service.addNotification({
                id: 'test',
                type: 'info',
                title: 'Test',
                message: 'Test',
                timestamp: new Date().toISOString(),
                isRead: false,
                userId: 'user-1',
            })

            expect(listener).toHaveBeenCalled()

            // Unsubscribe
            unsubscribe()
            listener.mockClear()

            // Add another notification
            service.addNotification({
                id: 'test2',
                type: 'info',
                title: 'Test2',
                message: 'Test2',
                timestamp: new Date().toISOString(),
                isRead: false,
                userId: 'user-1',
            })

            expect(listener).not.toHaveBeenCalled()
        })
    })
})