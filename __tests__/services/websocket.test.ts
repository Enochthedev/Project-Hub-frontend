import { io } from 'socket.io-client'
import WebSocketService, { getWebSocketService } from '@/lib/services/websocket'
import { authUtils } from '@/lib/api/auth'

// Mock socket.io-client
jest.mock('socket.io-client')
const mockIo = io as jest.MockedFunction<typeof io>

// Mock auth utils
jest.mock('@/lib/api/auth', () => ({
    authUtils: {
        isAuthenticated: jest.fn(),
        getStoredTokens: jest.fn(),
    },
}))

const mockAuthUtils = authUtils as jest.Mocked<typeof authUtils>

describe('WebSocketService', () => {
    let mockSocket: any
    let service: WebSocketService

    beforeEach(() => {
        // Create mock socket
        mockSocket = {
            connected: false,
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
            disconnect: jest.fn(),
            removeAllListeners: jest.fn(),
        }

        mockIo.mockReturnValue(mockSocket)
        mockAuthUtils.isAuthenticated.mockReturnValue(true)
        mockAuthUtils.getStoredTokens.mockReturnValue({
            accessToken: 'test-token',
            refreshToken: 'refresh-token',
        })

        service = new WebSocketService({ autoConnect: false })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('connection management', () => {
        it('should create socket connection', async () => {
            const connectPromise = service.connect()

            // Simulate successful connection
            mockSocket.connected = true
            const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1]
            connectHandler?.()

            await connectPromise

            expect(mockIo).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    transports: ['websocket', 'polling'],
                    timeout: 20000,
                })
            )
            expect(service.isSocketConnected()).toBe(true)
        })

        it('should handle connection error', async () => {
            const connectPromise = service.connect()

            // Simulate connection error
            const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')?.[1]
            const error = new Error('Connection failed')
            errorHandler?.(error)

            await expect(connectPromise).rejects.toThrow('Connection failed')
        })

        it('should disconnect properly', () => {
            service.disconnect()

            expect(mockSocket.disconnect).toHaveBeenCalled()
            expect(service.isSocketConnected()).toBe(false)
        })
    })

    describe('authentication', () => {
        it('should authenticate with token', async () => {
            const connectPromise = service.connect()

            // Simulate connection and authentication
            mockSocket.connected = true
            const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1]
            connectHandler?.()

            const authenticatedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'authenticated')?.[1]
            authenticatedHandler?.({ userId: 'test-user' })

            await connectPromise

            expect(mockSocket.emit).toHaveBeenCalledWith('authenticate', { token: 'test-token' })
            expect(service.isSocketAuthenticated()).toBe(true)
        })

        it('should handle authentication error', async () => {
            const connectPromise = service.connect()

            // Simulate connection
            mockSocket.connected = true
            const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1]
            connectHandler?.()

            // Simulate authentication error
            const authErrorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'authentication_error')?.[1]
            authErrorHandler?.({ message: 'Invalid token' })

            await connectPromise

            expect(service.isSocketAuthenticated()).toBe(false)
        })
    })

    describe('event handling', () => {
        it('should register event handlers', () => {
            const handler = jest.fn()

            service.on('message:new', handler)

            expect(mockSocket.on).toHaveBeenCalledWith('message:new', handler)
        })

        it('should remove event handlers', () => {
            const handler = jest.fn()

            service.on('message:new', handler)
            service.off('message:new', handler)

            expect(mockSocket.off).toHaveBeenCalledWith('message:new', handler)
        })

        it('should remove all listeners for event', () => {
            service.off('message:new')

            expect(mockSocket.removeAllListeners).toHaveBeenCalledWith('message:new')
        })

        it('should emit events when connected', () => {
            // Set up connected state
            mockSocket.connected = true
            service['isConnected'] = true

            service.emit('test:event', { data: 'test' })

            expect(mockSocket.emit).toHaveBeenCalledWith('test:event', { data: 'test' })
        })

        it('should not emit events when disconnected', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

            service.emit('test:event', { data: 'test' })

            expect(mockSocket.emit).not.toHaveBeenCalled()
            expect(consoleSpy).toHaveBeenCalledWith('Cannot emit test:event: WebSocket not connected')

            consoleSpy.mockRestore()
        })
    })

    describe('room management', () => {
        beforeEach(() => {
            mockSocket.connected = true
            service['isConnected'] = true
        })

        it('should join room', () => {
            service.joinRoom('test-room')

            expect(mockSocket.emit).toHaveBeenCalledWith('join_room', { room: 'test-room' })
        })

        it('should leave room', () => {
            service.leaveRoom('test-room')

            expect(mockSocket.emit).toHaveBeenCalledWith('leave_room', { room: 'test-room' })
        })
    })

    describe('specific event emitters', () => {
        beforeEach(() => {
            mockSocket.connected = true
            service['isConnected'] = true
        })

        it('should send message', () => {
            service.sendMessage('conv-1', 'Hello world')

            expect(mockSocket.emit).toHaveBeenCalledWith('message:send', {
                conversationId: 'conv-1',
                message: 'Hello world',
            })
        })

        it('should update typing status', () => {
            service.updateTypingStatus('conv-1', true)

            expect(mockSocket.emit).toHaveBeenCalledWith('user:typing', {
                conversationId: 'conv-1',
            })

            service.updateTypingStatus('conv-1', false)

            expect(mockSocket.emit).toHaveBeenCalledWith('user:stop_typing', {
                conversationId: 'conv-1',
            })
        })

        it('should update milestone progress', () => {
            service.updateMilestoneProgress('milestone-1', 75)

            expect(mockSocket.emit).toHaveBeenCalledWith('milestone:update_progress', {
                milestoneId: 'milestone-1',
                progress: 75,
            })
        })

        it('should mark notification as read', () => {
            service.markNotificationAsRead('notif-1')

            expect(mockSocket.emit).toHaveBeenCalledWith('notification:mark_read', {
                notificationId: 'notif-1',
            })
        })
    })

    describe('connection state', () => {
        it('should return connection state', () => {
            const state = service.getConnectionState()

            expect(state).toEqual({
                connected: false,
                authenticated: false,
                reconnectAttempts: 0,
            })
        })
    })

    describe('singleton pattern', () => {
        it('should return same instance', () => {
            const service1 = getWebSocketService()
            const service2 = getWebSocketService()

            expect(service1).toBe(service2)
        })
    })
})