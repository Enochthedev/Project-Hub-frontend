"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface AIContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AIContext.Provider
      value={{
        isOpen,
        setIsOpen,
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
