"use client"

import type React from "react"

import { useState } from "react"
import { EnhancedChatInterface } from "@/components/ai/enhanced-chat-interface"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bot, Lightbulb, Code, Rocket } from "lucide-react"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { ParticleBackground } from "@/components/ui/particle-background"

export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "templates">("chat")

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

  const handleTemplateSelect = (template: (typeof templates)[0]) => {
    // Switch to chat tab and potentially create a new conversation with the template
    setActiveTab("chat")
    // The enhanced chat interface will handle the conversation creation
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
          <div className="flex-1 rounded-xl border border-[#DECDF5] bg-white/80 backdrop-blur dark:border-[#656176] dark:bg-[#656176]/30 overflow-hidden">
            <EnhancedChatInterface className="h-full" />
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
