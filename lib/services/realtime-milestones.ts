import { getWebSocketService } from './websocket'
import { Milestone } from '@/lib/api/types'
import { getNotificationService } from './notifications'

export interface MilestoneUpdate {
    milestoneId: string
    field: keyof Milestone
    oldValue: any
    newValue: any
    timestamp: string
    userId: string
}

export interface MilestoneEventHandlers {
    onMilestoneCreated: (milestone: Milestone) => void
    onMilestoneUpdated: (milestone: Milestone, updates: Partial<Milestone>) => void
    onMilestoneDeleted: (milestoneId: string) => void
    onProgressUpdated: (milestoneId: string, progress: number, notes?: string) => void
    onMilestoneOverdue: (milestone: Milestone) => void
    onMilestoneCompleted: (milestone: Milestone) => void
    onCollaboratorJoined: (milestoneId: string, userId: string) => void
    onCollaboratorLeft: (milestoneId: string, userId: string) => void
}

class RealtimeMilestoneService {
    private websocket = getWebSocketService()
    private notifications = getNotificationService()
    private eventHandlers: Partial<MilestoneEventHandlers> = {}
    private subscribedProjects: Set<string> = new Set()
    private milestoneUpdates: Map<string, MilestoneUpdate[]> = new Map()
    private isInitialized = false

    constructor() {
        this.initialize()
    }

    private initialize(): void {
        if (this.isInitialized) return

        // Set up WebSocket event listeners
        this.websocket.on('connect', this.handleConnect.bind(this))
        this.websocket.on('disconnect', this.handleDisconnect.bind(this))
        this.websocket.on('authenticated', this.handleAuthenticated.bind(this))

        // Milestone events
        this.websocket.on('milestone:created', this.handleMilestoneCreated.bind(this))
        this.websocket.on('milestone:updated', this.handleMilestoneUpdated.bind(this))
        this.websocket.on('milestone:deleted', this.handleMilestoneDeleted.bind(this))
        this.websocket.on('milestone:progress_updated', this.handleProgressUpdated.bind(this))
        this.websocket.on('milestone:overdue', this.handleMilestoneOverdue.bind(this))
        this.websocket.on('milestone:completed', this.handleMilestoneCompleted.bind(this))

        // Collaboration events
        this.websocket.on('milestone:collaborator_joined', this.handleCollaboratorJoined.bind(this))
        this.websocket.on('milestone:collaborator_left', this.handleCollaboratorLeft.bind(this))

        this.isInitialized = true
    }

    // Event handler registration
    setEventHandlers(handlers: Partial<MilestoneEventHandlers>): void {
        this.eventHandlers = { ...this.eventHandlers, ...handlers }
    }

    // Project subscription management
    subscribeToProject(projectId: string): void {
        if (!this.subscribedProjects.has(projectId)) {
            this.subscribedProjects.add(projectId)
            this.websocket.joinRoom(`project:${projectId}:milestones`)
            console.log(`Subscribed to milestone updates for project: ${projectId}`)
        }
    }

    unsubscribeFromProject(projectId: string): void {
        if (this.subscribedProjects.has(projectId)) {
            this.subscribedProjects.delete(projectId)
            this.websocket.leaveRoom(`project:${projectId}:milestones`)
            console.log(`Unsubscribed from milestone updates for project: ${projectId}`)
        }
    }

    subscribeToMilestone(milestoneId: string): void {
        this.websocket.joinRoom(`milestone:${milestoneId}`)
        console.log(`Subscribed to updates for milestone: ${milestoneId}`)
    }

    unsubscribeFromMilestone(milestoneId: string): void {
        this.websocket.leaveRoom(`milestone:${milestoneId}`)
        console.log(`Unsubscribed from updates for milestone: ${milestoneId}`)
    }

    // Real-time updates
    updateMilestoneProgress(milestoneId: string, progress: number, notes?: string): void {
        this.websocket.updateMilestoneProgress(milestoneId, progress)

        // Emit local update for immediate UI feedback
        this.eventHandlers.onProgressUpdated?.(milestoneId, progress, notes)
    }

    // Milestone update history
    getMilestoneUpdates(milestoneId: string): MilestoneUpdate[] {
        return this.milestoneUpdates.get(milestoneId) || []
    }

