"use client"

import { Button } from "@/components/ui/button"
import { useAI } from "@/components/providers/ai-provider"
import { AIAssistantDialog } from "@/components/ai/assistant-dialog"
import { useState, useEffect } from "react"
import { Bot, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function AIAssistantButton() {
  const { isOpen, setIsOpen } = useAI()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Periodically animate the button to draw attention
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 2000)
    }, 15000)

    // Show tooltip after 3 seconds on first visit
    const timer = setTimeout(() => {
      if (!localStorage.getItem("tooltipShown")) {
        setShowTooltip(true)
        localStorage.setItem("tooltipShown", "true")

        // Hide tooltip after 5 seconds
        setTimeout(() => {
          setShowTooltip(false)
        }, 5000)
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-white p-3 text-sm shadow-lg dark:bg-[#534D56] border border-[#DECDF5] dark:border-[#656176]"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1B998B]" />
                <p className="text-[#534D56] dark:text-[#F8F1FF]">Need project ideas? Ask our AI assistant!</p>
              </div>
              <div className="absolute -bottom-2 right-4 h-3 w-3 rotate-45 bg-white dark:bg-[#534D56] border-r border-b border-[#DECDF5] dark:border-[#656176]"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            id="ai-assistant"
            className={`h-14 w-14 rounded-full bg-gradient-to-r from-[#1B998B] to-[#1B998B]/90 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isAnimating ? "animate-pulse" : ""
            }`}
            onClick={() => setIsOpen(true)}
          >
            <div className="relative">
              <div
                className={`absolute inset-0 rounded-full ${isAnimating ? "animate-ping" : ""} bg-white/20 opacity-75`}
              ></div>
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="sr-only">Open AI Assistant</span>
          </Button>
        </motion.div>
      </div>

      <AIAssistantDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
