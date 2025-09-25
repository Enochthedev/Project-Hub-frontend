"use client"

import { useState, useEffect } from "react"
import { useAIAssistantStore } from "@/lib/stores/ai-assistant-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  MessageCircle, 
  Search, 
  Plus, 
  Archive, 
  AlertTriangle,
  Clock,
  Filter,
  MoreVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Conversation } from "@/lib/api/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ConversationListProps {
  onConversationSelect: (conversation: Conversation) => void
  onNewConversation: () => void
  selectedConversationId?: string
  className?: string
}

export function ConversationList({ 
  onConversationSelect, 
  onNewConversation, 
  selectedConversationId,
  className 
}: ConversationListProps) {
  const {
    conversations,
    isLoadingConversations,
    conversationError,
    conversationFilters,
    loadConversations,
    searchConversations,
  } = useAIAssistantStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!conversations.length && !isLoadingConversations) {
      loadConversations()
    }
  }, [conversations.length, isLoadingConversations, loadConversations])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    searchConversations({
      ...conversationFilters,
      search: query || undefined,
    })
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    searchConversations({
      ...conversationFilters,
      status: status === "all" ? undefined : status as any,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      case 'escalated':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <MessageCircle className="h-3 w-3" />
      case 'archived':
        return <Archive className="h-3 w-3" />
      case 'escalated':
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <MessageCircle className="h-3 w-3" />
    }
  }

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-[#DECDF5] dark:border-[#656176]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">
            Conversations
          </h2>
          <Button
            onClick={onNewConversation}
            size="sm"
            className="bg-[#1B998B] hover:bg-[#1B998B]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656176] dark:text-[#DECDF5]" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 border-[#DECDF5] dark:border-[#656176]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#656176] dark:text-[#DECDF5]" />
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-32 h-8 text-xs border-[#DECDF5] dark:border-[#656176]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {isLoadingConversations ? (
          <div className="p-4 text-center text-[#656176] dark:text-[#DECDF5]">
            Loading conversations...
          </div>
        ) : conversationError ? (
          <div className="p-4 text-center text-red-600 dark:text-red-400">
            {conversationError}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-[#656176] dark:text-[#DECDF5]">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new conversation to get help</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation, index) => (
              <div key={conversation.id}>
                <div
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all hover:bg-[#F8F1FF] dark:hover:bg-[#656176]/30",
                    selectedConversationId === conversation.id && 
                    "bg-[#1B998B]/10 border border-[#1B998B]/20"
                  )}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-[#534D56] dark:text-[#F8F1FF] text-sm line-clamp-1">
                      {conversation.title || 'Untitled Conversation'}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getStatusColor(conversation.status))}
                    >
                      {getStatusIcon(conversation.status)}
                      <span className="ml-1 capitalize">{conversation.status}</span>
                    </Badge>
                    <div className="flex items-center text-xs text-[#656176] dark:text-[#DECDF5]">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatLastMessageTime(conversation.lastMessageAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#656176] dark:text-[#DECDF5]">
                    <span>{conversation.messageCount} messages</span>
                    {conversation.projectId && (
                      <Badge variant="outline" className="text-xs">
                        Project
                      </Badge>
                    )}
                  </div>
                </div>
                {index < conversations.length - 1 && (
                  <Separator className="my-2 bg-[#DECDF5] dark:bg-[#656176]" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}