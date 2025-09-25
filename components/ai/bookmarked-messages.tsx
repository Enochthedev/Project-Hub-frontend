"use client"

import { useState, useEffect } from "react"
import { useAIAssistantStore } from "@/lib/stores/ai-assistant-store"
import { Message } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Bookmark, 
  BookmarkCheck,
  Star,
  Copy,
  ExternalLink,
  Filter,
  Calendar,
  Tag,
  Folder,
  MoreVertical,
  Trash2,
  Edit3
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface BookmarkCategory {
  id: string
  name: string
  color: string
  count: number
}

interface BookmarkedMessagesProps {
  className?: string
}

export function BookmarkedMessages({ className }: BookmarkedMessagesProps) {
  const { bookmarkedMessages, loadBookmarkedMessages, isLoadingBookmarks } = useAIAssistantStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'category'>('date')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")

  // Mock categories - in real app, these would come from the API
  const [categories] = useState<BookmarkCategory[]>([
    { id: 'project-help', name: 'Project Help', color: 'bg-blue-500', count: 12 },
    { id: 'technical', name: 'Technical', color: 'bg-green-500', count: 8 },
    { id: 'research', name: 'Research', color: 'bg-purple-500', count: 5 },
    { id: 'general', name: 'General', color: 'bg-gray-500', count: 3 },
  ])

  useEffect(() => {
    loadBookmarkedMessages()
  }, [loadBookmarkedMessages])

  const filteredMessages = bookmarkedMessages.filter(message => {
    const matchesSearch = !searchQuery || 
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
      message.metadata?.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0)
      case 'category':
        return (a.metadata?.category || '').localeCompare(b.metadata?.category || '')
      default:
        return 0
    }
  })

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || 
           { id: 'other', name: 'Other', color: 'bg-gray-500', count: 0 }
  }

  const handleEditNote = (messageId: string, currentNote?: string) => {
    setEditingNote(messageId)
    setNoteText(currentNote || '')
  }

  const saveNote = async () => {
    if (editingNote) {
      // In real app, would call API to update note
      console.log('Saving note for message:', editingNote, noteText)
      setEditingNote(null)
      setNoteText('')
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-5 w-5 text-[#1B998B]" />
          <h2 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">
            Bookmarked Messages
          </h2>
          <Badge variant="secondary" className="text-xs">
            {bookmarkedMessages.length}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656176] dark:text-[#DECDF5]" />
          <Input
            placeholder="Search bookmarked messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#DECDF5] dark:border-[#656176]"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", category.color)} />
                    {category.name} ({category.count})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map(category => (
          <div
            key={category.id}
            className={cn(
              "p-3 rounded-lg border cursor-pointer transition-colors",
              selectedCategory === category.id
                ? "border-[#1B998B] bg-[#1B998B]/10"
                : "border-[#DECDF5] dark:border-[#656176] hover:bg-[#F8F1FF] dark:hover:bg-[#656176]/30"
            )}
            onClick={() => setSelectedCategory(category.id)}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-3 h-3 rounded-full", category.color)} />
              <span className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                {category.name}
              </span>
            </div>
            <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
              {category.count} messages
            </p>
          </div>
        ))}
      </div>

      {/* Messages List */}
      <ScrollArea className="h-96">
        {isLoadingBookmarks ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[#656176] dark:text-[#DECDF5]">Loading bookmarks...</p>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Bookmark className="h-12 w-12 text-[#656176] dark:text-[#DECDF5] mb-2" />
            <p className="text-[#656176] dark:text-[#DECDF5]">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No bookmarks match your filters' 
                : 'No bookmarked messages yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMessages.map((message, index) => {
              const categoryInfo = getCategoryInfo(message.metadata?.category || 'other')
              
              return (
                <div key={message.id}>
                  <div className="p-4 rounded-lg border border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#534D56]">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", categoryInfo.color)} />
                        <Badge variant="secondary" className="text-xs">
                          {categoryInfo.name}
                        </Badge>
                        {message.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-[#656176] dark:text-[#DECDF5]">
                              {message.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(message.content)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditNote(message.id, message.metadata?.note)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Note
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Bookmark
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-[#534D56] dark:text-[#F8F1FF] mb-3 line-clamp-3">
                      {message.content}
                    </p>

                    {/* Note */}
                    {message.metadata?.note && (
                      <div className="p-2 bg-[#F8F1FF] dark:bg-[#656176]/30 rounded border-l-2 border-[#1B998B] mb-3">
                        <p className="text-xs text-[#534D56] dark:text-[#F8F1FF]">
                          <strong>Note:</strong> {message.metadata.note}
                        </p>
                      </div>
                    )}

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-[#656176] dark:text-[#DECDF5]">Sources:</span>
                        {message.sources.slice(0, 3).map((source, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {idx + 1}
                          </Badge>
                        ))}
                        {message.sources.length > 3 && (
                          <span className="text-xs text-[#656176] dark:text-[#DECDF5]">
                            +{message.sources.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-[#656176] dark:text-[#DECDF5]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Bookmarked {formatTimestamp(message.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>From conversation</span>
                        <Badge variant="outline" className="text-xs">
                          {message.conversationId.slice(0, 8)}...
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {index < sortedMessages.length - 1 && (
                    <Separator className="my-4 bg-[#DECDF5] dark:bg-[#656176]" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bookmark Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note about why this message is helpful..."
              className="min-h-20"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button onClick={saveNote} className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}