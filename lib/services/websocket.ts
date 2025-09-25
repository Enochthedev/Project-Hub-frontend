import { io, Socket } from 'socket.io-client'
import { authUtils } from '@/lib/api/auth'

// WebSocket event types
export interface WebSocketEvents {
    // Connection events
    connect: () => void
    disconnect: (reason: string) => void
    connect_error: (error: Error) => void

    // Authentication events
    authenticated: (data: { userId: string }) => void
    authentication_error: (error: { message: string }) => void

    // Chat/Message events
    'message:new': (data: { conversationId: string; message: any }) => void
    'message:updated': (data: { messageId: string; message: any }) => void
    'message:deleted': (data: { messageId: string; conversationId: string }) => void
    'conversation:updated': (data: { conversationId: string; conversation: any }) => void

    // Milestone events
    'milestone:created': (data: { milestone: any; projectId?: string }) => void
    'milestone:updated': (data: { milestone: any; projectId?: string }) => void
    'milestone:deleted': (data: { milestoneId: string; projectId?: string }) => void
    'milestone:progress_updated': (data: { milestoneId: string; progress: number; projectId?: string }) => void

    // Notification events
    'notification:new': (data: { notification: any }) => void
    'notification:read': (data: { notificationId: string }) => void
    'notification:bulk_read': (data: { notificationIds: string[] }) => void

    // System events
    'system:announcement': (data: { announcement: any }) => void
    'system:maintenance': (data: { message: string; scheduledAt?: string }) => void

    // User presence events
    'user:online': (data: { userId: string; timestamp: string }) => void
    'user:offline': (data: { userId: string; timestamp: string }) => void
    'user:typing': (data: { userId: string; conversationId: string }) => void
    'user:stop_typing': (data: { userId: string; conversationId: string }) => void
}

export type WebSocketEventName = keyof WebSocketEvents
export type WebSocketEventHandler<T extends WebSocketEventName> = WebSocketEvents[T]

interface WebSocketConfig {
    url?: string
    autoConnect?: boolean
    reconnection?: boolean
    reconnectionAttempts?: number
    reconnectionDelay?: number
    timeout?: number
}

class WebSocketService {
    private socket: Socket | null = null
    private config: WebSocketConfig
    private eventHandlers: Map<string, Set<Function>> = new Map()
    private isConnected = false
    private isAuthenticated = false
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000
    private heartbeatInterval: NodeJS.Timeout | null = null

    constructor(config: WebSocketConfig = {}) {
        this.config = {
            url: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
            ...config,
        }

        if (this.config.autoConnect && typeof window !== 'undefined') {
            this.connect()
        }
    }

