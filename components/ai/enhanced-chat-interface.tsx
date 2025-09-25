"use client"

import { useState, useRef, useEffect } from "react"
import { useAIAssistantStore } from "@/lib/stores/ai-assistant-store"
import { ConversationList } from "./conversation-list"
import { MessageItem } from "./message-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Bot, 
  Loader2, 
  Sparkles,
  MessageSquare,
  Search,
  Settings,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Conversation } from "@/lib/api/types"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

interface EnhancedChatInterfaceProps {
  className?: string
  initialConversationId?: string
  projectId?: string
}

export function EnhancedChatInterface({ 
  className, 
  initialConversationId,
  projectId 
}: EnhancedChatInterfaceProps) {
  const {
    conversations,
    currentConversation,
    messages,
    isLoadingMessages,
    isGeneratingResponse,
    messagesError,
    responseError,
    selectConversation,
    createConversation,
    askQuestion,
    loadMessages,
    clearError,
  } = useAIAssistantStore()

  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)
  const [newConversationTitle, setNewConversationTitle] = useState("")
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isMobile } = useMobile()

  const suggestions = [
    "How do I choose a good project topic?",
    "What are the key milestones for my project?",
    "How should I structure my project proposal?",
    "What research methods should I use?",
    "How do I manage my project timeline?",
  ]

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load initial conversation if provided
  useEffect(() => {
    if (initialConversationId && !currentConversation) {
      selectConversation(initialConversationId)
    }
  }, [initialConversationId, currentConversation, selectConversation])

  // Focus input when conversation changes
  useEffect(() => {
    if (currentConversation && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentConversation])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isGeneratingResponse) return

    const query = inputValue.trim()
    setInputValue("")
    setShowSuggestions(false)

    try {
      // If no current conversation, create one
      let conversationId = currentConversation?.id
      if (!conversationId) {
        const newConversation = await createConversation({
          title: query.slice(0, 50) + (query.length > 50 ? '...' : ''),
          projectId,
          initialQuery: query,
        })
        conversationId = newConversation.id
      }

      await askQuestion(query, conversationId)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleConversationSelect = (conversation: Conversation) => {
    selectConversation(conversation.id)
    if (isMobile) {
      setShowMobileSidebar(false)
    }
  }

  const handleNewConversation = async () => {
    try {
      const conversation = await createConversation({
        title: newConversationTitle || undefined,
        projectId,
      })
      setNewConversationTitle("")
      setShowNewConversationDialog(false)
      if (isMobile) {
        setShowMobileSidebar(false)
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const handleRegenerate = async () => {
    if (!currentConversation || !messages.length) return
    
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.type === 'user')
    if (lastUserMessage) {
      try {
        await askQuestion(lastUserMessage.content, currentConversation.id)
      } catch (error) {
        console.error('Failed to regenerate response:', error)
      }
    }
  }

  const ConversationSidebar = () => (
    <ConversationList
      onConversationSelect={handleConversationSelect}
      onNewConversation={() => setShowNewConversationDialog(true)}
      selectedConversationId={currentConversation?.id}
      className="h-full"
    />
  )

  return (
    <div className={cn("flex h-full bg-white dark:bg-[#534D56]", className)}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-80 border-r border-[#DECDF5] dark:border-[#656176]">
          <ConversationSidebar />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
          <SheetContent side="left" className="w-80 p-0">
            <ConversationSidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#DECDF5] dark:border-[#656176]">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
              </Sheet>
            )}
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#1B998B] to-[#1B998B]/80">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">
                  {currentConversation?.title || 'AI Assistant'}
                </h2>
                <div className="flex items-center gap-1 text-xs text-[#656176] dark:text-[#DECDF5]">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                  Online
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentConversation && (
              <Badge variant="secondary" className="text-xs">
                {messages.length} messages
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {!currentConversation ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1B998B]/10 mb-4">
                <MessageSquare className="h-8 w-8 text-[#1B998B]" />
              </div>
              <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-2">
                Welcome to AI Assistant
              </h3>
              <p className="text-[#656176] dark:text-[#DECDF5] mb-6 max-w-md">
                Start a conversation to get help with your project, ask questions, or get guidance on your academic journey.
              </p>
              <Button
                onClick={() => setShowNewConversationDialog(true)}
                className="bg-[#1B998B] hover:bg-[#1B998B]/90"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          ) : isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-[#1B998B]" />
            </div>
          ) : messagesError ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{messagesError}</p>
              <Button onClick={clearError} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageItem
                      message={message}
                      onRegenerate={message.type === 'assistant' ? handleRegenerate : undefined}
                      onFollowUpClick={handleSuggestionClick}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {isGeneratingResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mb-6"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1B998B]/10">
                    <Bot className="h-4 w-4 text-[#1B998B]" />
                  </div>
                  <div className="flex items-center rounded-lg bg-[#F8F1FF] px-4 py-3 text-[#534D56] dark:bg-[#656176] dark:text-[#F8F1FF]">
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-[#1B998B]"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-[#1B998B]"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-[#1B998B]"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span className="ml-2">Thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-[#DECDF5] p-4 dark:border-[#656176]">
          {responseError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{responseError}</p>
              <Button 
                onClick={clearError} 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-red-600 dark:text-red-400"
              >
                Dismiss
              </Button>
            </div>
          )}

          {showSuggestions && currentConversation && messages.length === 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  className="cursor-pointer bg-[#F8F1FF] text-[#534D56] hover:bg-[#DECDF5] dark:bg-[#656176] dark:text-[#DECDF5] dark:hover:bg-[#534D56]"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                currentConversation 
                  ? "Ask a question..." 
                  : "Start a conversation..."
              }
              className="flex-1 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
              disabled={isGeneratingResponse}
            />
            <Button 
              type="submit" 
              className="bg-[#1B998B] hover:bg-[#1B998B]/90"
              disabled={!inputValue.trim() || isGeneratingResponse}
              aria-label="Send message"
            >
              {isGeneratingResponse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                Conversation Title (optional)
              </label>
              <Input
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                placeholder="e.g., Project Planning Help"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewConversationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNewConversation}
                className="bg-[#1B998B] hover:bg-[#1B998B]/90"
              >
                Start Conversation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
