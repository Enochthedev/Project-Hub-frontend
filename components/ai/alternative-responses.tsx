"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  RefreshCw, 
  Zap, 
  Star, 
  ChevronDown, 
  ChevronUp,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface AlternativeResponse {
  id: string
  content: string
  confidenceScore: number
  sources?: string[]
  qualityMetrics?: {
    helpfulness: number
    accuracy: number
    clarity: number
  }
}

interface AlternativeResponsesProps {
  alternatives: AlternativeResponse[]
  onSelectAlternative: (alternative: AlternativeResponse) => void
  onGenerateMore: () => void
  isGenerating?: boolean
  className?: string
}

export function AlternativeResponses({ 
  alternatives, 
  onSelectAlternative, 
  onGenerateMore,
  isGenerating = false,
  className 
}: AlternativeResponsesProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!alternatives || alternatives.length === 0) {
    return null
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    if (score >= 0.4) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }

  const calculateOverallScore = (alternative: AlternativeResponse) => {
    if (!alternative.qualityMetrics) return alternative.confidenceScore
    
    const { helpfulness, accuracy, clarity } = alternative.qualityMetrics
    return (helpfulness + accuracy + clarity + alternative.confidenceScore) / 4
  }

  const sortedAlternatives = [...alternatives].sort((a, b) => 
    calculateOverallScore(b) - calculateOverallScore(a)
  )

  return (
    <div className={cn("mt-4", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between border-[#DECDF5] dark:border-[#656176]"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Alternative Responses ({alternatives.length})</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <div className="border border-[#DECDF5] dark:border-[#656176] rounded-lg bg-[#F8F1FF] dark:bg-[#656176]/30">
            <div className="p-3 border-b border-[#DECDF5] dark:border-[#656176]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                  Choose the best response
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onGenerateMore}
                  disabled={isGenerating}
                  className="h-7 px-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      More
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <ScrollArea className="max-h-80">
              <div className="p-2 space-y-2">
                {sortedAlternatives.map((alternative, index) => (
                  <div key={alternative.id}>
                    <div
                      className="p-3 rounded-lg border border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#534D56] cursor-pointer hover:bg-[#F8F1FF] dark:hover:bg-[#656176]/50 transition-colors"
                      onClick={() => onSelectAlternative(alternative)}
                    >
                      {/* Header with metrics */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getConfidenceColor(alternative.confidenceScore))}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            {Math.round(alternative.confidenceScore * 100)}%
                          </Badge>
                          
                          {index === 0 && (
                            <Badge className="text-xs bg-[#1B998B] text-white">
                              <Star className="h-3 w-3 mr-1" />
                              Best
                            </Badge>
                          )}
                        </div>
                        
                        {alternative.qualityMetrics && (
                          <div className="flex items-center gap-1 text-xs text-[#656176] dark:text-[#DECDF5]">
                            <span>Overall: {Math.round(calculateOverallScore(alternative) * 100)}%</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content preview */}
                      <p className="text-sm text-[#534D56] dark:text-[#F8F1FF] line-clamp-3 mb-2">
                        {alternative.content}
                      </p>
                      
                      {/* Quality metrics */}
                      {alternative.qualityMetrics && (
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-[#656176] dark:text-[#DECDF5]">Helpful:</span>
                            <span className="text-[#534D56] dark:text-[#F8F1FF]">
                              {Math.round(alternative.qualityMetrics.helpfulness * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#656176] dark:text-[#DECDF5]">Accurate:</span>
                            <span className="text-[#534D56] dark:text-[#F8F1FF]">
                              {Math.round(alternative.qualityMetrics.accuracy * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#656176] dark:text-[#DECDF5]">Clear:</span>
                            <span className="text-[#534D56] dark:text-[#F8F1FF]">
                              {Math.round(alternative.qualityMetrics.clarity * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Sources */}
                      {alternative.sources && alternative.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#DECDF5] dark:border-[#656176]">
                          <div className="flex items-center gap-1 text-xs text-[#656176] dark:text-[#DECDF5]">
                            <span>Sources:</span>
                            <span>{alternative.sources.length}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {index < sortedAlternatives.length - 1 && (
                      <Separator className="my-2 bg-[#DECDF5] dark:bg-[#656176]" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-3 border-t border-[#DECDF5] dark:border-[#656176] bg-[#F8F1FF] dark:bg-[#656176]/30">
              <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
                Click on any response to replace the current one. Responses are ranked by overall quality.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
