import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { aiAssistantApi } from '@/lib/api/ai-assistant'
import { Conversation, Message, AIResponse } from '@/lib/api/types'

interface AIAssistantState {
    // Conversations
    conversations: Conversation[]
    currentConversation: Conversation | null
    isLoadingConversations: boolean
    conversationError: string | null

    // Messages
    messages: Message[]
    isLoadingMessages: boolean
    messagesError: string | null

    // AI Response
    isGeneratingResponse: boolean
    responseError: string | null

    // Search and filters
    conversationFilters: {
        status?: 'active' | 'archived' | 'escalated'
        projectId?: string
        search?: string
    }
    messageFilters: {
        isBookmarked?: boolean
        minRating?: number
        search?: string
    }

    // Bookmarked messages
    bookmarkedMessages: Message[]
    isLoadingBookmarks: boolean

    // Actions
    loadConversations: () => Promise<void>
    createConversation: (data: { title?: string; projectId?: string; initialQuery?: string }) => Promise<Conversation>
    selectConversation: (conversationId: string) => Promise<void>
    loadMessages: (conversationId: string, offset?: number) => Promise<void>
    askQuestion: (query: string, conversationId?: string) => Promise<AIResponse>
    bookmarkMessage: (messageId: string, note?: string) => Promise<void>
    rateMessage: (messageId: string, rating: number, feedback?: string) => Promise<void>
    loadBookmarkedMessages: () => Promise<void>
    searchConversations: (filters: any) => Promise<void>
    searchMessages: (filters: any) => Promise<void>
    clearError: () => void
    reset: () => void
}

const initialState = {
    conversations: [],
    currentConversation: null,
    isLoadingConversations: false,
    conversationError: null,
    messages: [],
    isLoadingMessages: false,
    messagesError: null,
    isGeneratingResponse: false,
    responseError: null,
    conversationFilters: {},
    messageFilters: {},
    bookmarkedMessages: [],
    isLoadingBookmarks: false,
}

