import { getWebSocketService } from './websocket'
import { Message, Conversation } from '@/lib/api/types'

export interface TypingUser {
    userId: string
    userName: string
    timestamp: number
}

export interface ChatState {
    conversations: Map<string, Conversation>
    messages: Map<string, Message[]> // conversationId -> messages
    typingUsers: Map<string, TypingUser[]> // conversationId -> typing users
    activeConversation: string | null
}

export interface ChatEventHandlers {
    onMessageReceived: (conversationId: string, message: Message) => void
    onMessageUpdated: (conversationId: string, message: Message) => void
    onMessageDeleted: (conversationId: string, messageId: string) => void
    onConversationUpdated: (conversation: Conversation) => void
    onUserTyping: (conversationId: string, user: TypingUser) => void
    onUserStoppedTyping: (conversationId: string, userId: string) => void
    onConnectionStateChanged: (connected: boolean, authenticated: boolean) => void
}

class RealtimeChatService {
    private websocket = getWebSocketService()
    private state: ChatState = {
        conversations: new Map(),
        messages: new Map(),
        typingUsers: new Map(),
        activeConversation: null,
    }
    private eventHandlers: Partial<ChatEventHandlers> = {}
    private typingTimeouts: Map<string, NodeJS.Timeout> = new Map()
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

        // Message events
        this.websocket.on('message:new', this.handleNewMessage.bind(this))
        this.websocket.on('message:updated', this.handleMessageUpdated.bind(this))
        this.websocket.on('message:deleted', this.handleMessageDeleted.bind(this))

        // Conversation events
        this.websocket.on('conversation:updated', this.handleConversationUpdated.bind(this))

        // Typing events
        this.websocket.on('user:typing', this.handleUserTyping.bind(this))
        this.websocket.on('user:stop_typing', this.handleUserStoppedTyping.bind(this))

