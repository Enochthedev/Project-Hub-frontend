import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  conversationId: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  projectId?: string
}

interface AIAssistantState {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  loadConversations: () => Promise<void>
  createConversation: (data: { title?: string; projectId?: string; initialQuery?: string }) => Promise<Conversation>
  deleteConversation: (id: string) => Promise<void>
  setCurrentConversation: (id: string | null) => void
  askQuestion: (query: string, conversationId?: string) => Promise<Message>
  clearError: () => void
}

// Mock AI responses for development
const mockResponses = [
  "That's a great project idea! Here are some suggestions to get you started...",
  "Based on your requirements, I'd recommend focusing on these key areas...",
  "Here are some similar projects you might find interesting...",
  "Consider these technologies for your project stack...",
  "Here's a potential timeline for your project development...",
]

const generateMockResponse = (query: string): string => {
  const responses = mockResponses
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  return `${randomResponse}\n\nRegarding "${query}", here are some specific recommendations:\n\n• Start with a clear project scope\n• Research existing solutions\n• Plan your technology stack\n• Set realistic milestones\n• Consider user feedback early`
}

export const useAIAssistantStore = create<AIAssistantState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      error: null,

      loadConversations: async () => {
        set({ isLoading: true, error: null })
        try {
          // In a real app, this would fetch from an API
          // For now, we'll use the persisted conversations
          set({ isLoading: false })
        } catch (error) {
          set({ error: "Failed to load conversations", isLoading: false })
        }
      },

      createConversation: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const conversation: Conversation = {
            id: `conv_${Date.now()}`,
            title: data.title || "New Conversation",
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            projectId: data.projectId,
          }

          // If there's an initial query, add it and get a response
          if (data.initialQuery) {
            const userMessage: Message = {
              id: `msg_${Date.now()}`,
              role: "user",
              content: data.initialQuery,
              timestamp: new Date(),
              conversationId: conversation.id,
            }

            const assistantMessage: Message = {
              id: `msg_${Date.now() + 1}`,
              role: "assistant",
              content: generateMockResponse(data.initialQuery),
              timestamp: new Date(),
              conversationId: conversation.id,
            }

            conversation.messages = [userMessage, assistantMessage]
            conversation.title = data.initialQuery.slice(0, 50) + (data.initialQuery.length > 50 ? "..." : "")
          }

          set((state) => ({
            conversations: [conversation, ...state.conversations],
            currentConversationId: conversation.id,
            isLoading: false,
          }))

          return conversation
        } catch (error) {
          set({ error: "Failed to create conversation", isLoading: false })
          throw error
        }
      },

      deleteConversation: async (id) => {
        set({ isLoading: true, error: null })
        try {
          set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
            currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
            isLoading: false,
          }))
        } catch (error) {
          set({ error: "Failed to delete conversation", isLoading: false })
        }
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id })
      },

      askQuestion: async (query, conversationId) => {
        set({ isLoading: true, error: null })
        try {
          const targetConversationId = conversationId || get().currentConversationId

          if (!targetConversationId) {
            throw new Error("No conversation selected")
          }

          const userMessage: Message = {
            id: `msg_${Date.now()}`,
            role: "user",
            content: query,
            timestamp: new Date(),
            conversationId: targetConversationId,
          }

          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const assistantMessage: Message = {
            id: `msg_${Date.now() + 1}`,
            role: "assistant",
            content: generateMockResponse(query),
            timestamp: new Date(),
            conversationId: targetConversationId,
          }

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === targetConversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, userMessage, assistantMessage],
                    updatedAt: new Date(),
                  }
                : conv,
            ),
            isLoading: false,
          }))

          return assistantMessage
        } catch (error) {
          set({ error: "Failed to send message", isLoading: false })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "ai-assistant-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    },
  ),
)
