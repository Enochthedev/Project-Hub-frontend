"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useProjects } from "@/components/providers/projects-provider"
import { ProjectCard } from "@/components/shared/project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Sparkles, Lightbulb, Code, Rocket, Bookmark, RefreshCw, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { ParticleBackground } from "@/components/ui/particle-background"

export default function AssistantPage() {
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
  const [activeTab, setActiveTab] = useState<"chat" | "templates">("chat")
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    "I'm a Computer Science freshman interested in web development",
    "I need a project idea for my Data Science class",
    "I know Python and want to build something with AI",
    "I'm looking for a group project for my Mobile Development course",
  ]

  const templates = [
    {
      name: "Web Portfolio",
      description: "A personal portfolio website to showcase your projects",
      tags: ["Web", "Frontend", "React"],
      level: "Beginner",
    },
    {
      name: "AI Image Generator",
      description: "Create an app that generates images using AI models",
      tags: ["AI", "Python", "API"],
      level: "Intermediate",
    },
    {
      name: "Mobile Fitness Tracker",
      description: "Track workouts and health metrics with a mobile app",
      tags: ["Mobile", "Health", "React Native"],
      level: "Intermediate",
    },
    {
      name: "Blockchain Voting System",
      description: "A secure voting system built on blockchain technology",
      tags: ["Blockchain", "Security", "Web3"],
      level: "Advanced",
    },
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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

  const handleTemplateSelect = (template: (typeof templates)[0]) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: `I'm interested in the ${template.name} template`,
        timestamp: new Date(),
      },
      {
        type: "assistant",
        content: `Great choice! The ${template.name} is ${template.description}. This is a ${template.level} level project that uses ${template.tags.join(", ")}. Would you like me to generate a detailed project plan for this?`,
        timestamp: new Date(),
      },
    ])
    setActiveTab("chat")
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#F8F1FF] to-[#F0E6FF] dark:from-[#534D56] dark:to-[#483C4F]">
      <div className="container mx-auto flex flex-1 flex-col py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#1B998B] to-[#1B998B]/80">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Project AI Assistant</h1>
              <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Powered by Project Hub</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "chat" | "templates")}>
            <TabsList className="bg-white/50 dark:bg-[#656176]/50 border border-[#DECDF5] dark:border-[#656176]">
              <TabsTrigger value="chat" className="data-[state=active]:bg-[#1B998B] data-[state=active]:text-white">
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="data-[state=active]:bg-[#1B998B] data-[state=active]:text-white"
              >
                Templates
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === "chat" ? (
          <div className="flex flex-1 flex-col rounded-xl border border-[#DECDF5] bg-white/80 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
            <div className="flex-1 overflow-y-auto p-6">
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
                                  Generate More Ideas
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
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-xl border border-[#DECDF5] bg-white/80 p-6 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Project Templates</h2>
              <p className="text-[#656176] dark:text-[#DECDF5]">
                Start with a template to quickly get project ideas tailored to popular categories
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="group cursor-pointer rounded-lg border border-[#DECDF5] bg-white p-4 transition-all hover:border-[#1B998B] hover:shadow-md dark:border-[#656176] dark:bg-[#656176]/50 dark:hover:border-[#1B998B]"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B998B]/10 text-[#1B998B] transition-all group-hover:bg-[#1B998B] group-hover:text-white">
                      {index === 0 ? (
                        <Code className="h-5 w-5" />
                      ) : index === 1 ? (
                        <Sparkles className="h-5 w-5" />
                      ) : index === 2 ? (
                        <Lightbulb className="h-5 w-5" />
                      ) : (
                        <Rocket className="h-5 w-5" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">{template.name}</h3>
                  </div>

                  <p className="mb-3 text-[#656176] dark:text-[#DECDF5]">{template.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-[#F8F1FF] text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]"
                      >
                        {tag}
                      </Badge>
                    ))}
                    <Badge
                      className={
                        template.level === "Beginner"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : template.level === "Intermediate"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }
                    >
                      {template.level}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg bg-[#F8F1FF] p-4 dark:bg-[#656176]/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B998B]/10">
                  <Lightbulb className="h-5 w-5 text-[#1B998B]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">Need a custom project?</h3>
                  <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
                    Switch to chat mode and describe your interests for personalized recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Background elements */}
      <ParticleBackground
        particleColor="#1B998B"
        particleCount={20}
        speed={0.3}
        className="opacity-10 dark:opacity-20"
      />
      <AnimatedBlob color="#1B998B" size="lg" speed="slow" opacity={0.1} className="-left-20 -top-20 z-0" />
      <AnimatedBlob color="#DECDF5" size="md" speed="medium" opacity={0.2} className="right-10 top-40 z-0" />
    </div>
  )
}