    addMilestoneUpdate(milestoneId: string, update: MilestoneUpdate): void {
        if (!this.milestoneUpdates.has(milestoneId)) {
            this.milestoneUpdates.set(milestoneId, [])
        }

        const updates = this.milestoneUpdates.get(milestoneId)!
        updates.unshift(update) // Add to beginning for chronological order

        // Keep only last 50 updates per milestone
        if (updates.length > 50) {
            updates.splice(50)
        }
    }

    // Connection status
    isConnected(): boolean {
        return this.websocket.isSocketConnected()
    }

    isAuthenticated(): boolean {
        return this.websocket.isSocketAuthenticated()
    }

    getConnectionState() {
        return this.websocket.getConnectionState()
    }

    // WebSocket event handlers
    private handleConnect(): void {
        console.log('Milestone service: WebSocket connected')
    }

    private handleDisconnect(): void {
        console.log('Milestone service: WebSocket disconnected')
    }

    private handleAuthenticated(): void {
        console.log('Milestone service: WebSocket authenticated')

        // Rejoin all subscribed project rooms
        for (const projectId of this.subscribedProjects) {
            this.websocket.joinRoom(`project:${projectId}:milestones`)
        }
    }

    private handleMilestoneCreated(data: { milestone: Milestone; projectId?: string }): void {
        const { milestone, projectId } = data

        console.log('New milestone created:', milestone.title)

        // Add to update history
        this.addMilestoneUpdate(milestone.id, {
            milestoneId: milestone.id,
            field: 'status',
            oldValue: null,
            newValue: milestone.status,
            timestamp: new Date().toISOString(),
            userId: milestone.studentId, // Assuming the student created it
        })

        // Notify handlers
        this.eventHandlers.onMilestoneCreated?.(milestone)

        // Show notification if it's for a subscribed project
        if (projectId && this.subscribedProjects.has(projectId)) {
            this.notifications.showToast({
                type: 'success',
                title: 'New Milestone Created',
                message: `"${milestone.title}" has been added to your project`,
            })
        }
    }

    private handleMilestoneUpdated(data: { milestone: Milestone; updates: Partial<Milestone>; projectId?: string }): void {
        const { milestone, updates, projectId } = data

        console.log('Milestone updated:', milestone.title, updates)

        // Add to update history for each changed field
        Object.entries(updates).forEach(([field, newValue]) => {
            this.addMilestoneUpdate(milestone.id, {
                milestoneId: milestone.id,
                field: field as keyof Milestone,
                oldValue: null, // Would need to track previous values
                newValue,
                timestamp: new Date().toISOString(),
                userId: milestone.studentId,
            })
        })

        // Notify handlers
        this.eventHandlers.onMilestoneUpdated?.(milestone, updates)

        // Show notification for important updates
        if (updates.dueDate || updates.status || updates.priority) {
            this.notifications.showToast({
                type: 'info',
                title: 'Milestone Updated',
                message: `"${milestone.title}" has been modified`,
            })
        }
    }

    private handleMilestoneDeleted(data: { milestoneId: string; projectId?: string }): void {
        const { milestoneId, projectId } = data

        console.log('Milestone deleted:', milestoneId)

        // Clean up update history
        this.milestoneUpdates.delete(milestoneId)

        // Notify handlers
        this.eventHandlers.onMilestoneDeleted?.(milestoneId)

        // Show notification
        this.notifications.showToast({
            type: 'warning',
            title: 'Milestone Deleted',
            message: 'A milestone has been removed from your project',
        })
    }

    private handleProgressUpdated(data: { milestoneId: string; progress: number; notes?: string; projectId?: string }): void {
        const { milestoneId, progress, notes, projectId } = data

        console.log('Milestone progress updated:', milestoneId, progress)

        // Add to update history
        this.addMilestoneUpdate(milestoneId, {
            milestoneId,
            field: 'progress',
            oldValue: null, // Would need to track previous progress
            newValue: progress,
            timestamp: new Date().toISOString(),
            userId: 'unknown', // Would come from the update data
        })

        // Notify handlers
        this.eventHandlers.onProgressUpdated?.(milestoneId, progress, notes)

        // Show celebration for completion
        if (progress === 100) {
            this.notifications.showToast({
                type: 'success',
                title: '🎉 Milestone Completed!',
                message: 'Congratulations on reaching 100% progress!',
                duration: 8000,
            })
        } else if (progress >= 75) {
            this.notifications.showToast({
                type: 'success',
                title: 'Great Progress!',
                message: `You're at ${progress}% - almost there!`,
            })
        }
    }

