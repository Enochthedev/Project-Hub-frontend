"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAIAssistantStore } from "@/lib/stores/ai-assistant-store"

interface AIContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  // Expose store methods for easy access
  loadConversations: () => Promise<void>
  createConversation: (data: { title?: string; projectId?: string; initialQuery?: string }) => Promise<any>
  askQuestion: (query: string, conversationId?: string) => Promise<any>
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { loadConversations, createConversation, askQuestion } = useAIAssistantStore()

  // Load conversations when provider mounts
  useEffect(() => {
    loadConversations().catch(console.error)
  }, [loadConversations])

  return (
    <AIContext.Provider
      value={{
        isOpen,
        setIsOpen,
        loadConversations,
        createConversation,
        askQuestion,
      }}
    >
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider")
  }
  return context
}