        this.isInitialized = true
    }

    // Event handler registration
    setEventHandlers(handlers: Partial<ChatEventHandlers>): void {
        this.eventHandlers = { ...this.eventHandlers, ...handlers }
    }

    // Conversation management
    setActiveConversation(conversationId: string | null): void {
        // Leave previous conversation room
        if (this.state.activeConversation) {
            this.websocket.leaveRoom(`conversation:${this.state.activeConversation}`)
        }

        this.state.activeConversation = conversationId

        // Join new conversation room
        if (conversationId) {
            this.websocket.joinRoom(`conversation:${conversationId}`)

            // Initialize typing users for this conversation if not exists
            if (!this.state.typingUsers.has(conversationId)) {
                this.state.typingUsers.set(conversationId, [])
            }
        }
    }

    getActiveConversation(): string | null {
        return this.state.activeConversation
    }

    // Message management
    addMessage(conversationId: string, message: Message): void {
        if (!this.state.messages.has(conversationId)) {
            this.state.messages.set(conversationId, [])
        }

        const messages = this.state.messages.get(conversationId)!

        // Check if message already exists (avoid duplicates)
        const existingIndex = messages.findIndex(m => m.id === message.id)
        if (existingIndex >= 0) {
            messages[existingIndex] = message
        } else {
            messages.push(message)
            // Sort by creation date
            messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        }
    }

    updateMessage(conversationId: string, message: Message): void {
        const messages = this.state.messages.get(conversationId)
        if (messages) {
            const index = messages.findIndex(m => m.id === message.id)
            if (index >= 0) {
                messages[index] = message
            }
        }
    }

    removeMessage(conversationId: string, messageId: string): void {
        const messages = this.state.messages.get(conversationId)
        if (messages) {
            const index = messages.findIndex(m => m.id === messageId)
            if (index >= 0) {
                messages.splice(index, 1)
            }
        }
    }

    getMessages(conversationId: string): Message[] {
        return this.state.messages.get(conversationId) || []
    }

    // Typing indicators
    startTyping(conversationId: string): void {
        if (this.state.activeConversation === conversationId) {
            this.websocket.updateTypingStatus(conversationId, true)

            // Auto-stop typing after 3 seconds of inactivity
            const timeoutKey = `${conversationId}:typing`
            if (this.typingTimeouts.has(timeoutKey)) {
                clearTimeout(this.typingTimeouts.get(timeoutKey)!)
            }

            const timeout = setTimeout(() => {
                this.stopTyping(conversationId)
            }, 3000)

            this.typingTimeouts.set(timeoutKey, timeout)
        }
    }

    stopTyping(conversationId: string): void {
        if (this.state.activeConversation === conversationId) {
            this.websocket.updateTypingStatus(conversationId, false)

            const timeoutKey = `${conversationId}:typing`
            if (this.typingTimeouts.has(timeoutKey)) {
                clearTimeout(this.typingTimeouts.get(timeoutKey)!)
                this.typingTimeouts.delete(timeoutKey)
            }
        }
    }

    getTypingUsers(conversationId: string): TypingUser[] {
        return this.state.typingUsers.get(conversationId) || []
    }

    // Send message
    sendMessage(conversationId: string, content: string): void {
        this.websocket.sendMessage(conversationId, content)
        this.stopTyping(conversationId) // Stop typing when sending
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
        console.log('Chat service: WebSocket connected')
        this.eventHandlers.onConnectionStateChanged?.(true, false)
    }

    private handleDisconnect(): void {
        console.log('Chat service: WebSocket disconnected')
        this.eventHandlers.onConnectionStateChanged?.(false, false)

        // Clear typing indicators on disconnect
        this.state.typingUsers.clear()
    }

    private handleAuthenticated(): void {
        console.log('Chat service: WebSocket authenticated')
        this.eventHandlers.onConnectionStateChanged?.(true, true)

        // Rejoin active conversation room if any
        if (this.state.activeConversation) {
            this.websocket.joinRoom(`conversation:${this.state.activeConversation}`)
        }
    }

    private handleNewMessage(data: { conversationId: string; message: Message }): void {
        const { conversationId, message } = data

        this.addMessage(conversationId, message)
        this.eventHandlers.onMessageReceived?.(conversationId, message)

        // Remove typing indicator for the user who sent the message
        if (message.type === 'user') {
            this.removeTypingUser(conversationId, 'current-user') // This would be the actual user ID
        }
    }

    private handleMessageUpdated(data: { messageId: string; message: Message }): void {
        const { message } = data
        const conversationId = message.conversationId

        this.updateMessage(conversationId, message)
        this.eventHandlers.onMessageUpdated?.(conversationId, message)
    }

    private handleMessageDeleted(data: { messageId: string; conversationId: string }): void {
        const { messageId, conversationId } = data

        this.removeMessage(conversationId, messageId)
        this.eventHandlers.onMessageDeleted?.(conversationId, messageId)
    }

    private handleConversationUpdated(data: { conversationId: string; conversation: Conversation }): void {
        const { conversation } = data

        this.state.conversations.set(conversation.id, conversation)
        this.eventHandlers.onConversationUpdated?.(conversation)
    }

    private handleUserTyping(data: { userId: string; conversationId: string }): void {
        const { userId, conversationId } = data

        // Don't show typing indicator for current user
        if (userId === 'current-user') return // This would be the actual current user ID

        const typingUser: TypingUser = {
            userId,
            userName: 'AI Assistant', // This would come from user data
            timestamp: Date.now(),
        }

        this.addTypingUser(conversationId, typingUser)
        this.eventHandlers.onUserTyping?.(conversationId, typingUser)

        // Auto-remove typing indicator after 5 seconds
        setTimeout(() => {
            this.removeTypingUser(conversationId, userId)
        }, 5000)
    }

    private handleUserStoppedTyping(data: { userId: string; conversationId: string }): void {
        const { userId, conversationId } = data

        this.removeTypingUser(conversationId, userId)
        this.eventHandlers.onUserStoppedTyping?.(conversationId, userId)
    }

    private addTypingUser(conversationId: string, user: TypingUser): void {
        if (!this.state.typingUsers.has(conversationId)) {
            this.state.typingUsers.set(conversationId, [])
        }

        const typingUsers = this.state.typingUsers.get(conversationId)!
        const existingIndex = typingUsers.findIndex(u => u.userId === user.userId)

        if (existingIndex >= 0) {
            typingUsers[existingIndex] = user
        } else {
            typingUsers.push(user)
        }
    }

    private removeTypingUser(conversationId: string, userId: string): void {
        const typingUsers = this.state.typingUsers.get(conversationId)
        if (typingUsers) {
            const index = typingUsers.findIndex(u => u.userId === userId)
            if (index >= 0) {
                typingUsers.splice(index, 1)
            }
        }
    }

    // Cleanup
    cleanup(): void {
        // Clear all typing timeouts
        for (const timeout of this.typingTimeouts.values()) {
            clearTimeout(timeout)
        }
        this.typingTimeouts.clear()

        // Leave active conversation room
        if (this.state.activeConversation) {
            this.websocket.leaveRoom(`conversation:${this.state.activeConversation}`)
        }

        // Clear state
        this.state = {
            conversations: new Map(),
            messages: new Map(),
            typingUsers: new Map(),
            activeConversation: null,
        }
    }
}

// Singleton instance
let realtimeChatService: RealtimeChatService | null = null

export const getRealtimeChatService = (): RealtimeChatService => {
    if (!realtimeChatService) {
        realtimeChatService = new RealtimeChatService()
    }
    return realtimeChatService
}

// React hook for real-time chat
export const useRealtimeChat = () => {
    const service = getRealtimeChatService()

    return {
        setActiveConversation: service.setActiveConversation.bind(service),
        getActiveConversation: service.getActiveConversation.bind(service),
        getMessages: service.getMessages.bind(service),
        sendMessage: service.sendMessage.bind(service),
        startTyping: service.startTyping.bind(service),
        stopTyping: service.stopTyping.bind(service),
        getTypingUsers: service.getTypingUsers.bind(service),
        isConnected: service.isConnected.bind(service),
        isAuthenticated: service.isAuthenticated.bind(service),
        getConnectionState: service.getConnectionState.bind(service),
        setEventHandlers: service.setEventHandlers.bind(service),
        cleanup: service.cleanup.bind(service),
    }
}

export default RealtimeChatService
