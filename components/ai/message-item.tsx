"use client"

import { useState } from "react"
import { Message, AIResponse } from "@/lib/api/types"
import { useAIAssistantStore } from "@/lib/stores/ai-assistant-store"
import { FollowUpSuggestions } from "./follow-up-suggestions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Bot, 
  User, 
  Bookmark, 
  BookmarkCheck,
  ThumbsUp, 
  ThumbsDown,
  Star,
  Copy,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MessageItemProps {
  message: Message & {
    suggestedFollowUps?: string[]
    escalationSuggestion?: string
    qualityMetrics?: {
      helpfulness: number
      accuracy: number
      clarity: number
    }
  }
  onRegenerate?: () => void
  onFollowUpClick?: (suggestion: string) => void
  className?: string
}

export function MessageItem({ message, onRegenerate, onFollowUpClick, className }: MessageItemProps) {
  const { bookmarkMessage, rateMessage } = useAIAssistantStore()
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [bookmarkNote, setBookmarkNote] = useState("")
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [ratingFeedback, setRatingFeedback] = useState("")
  const [showRatingPopover, setShowRatingPopover] = useState(false)

  const isUserMessage = message.type === 'user'
  const isAIMessage = message.type === 'assistant'

  const handleBookmark = async () => {
    if (message.isBookmarked) return
    
    setIsBookmarking(true)
    try {
      await bookmarkMessage(message.id, bookmarkNote)
      setShowBookmarkDialog(false)
      setBookmarkNote("")
    } catch (error) {
      console.error('Failed to bookmark message:', error)
    } finally {
      setIsBookmarking(false)
    }
  }

  const handleRating = async (newRating: number) => {
    setRating(newRating)
    try {
      await rateMessage(message.id, newRating, ratingFeedback)
      setShowRatingPopover(false)
      setRatingFeedback("")
    } catch (error) {
      console.error('Failed to rate message:', error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    if (score >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    if (score >= 0.4) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }

  const getConfidenceLabel = (score?: number) => {
    if (!score) return 'Unknown'
    if (score >= 0.8) return 'High Confidence'
    if (score >= 0.6) return 'Medium Confidence'
    if (score >= 0.4) return 'Low Confidence'
    return 'Very Low Confidence'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const needsHumanReview = message.metadata?.requiresHumanReview

  return (
    <div className={cn("flex gap-3 mb-6", isUserMessage && "flex-row-reverse", className)}>
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
        isUserMessage 
          ? "bg-[#DECDF5] dark:bg-[#534D56]" 
          : "bg-[#1B998B]/10"
      )}>
        {isUserMessage ? (
          <User className="h-4 w-4 text-[#534D56] dark:text-[#DECDF5]" />
        ) : (
          <Bot className="h-4 w-4 text-[#1B998B]" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 max-w-[80%]", isUserMessage && "flex flex-col items-end")}>
        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-lg px-4 py-3",
            isUserMessage
              ? "bg-[#1B998B] text-white"
              : "bg-[#F8F1FF] text-[#534D56] dark:bg-[#656176] dark:text-[#F8F1FF]"
          )}
        >
          {/* AI Message Header */}
          {isAIMessage && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {message.confidenceScore && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", getConfidenceColor(message.confidenceScore))}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {Math.round(message.confidenceScore * 100)}%
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{getConfidenceLabel(message.confidenceScore)}</p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span>Confidence:</span>
                                <span>{Math.round(message.confidenceScore * 100)}%</span>
                              </div>
                              <Progress 
                                value={message.confidenceScore * 100} 
                                className="h-1 w-20"
                              />
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {needsHumanReview && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Review
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This response may benefit from human review</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {message.escalationSuggestion && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Escalate
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{message.escalationSuggestion}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {message.averageRating && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{message.averageRating.toFixed(1)}</span>
                    <span className="text-[#656176] dark:text-[#DECDF5]">
                      ({message.ratingCount})
                    </span>
                  </div>
                )}
              </div>

              {/* Quality Metrics */}
              {message.qualityMetrics && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 p-1 rounded bg-[#DECDF5]/30 dark:bg-[#656176]/30">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-[#534D56] dark:text-[#F8F1FF]">
                            {Math.round(message.qualityMetrics.helpfulness * 100)}%
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Helpfulness Score</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 p-1 rounded bg-[#DECDF5]/30 dark:bg-[#656176]/30">
                          <CheckCircle className="h-3 w-3 text-blue-600" />
                          <span className="text-[#534D56] dark:text-[#F8F1FF]">
                            {Math.round(message.qualityMetrics.accuracy * 100)}%
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Accuracy Score</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 p-1 rounded bg-[#DECDF5]/30 dark:bg-[#656176]/30">
                          <Zap className="h-3 w-3 text-purple-600" />
                          <span className="text-[#534D56] dark:text-[#F8F1FF]">
                            {Math.round(message.qualityMetrics.clarity * 100)}%
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clarity Score</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#DECDF5] dark:border-[#656176]">
              <p className="text-xs font-medium mb-2 text-[#656176] dark:text-[#DECDF5]">
                Sources:
              </p>
              <div className="flex flex-wrap gap-1">
                {message.sources.map((source, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-[#1B998B]/10"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Source {index + 1}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className={cn(
            "mt-2 text-xs opacity-70 flex items-center gap-1",
            isUserMessage ? "justify-start" : "justify-end"
          )}>
            <Clock className="h-3 w-3" />
            {formatTimestamp(message.createdAt)}
            {message.status === 'delivered' && <CheckCircle className="h-3 w-3" />}
          </div>
        </div>

        {/* Message Actions */}
        {isAIMessage && (
          <div className="flex items-center gap-1 mt-2">
            {/* Copy Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Bookmark Button */}
            <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
              <DialogTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={message.isBookmarked}
                      >
                        {message.isBookmarked ? (
                          <BookmarkCheck className="h-3 w-3 text-[#1B998B]" />
                        ) : (
                          <Bookmark className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{message.isBookmarked ? 'Bookmarked' : 'Bookmark message'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bookmark Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-[#F8F1FF] dark:bg-[#656176]/30 rounded-lg">
                    <p className="text-sm text-[#534D56] dark:text-[#F8F1FF] line-clamp-3">
                      {message.content}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                      Add a note (optional)
                    </label>
                    <Textarea
                      value={bookmarkNote}
                      onChange={(e) => setBookmarkNote(e.target.value)}
                      placeholder="Why is this message helpful?"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowBookmarkDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBookmark}
                      disabled={isBookmarking}
                      className="bg-[#1B998B] hover:bg-[#1B998B]/90"
                    >
                      {isBookmarking ? 'Saving...' : 'Bookmark'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Rating Button */}
            <Popover open={showRatingPopover} onOpenChange={setShowRatingPopover}>
              <PopoverTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rate this response</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">
                    Rate this response
                  </h4>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRating(star)}
                      >
                        <Star 
                          className={cn(
                            "h-4 w-4",
                            (rating || 0) >= star 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          )} 
                        />
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    placeholder="Optional feedback..."
                    className="text-sm"
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Regenerate Button */}
            {onRegenerate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={onRegenerate}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenerate response</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {/* Follow-up Suggestions */}
        {isAIMessage && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && onFollowUpClick && (
          <FollowUpSuggestions
            suggestions={message.suggestedFollowUps}
            onSuggestionClick={onFollowUpClick}
            className="mt-3"
          />
        )}
      </div>
    </div>
  )
}