    // Connection management
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve()
                return
            }

            try {
                this.socket = io(this.config.url!, {
                    transports: ['websocket', 'polling'],
                    timeout: this.config.timeout,
                    reconnection: this.config.reconnection,
                    reconnectionAttempts: this.config.reconnectionAttempts,
                    reconnectionDelay: this.config.reconnectionDelay,
                })

                this.setupEventHandlers()

                this.socket.on('connect', () => {
                    console.log('WebSocket connected')
                    this.isConnected = true
                    this.reconnectAttempts = 0
                    this.authenticate()
                    this.startHeartbeat()
                    resolve()
                })

                this.socket.on('connect_error', (error) => {
                    console.error('WebSocket connection error:', error)
                    this.isConnected = false
                    reject(error)
                })

                this.socket.on('disconnect', (reason) => {
                    console.log('WebSocket disconnected:', reason)
                    this.isConnected = false
                    this.isAuthenticated = false
                    this.stopHeartbeat()

                    if (reason === 'io server disconnect') {
                        // Server initiated disconnect, try to reconnect
                        this.handleReconnection()
                    }
                })

            } catch (error) {
                console.error('Failed to create WebSocket connection:', error)
                reject(error)
            }
        })
    }

    disconnect(): void {
        if (this.socket) {
            this.stopHeartbeat()
            this.socket.disconnect()
            this.socket = null
            this.isConnected = false
            this.isAuthenticated = false
        }
    }

    // Authentication
    private authenticate(): void {
        if (!this.socket || !authUtils.isAuthenticated()) {
            return
        }

        const token = authUtils.getStoredTokens()?.accessToken
        if (!token) {
            console.error('No access token available for WebSocket authentication')
            return
        }

        this.socket.emit('authenticate', { token })

        this.socket.on('authenticated', (data) => {
            console.log('WebSocket authenticated:', data)
            this.isAuthenticated = true
            this.emit('authenticated', data)
        })

        this.socket.on('authentication_error', (error) => {
            console.error('WebSocket authentication error:', error)
            this.isAuthenticated = false
            this.emit('authentication_error', error)
        })
    }

    // Event handling
    on<T extends WebSocketEventName>(event: T, handler: WebSocketEventHandler<T>): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set())
        }
        this.eventHandlers.get(event)!.add(handler)

        // Also register with socket if connected
        if (this.socket) {
            this.socket.on(event, handler as any)
        }
    }

    off<T extends WebSocketEventName>(event: T, handler?: WebSocketEventHandler<T>): void {
        if (handler) {
            this.eventHandlers.get(event)?.delete(handler)
            if (this.socket) {
                this.socket.off(event, handler as any)
            }
        } else {
            this.eventHandlers.delete(event)
            if (this.socket) {
                this.socket.removeAllListeners(event)
            }
        }
    }

    emit(event: string, data?: any): void {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data)
        } else {
            console.warn(`Cannot emit ${event}: WebSocket not connected`)
        }
    }

    // Specific event emitters
    joinRoom(room: string): void {
        this.emit('join_room', { room })
    }

    leaveRoom(room: string): void {
        this.emit('leave_room', { room })
    }

    sendMessage(conversationId: string, message: string): void {
        this.emit('message:send', { conversationId, message })
    }

    updateTypingStatus(conversationId: string, isTyping: boolean): void {
        if (isTyping) {
            this.emit('user:typing', { conversationId })
        } else {
            this.emit('user:stop_typing', { conversationId })
        }
    }

    updateMilestoneProgress(milestoneId: string, progress: number): void {
        this.emit('milestone:update_progress', { milestoneId, progress })
    }

    markNotificationAsRead(notificationId: string): void {
        this.emit('notification:mark_read', { notificationId })
    }

    markAllNotificationsAsRead(): void {
        this.emit('notification:mark_all_read')
    }

    // Connection status
    isSocketConnected(): boolean {
        return this.isConnected && this.socket?.connected === true
    }

    isSocketAuthenticated(): boolean {
        return this.isAuthenticated
    }

    getConnectionState(): {
        connected: boolean
        authenticated: boolean
        reconnectAttempts: number
    } {
        return {
            connected: this.isConnected,
            authenticated: this.isAuthenticated,
            reconnectAttempts: this.reconnectAttempts,
        }
    }

    // Private methods
    private setupEventHandlers(): void {
        if (!this.socket) return

        // Re-register all event handlers
        for (const [event, handlers] of this.eventHandlers) {
            for (const handler of handlers) {
                this.socket.on(event, handler as any)
            }
        }
    }

    private handleReconnection(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached')
            return
        }

        this.reconnectAttempts++
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

        setTimeout(() => {
            if (!this.isConnected) {
                this.connect().catch((error) => {
                    console.error('Reconnection failed:', error)
                    this.handleReconnection()
                })
            }
        }, delay)
    }

    private startHeartbeat(): void {
        this.stopHeartbeat()
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.emit('ping')
            }
        }, 30000) // Send ping every 30 seconds
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }
    }
}

// Singleton instance
let websocketService: WebSocketService | null = null

export const getWebSocketService = (config?: WebSocketConfig): WebSocketService => {
    if (!websocketService) {
        websocketService = new WebSocketService(config)
    }
    return websocketService
}

// React hook for WebSocket
export const useWebSocket = () => {
    const ws = getWebSocketService()

    return {
        socket: ws,
        isConnected: ws.isSocketConnected(),
        isAuthenticated: ws.isSocketAuthenticated(),
        connectionState: ws.getConnectionState(),
        connect: () => ws.connect(),
        disconnect: () => ws.disconnect(),
        on: ws.on.bind(ws),
        off: ws.off.bind(ws),
        emit: ws.emit.bind(ws),
        joinRoom: ws.joinRoom.bind(ws),
        leaveRoom: ws.leaveRoom.bind(ws),
        sendMessage: ws.sendMessage.bind(ws),
        updateTypingStatus: ws.updateTypingStatus.bind(ws),
        updateMilestoneProgress: ws.updateMilestoneProgress.bind(ws),
        markNotificationAsRead: ws.markNotificationAsRead.bind(ws),
        markAllNotificationsAsRead: ws.markAllNotificationsAsRead.bind(ws),
    }
}

export default WebSocketService