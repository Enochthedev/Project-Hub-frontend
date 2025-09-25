"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useAIAssistantStore } from "@/lib/stores/ai-assistant-store"
import { Bot, User, Send, Plus, MessageSquare, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface AIAssistantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIAssistantDialog({ open, onOpenChange }: AIAssistantDialogProps) {
  const [input, setInput] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    currentConversationId,
    isLoading,
    error,
    createConversation,
    setCurrentConversation,
    askQuestion,
    deleteConversation,
    clearError,
  } = useAIAssistantStore()

  const currentConversation = conversations.find((conv) => conv.id === currentConversationId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const query = input.trim()
    setInput("")

    try {
      if (!currentConversationId) {
        await createConversation({ initialQuery: query })
      } else {
        await askQuestion(query, currentConversationId)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleNewConversation = async () => {
    try {
      await createConversation({ title: "New Conversation" })
    } catch (error) {
      console.error("Failed to create conversation:", error)
    }
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id)
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          {sidebarOpen && (
            <div className="w-80 border-r bg-muted/20 flex flex-col">
              <DialogHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Assistant
                  </DialogTitle>
                  <Button variant="outline" size="sm" onClick={handleNewConversation} disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "group flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                        currentConversationId === conversation.id && "bg-muted",
                      )}
                      onClick={() => setCurrentConversation(conversation.id)}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(conversation.updatedAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteConversation(conversation.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {conversations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs">Start a new conversation to get help with your projects</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {!sidebarOpen && (
              <DialogHeader className="p-4 border-b">
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant
                </DialogTitle>
              </DialogHeader>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {currentConversation ? (
                <div className="space-y-4">
                  {currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{format(new Date(message.timestamp), "HH:mm")}</p>
                      </div>

                      {message.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Welcome to AI Assistant</h3>
                    <p className="text-muted-foreground mb-4">
                      Start a new conversation to get help with your projects
                    </p>
                    <Button onClick={handleNewConversation} disabled={isLoading}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Conversation
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Error Display */}
            {error && (
              <div className="px-4 py-2 bg-destructive/10 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    ×
                  </Button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about project ideas, technologies, or anything else..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} size="icon">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  💡 Try asking: "Suggest a web development project"
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  🚀 Or: "Help me plan my final year project"
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