export const useAIAssistantStore = create<AIAssistantState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            loadConversations: async () => {
                set({ isLoadingConversations: true, conversationError: null })
                try {
                    const { conversationFilters } = get()
                    const result = await aiAssistantApi.getConversations({
                        ...conversationFilters,
                        limit: 50,
                        offset: 0,
                    })
                    set({
                        conversations: result.conversations,
                        isLoadingConversations: false
                    })
                } catch (error) {
                    set({
                        conversationError: error instanceof Error ? error.message : 'Failed to load conversations',
                        isLoadingConversations: false
                    })
                }
            },

            createConversation: async (data) => {
                try {
                    const conversation = await aiAssistantApi.createConversation({
                        title: data.title,
                        projectId: data.projectId,
                        language: 'en',
                        initialQuery: data.initialQuery,
                    })

                    set(state => ({
                        conversations: [conversation, ...state.conversations],
                        currentConversation: conversation,
                    }))

                    return conversation
                } catch (error) {
                    set({
                        conversationError: error instanceof Error ? error.message : 'Failed to create conversation'
                    })
                    throw error
                }
            },

            selectConversation: async (conversationId: string) => {
                const { conversations } = get()
                const conversation = conversations.find(c => c.id === conversationId)

                if (conversation) {
                    set({ currentConversation: conversation })
                    await get().loadMessages(conversationId)
                }
            },

            loadMessages: async (conversationId: string, offset = 0) => {
                set({ isLoadingMessages: true, messagesError: null })
                try {
                    const result = await aiAssistantApi.getConversationMessages(conversationId, 50, offset)

                    set(state => ({
                        messages: offset === 0 ? result.messages : [...state.messages, ...result.messages],
                        isLoadingMessages: false
                    }))
                } catch (error) {
                    set({
                        messagesError: error instanceof Error ? error.message : 'Failed to load messages',
                        isLoadingMessages: false
                    })
                }
            },

            askQuestion: async (query: string, conversationId?: string) => {
                set({ isGeneratingResponse: true, responseError: null })
                try {
                    const response = await aiAssistantApi.askQuestion({
                        query,
                        conversationId,
                        language: 'en',
                        includeProjectContext: true,
                    })

                    // Add user message and AI response to current messages
                    const userMessage: Message = {
                        id: `temp-user-${Date.now()}`,
                        conversationId: conversationId || '',
                        type: 'user',
                        content: query,
                        isBookmarked: false,
                        status: 'sent',
                        createdAt: new Date().toISOString(),
                    }

                    const aiMessage: Message & {
                        suggestedFollowUps?: string[]
                        escalationSuggestion?: string
                        qualityMetrics?: {
                            helpfulness: number
                            accuracy: number
                            clarity: number
                        }
                    } = {
                        id: response.messageId,
                        conversationId: response.conversationId,
                        type: 'assistant',
                        content: response.response,
                        metadata: response.metadata,
                        confidenceScore: response.confidenceScore,
                        sources: response.sources,
                        isBookmarked: false,
                        status: 'delivered',
                        createdAt: new Date().toISOString(),
                        suggestedFollowUps: response.suggestedFollowUps,
                        escalationSuggestion: response.escalationSuggestion,
                        qualityMetrics: response.metadata?.qualityMetrics ? {
                            helpfulness: response.metadata.qualityMetrics.helpfulness || 0.8,
                            accuracy: response.metadata.qualityMetrics.accuracy || 0.85,
                            clarity: response.metadata.qualityMetrics.clarity || 0.9,
                        } : undefined,
                    }

                    set(state => ({
                        messages: [...state.messages, userMessage, aiMessage],
                        isGeneratingResponse: false
                    }))

                    return response
                } catch (error) {
                    set({
                        responseError: error instanceof Error ? error.message : 'Failed to generate response',
                        isGeneratingResponse: false
                    })
                    throw error
                }
            },

            bookmarkMessage: async (messageId: string, note?: string) => {
                try {
                    const updatedMessage = await aiAssistantApi.bookmarkMessage(messageId, note)

                    set(state => ({
                        messages: state.messages.map(msg =>
                            msg.id === messageId ? { ...msg, isBookmarked: true } : msg
                        ),
                        bookmarkedMessages: [...state.bookmarkedMessages, updatedMessage]
                    }))
                } catch (error) {
                    console.error('Failed to bookmark message:', error)
                }
            },

            rateMessage: async (messageId: string, rating: number, feedback?: string) => {
                try {
                    const updatedMessage = await aiAssistantApi.rateMessage(messageId, rating, feedback)

                    set(state => ({
                        messages: state.messages.map(msg =>
                            msg.id === messageId
                                ? { ...msg, averageRating: updatedMessage.averageRating, ratingCount: updatedMessage.ratingCount }
                                : msg
                        )
                    }))
                } catch (error) {
                    console.error('Failed to rate message:', error)
                }
            },

            loadBookmarkedMessages: async () => {
                set({ isLoadingBookmarks: true })
                try {
                    const result = await aiAssistantApi.getBookmarkedMessages(50, 0)
                    set({
                        bookmarkedMessages: result.messages,
                        isLoadingBookmarks: false
                    })
                } catch (error) {
                    set({ isLoadingBookmarks: false })
                    console.error('Failed to load bookmarked messages:', error)
                }
            },

            searchConversations: async (filters) => {
                set({ conversationFilters: filters })
                await get().loadConversations()
            },

            searchMessages: async (filters) => {
                set({ messageFilters: filters })
                // Implement message search if needed
            },

            clearError: () => {
                set({
                    conversationError: null,
                    messagesError: null,
                    responseError: null
                })
            },

            reset: () => {
                set(initialState)
            },
        }),
        {
            name: 'ai-assistant-store',
        }
    )
)
