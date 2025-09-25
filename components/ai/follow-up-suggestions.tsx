"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface FollowUpSuggestionsProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
  className?: string
}

export function FollowUpSuggestions({ 
  suggestions, 
  onSuggestionClick, 
  className 
}: FollowUpSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className={cn("mt-4 p-4 bg-[#F8F1FF] dark:bg-[#656176]/30 rounded-lg border border-[#DECDF5] dark:border-[#656176]", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-[#1B998B]" />
        <span className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
          Follow-up suggestions
        </span>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start text-left h-auto p-3 hover:bg-[#1B998B]/10 dark:hover:bg-[#1B998B]/20"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <div className="flex items-start gap-2 w-full">
              <ArrowRight className="h-4 w-4 text-[#1B998B] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-[#534D56] dark:text-[#F8F1FF] text-left">
                {suggestion}
              </span>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-[#DECDF5] dark:border-[#656176]">
        <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
          Click on any suggestion to continue the conversation
        </p>
      </div>
    </div>
  )
}