    private handleMilestoneOverdue(data: { milestone: Milestone }): void {
        const { milestone } = data

        console.log('Milestone overdue:', milestone.title)

        // Notify handlers
        this.eventHandlers.onMilestoneOverdue?.(milestone)

        // Show urgent notification
        this.notifications.showToast({
            type: 'error',
            title: '⚠️ Milestone Overdue',
            message: `"${milestone.title}" is past its due date`,
            duration: 10000,
        })

        // Also show browser notification if permission granted
        if (Notification.permission === 'granted') {
            this.notifications.showBrowserNotification('Milestone Overdue', {
                body: `"${milestone.title}" is past its due date`,
                tag: `overdue_${milestone.id}`,
                requireInteraction: true,
            })
        }
    }

    private handleMilestoneCompleted(data: { milestone: Milestone }): void {
        const { milestone } = data

        console.log('Milestone completed:', milestone.title)

        // Notify handlers
        this.eventHandlers.onMilestoneCompleted?.(milestone)

        // Show celebration notification
        this.notifications.showToast({
            type: 'success',
            title: '🎉 Milestone Completed!',
            message: `"${milestone.title}" has been marked as complete`,
            duration: 8000,
        })
    }

    private handleCollaboratorJoined(data: { milestoneId: string; userId: string; userName?: string }): void {
        const { milestoneId, userId, userName } = data

        console.log('Collaborator joined milestone:', milestoneId, userId)

        // Notify handlers
        this.eventHandlers.onCollaboratorJoined?.(milestoneId, userId)

        // Show notification
        this.notifications.showToast({
            type: 'info',
            title: 'Collaborator Joined',
            message: `${userName || 'Someone'} is now working on this milestone`,
        })
    }

    private handleCollaboratorLeft(data: { milestoneId: string; userId: string; userName?: string }): void {
        const { milestoneId, userId, userName } = data

        console.log('Collaborator left milestone:', milestoneId, userId)

        // Notify handlers
        this.eventHandlers.onCollaboratorLeft?.(milestoneId, userId)

        // Show notification
        this.notifications.showToast({
            type: 'info',
            title: 'Collaborator Left',
            message: `${userName || 'Someone'} is no longer working on this milestone`,
        })
    }

    // Cleanup
    cleanup(): void {
        // Unsubscribe from all projects
        for (const projectId of this.subscribedProjects) {
            this.websocket.leaveRoom(`project:${projectId}:milestones`)
        }
        this.subscribedProjects.clear()

        // Clear update history
        this.milestoneUpdates.clear()
    }
}

// Singleton instance
let realtimeMilestoneService: RealtimeMilestoneService | null = null

export const getRealtimeMilestoneService = (): RealtimeMilestoneService => {
    if (!realtimeMilestoneService) {
        realtimeMilestoneService = new RealtimeMilestoneService()
    }
    return realtimeMilestoneService
}

// React hook for real-time milestones
export const useRealtimeMilestones = () => {
    const service = getRealtimeMilestoneService()

    return {
        subscribeToProject: service.subscribeToProject.bind(service),
        unsubscribeFromProject: service.unsubscribeFromProject.bind(service),
        subscribeToMilestone: service.subscribeToMilestone.bind(service),
        unsubscribeFromMilestone: service.unsubscribeFromMilestone.bind(service),
        updateMilestoneProgress: service.updateMilestoneProgress.bind(service),
        getMilestoneUpdates: service.getMilestoneUpdates.bind(service),
        isConnected: service.isConnected.bind(service),
        isAuthenticated: service.isAuthenticated.bind(service),
        getConnectionState: service.getConnectionState.bind(service),
        setEventHandlers: service.setEventHandlers.bind(service),
        cleanup: service.cleanup.bind(service),
    }
}

export default RealtimeMilestoneService