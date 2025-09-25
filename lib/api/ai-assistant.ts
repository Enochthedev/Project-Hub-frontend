import { api, ApiResponse } from './client'
import { Conversation, Message, AIResponse } from './types'

export interface CreateConversationData {
    title?: string
    projectId?: string
    language?: string
    initialQuery?: string
}

export interface AskQuestionData {
    query: string
    conversationId?: string
    language?: string
    includeProjectContext?: boolean
}

export interface BookmarkMessageData {
    messageId: string
    note?: string
}

export interface RateMessageData {
    messageId: string
    rating: number // 1-5
    feedback?: string
}

export interface MessageSearchFilters {
    conversationId?: string
    search?: string
    isBookmarked?: boolean
    minRating?: number
    limit?: number
    offset?: number
    sortBy?: 'createdAt' | 'rating'
    sortOrder?: 'ASC' | 'DESC'
}

export interface ConversationSearchFilters {
    status?: 'active' | 'archived' | 'escalated'
    projectId?: string
    language?: string
    search?: string
    limit?: number
    offset?: number
}

export interface KnowledgeSearchFilters {
    query: string
    category?: string
    language?: string
    limit?: number
}

// AI Assistant API service
export const aiAssistantApi = {
    // Conversation Management
    createConversation: async (data: CreateConversationData): Promise<Conversation> => {
        const response = await api.post<Conversation>('/ai-assistant/conversations', data)
        return response.data!
    },

    getConversations: async (filters: ConversationSearchFilters = {}): Promise<{
        conversations: Conversation[]
        total: number
        hasMore: boolean
    }> => {
        const params = new URLSearchParams()

        if (filters.status) params.append('status', filters.status)
        if (filters.projectId) params.append('projectId', filters.projectId)
        if (filters.language) params.append('language', filters.language)
        if (filters.search) params.append('search', filters.search)
        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.offset) params.append('offset', filters.offset.toString())

        const response = await api.get(`/ai-assistant/conversations?${params.toString()}`)
        return response.data!
    },

    getConversationMessages: async (
        conversationId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<{
        messages: Message[]
        total: number
        hasMore: boolean
    }> => {
        const response = await api.get(
            `/ai-assistant/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
        )
        return response.data!
    },

    getConversationContext: async (conversationId: string): Promise<any> => {
        const response = await api.get(`/ai-assistant/conversations/${conversationId}/context`)
        return response.data!
    },

    // Q&A and Interaction
    askQuestion: async (data: AskQuestionData): Promise<AIResponse> => {
        const response = await api.post<AIResponse>('/ai-assistant/ask', data)
        return response.data!
    },

    bookmarkMessage: async (messageId: string, note?: string): Promise<Message> => {
        const response = await api.post<Message>(`/ai-assistant/messages/${messageId}/bookmark`, {
            note,
        })
        return response.data!
    },

    rateMessage: async (messageId: string, rating: number, feedback?: string): Promise<Message> => {
        const response = await api.post<Message>(`/ai-assistant/messages/${messageId}/rate`, {
            rating,
            feedback,
        })
        return response.data!
    },

    // Search and Knowledge Base
    searchKnowledge: async (filters: KnowledgeSearchFilters): Promise<any> => {
        const params = new URLSearchParams()
        params.append('query', filters.query)
        if (filters.category) params.append('category', filters.category)
        if (filters.language) params.append('language', filters.language)
        if (filters.limit) params.append('limit', filters.limit.toString())

        const response = await api.get(`/ai-assistant/knowledge/search?${params.toString()}`)
        return response.data!
    },

    getBookmarkedMessages: async (
        limit: number = 50,
        offset: number = 0
    ): Promise<{
        messages: Message[]
        total: number
        hasMore: boolean
    }> => {
        const response = await api.get(
            `/ai-assistant/messages/bookmarked?limit=${limit}&offset=${offset}`
        )
        return response.data!
    },
}

// AI Assistant utility functions
export const aiAssistantUtils = {
    // Format confidence score as percentage
    formatConfidenceScore: (score: number): string => {
        return `${Math.round(score * 100)}%`
    },

    // Get confidence score color
    getConfidenceScoreColor: (score: number): string => {
        if (score >= 0.8) return 'green'
        if (score >= 0.6) return 'yellow'
        if (score >= 0.4) return 'orange'
        return 'red'
    },

    // Get confidence score label
    getConfidenceScoreLabel: (score: number): string => {
        if (score >= 0.8) return 'High Confidence'
        if (score >= 0.6) return 'Medium Confidence'
        if (score >= 0.4) return 'Low Confidence'
        return 'Very Low Confidence'
    },

    // Check if message needs human review
    needsHumanReview: (message: Message): boolean => {
        return message.metadata?.requiresHumanReview || false
    },

    // Format message timestamp
    formatMessageTimestamp: (timestamp: string): string => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString()
    },

    // Extract keywords from message content
    extractKeywords: (content: string): string[] => {
        // Simple keyword extraction - in a real app, you might use a more sophisticated approach
        const words = content.toLowerCase().split(/\W+/)
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])

        return words
            .filter(word => word.length > 3 && !stopWords.has(word))
            .slice(0, 10) // Limit to top 10 keywords
    },

    // Check if conversation is escalated
    isEscalated: (conversation: Conversation): boolean => {
        return conversation.status === 'escalated'
    },

    // Get conversation status color
    getConversationStatusColor: (status: string): string => {
        const colors: Record<string, string> = {
            active: 'green',
            archived: 'gray',
            escalated: 'red',
        }
        return colors[status] || 'gray'
    },

    // Format conversation status
    formatConversationStatus: (status: string): string => {
        const statuses: Record<string, string> = {
            active: 'Active',
            archived: 'Archived',
            escalated: 'Escalated',
        }
        return statuses[status] || status
    },

    // Calculate conversation activity score
    calculateActivityScore: (conversation: Conversation): number => {
        const messageCount = conversation.messageCount
        const daysSinceLastMessage = Math.floor(
            (new Date().getTime() - new Date(conversation.lastMessageAt).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Higher score for more messages and recent activity
        return Math.max(0, messageCount - daysSinceLastMessage)
    },

    // Group conversations by project
    groupConversationsByProject: (conversations: Conversation[]): Record<string, Conversation[]> => {
        return conversations.reduce((groups, conv) => {
            const projectId = conv.projectId || 'general'
            if (!groups[projectId]) {
                groups[projectId] = []
            }
            groups[projectId].push(conv)
            return groups
        }, {} as Record<string, Conversation[]>)
    },

    // Filter messages by rating
    filterMessagesByRating: (messages: Message[], minRating: number): Message[] => {
        return messages.filter(msg => (msg.averageRating || 0) >= minRating)
    },

    // Get most helpful messages
    getMostHelpfulMessages: (messages: Message[], limit: number = 10): Message[] => {
        return messages
            .filter(msg => msg.averageRating && msg.ratingCount && msg.ratingCount > 0)
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, limit)
    },
}
