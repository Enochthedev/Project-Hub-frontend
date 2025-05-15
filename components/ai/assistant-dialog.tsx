"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useProjects } from "@/components/providers/projects-provider"
import { ProjectCard } from "@/components/shared/project-card"
import { Bot, User, Send, Sparkles, RefreshCw, Bookmark, Loader2, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface AIAssistantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIAssistantDialog({ open, onOpenChange }: AIAssistantDialogProps) {
  const { generateProjects, isGenerating, generatedProjects } = useProjects()
  const [messages, setMessages] = useState<
    Array<{
      type: "user" | "assistant" | "projects"
      content: string
      timestamp: Date
    }>
  >([
    {
      type: "assistant",
      content:
        "Hi there! I'm your Project Hub AI assistant. I can help you discover project ideas tailored to your skills and interests. What are you studying, and what technologies are you interested in?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useMobile()

  const suggestions = [
    "I'm a CS freshman interested in web dev",
    "Need a Data Science project idea",
    "I know Python and want to build with AI",
    "Looking for a Mobile Dev group project",
  ]

  useEffect(() => {
    if (open) {
      scrollToBottom()
    }
  }, [messages, open])

  useEffect(() => {
    if (generatedProjects.length > 0 && !messages.some((m) => m.type === "projects")) {
      setMessages((prev) => [
        ...prev,
        {
          type: "projects",
          content: "Here are some project ideas based on your profile:",
          timestamp: new Date(),
        },
      ])
    }
  }, [generatedProjects])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = {
      type: "user" as const,
      content: inputValue,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setShowSuggestions(false)

    // Simulate thinking
    setTimeout(() => {
      // Extract information from the message
      const message = inputValue.toLowerCase()
      const formData = {
        name: "User",
        level: message.includes("freshman")
          ? "100"
          : message.includes("sophomore")
            ? "200"
            : message.includes("junior")
              ? "300"
              : message.includes("senior")
                ? "400"
                : "500",
        discipline: message.includes("computer science")
          ? "Computer Science"
          : message.includes("data science")
            ? "Data Science"
            : message.includes("engineering")
              ? "Engineering"
              : "Other",
        interests: message,
        tools: message,
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Thanks for sharing! I'll generate some project ideas based on your background and interests.",
          timestamp: new Date(),
        },
      ])

      // Generate projects
      generateProjects(formData)
    }, 1000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
  }

  const handleRegenerateProjects = () => {
    // Extract the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.type === "user")
    if (lastUserMessage) {
      const formData = {
        name: "User",
        level: "300", // Default to junior
        discipline: "Computer Science", // Default
        interests: lastUserMessage.content,
        tools: lastUserMessage.content,
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "I'll generate some different project ideas for you!",
          timestamp: new Date(),
        },
      ])

      // Generate new projects
      generateProjects(formData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0 overflow-hidden border-[#DECDF5] dark:border-[#656176] bg-gradient-to-b from-white to-[#F8F1FF] dark:from-[#534D56] dark:to-[#483C4F]",
          isMobile
            ? "w-[calc(100vw-32px)] h-[calc(100vh-100px)] max-w-none rounded-lg"
            : "sm:max-w-[500px] md:max-w-[600px] h-[600px]",
        )}
      >
        {/* Header */}
        <div className="flex items-center border-b border-[#DECDF5] dark:border-[#656176] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#1B998B] to-[#1B998B]/80">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Project AI Assistant</h2>
              <div className="flex items-center gap-1 text-xs text-[#656176] dark:text-[#DECDF5]">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                Online
              </div>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "assistant" && (
                  <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1B998B]/10">
                    <Bot className="h-4 w-4 text-[#1B998B]" />
                  </div>
                )}

                {message.type === "projects" ? (
                  <div className="w-full">
                    <div className="mb-2 flex items-center">
                      <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1B998B]/10">
                        <Sparkles className="h-4 w-4 text-[#1B998B]" />
                      </div>
                      <div className="rounded-lg bg-[#F8F1FF] px-4 py-2 text-[#534D56] dark:bg-[#656176] dark:text-[#F8F1FF]">
                        {message.content}
                      </div>
                    </div>

                    <div className="ml-11 space-y-4">
                      {generatedProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} showSaveButton />
                      ))}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
                          onClick={handleRegenerateProjects}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-3 w-3" />
                              More Ideas
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
                        >
                          <Bookmark className="mr-2 h-3 w-3" />
                          Save All
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === "user"
                        ? "bg-[#1B998B] text-white"
                        : "bg-[#F8F1FF] text-[#534D56] dark:bg-[#656176] dark:text-[#F8F1FF]"
                    }`}
                  >
                    {message.content}
                    <div className="mt-1 text-right text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                )}

                {message.type === "user" && (
                  <div className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#DECDF5] dark:bg-[#534D56]">
                    <User className="h-4 w-4 text-[#534D56] dark:text-[#DECDF5]" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex justify-start"
            >
              <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1B998B]/10">
                <Bot className="h-4 w-4 text-[#1B998B]" />
              </div>
              <div className="flex items-center rounded-lg bg-[#F8F1FF] px-4 py-2 text-[#534D56] dark:bg-[#656176] dark:text-[#F8F1FF]">
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
                <span className="ml-2">Generating project ideas...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-[#DECDF5] p-4 dark:border-[#656176]">
          {showSuggestions && (
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tell me about your interests and skills..."
              className="flex-1 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
            />
            <Button type="submit" className="bg-[#1B998B] hover:bg-[#1B998B]/90">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-3 flex items-center justify-center">
            <div className="flex items-center gap-1 text-xs text-[#656176] dark:text-[#DECDF5]">
              <Zap className="h-3 w-3 text-[#1B998B]" />
              <span>Powered by Project Hub AI</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
