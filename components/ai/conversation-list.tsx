"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Calendar, Clock, Trash2, Archive, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  title: string
  preview: string
  messageCount: number
  lastActivity: string
  createdAt: string
  isBookmarked: boolean
  isArchived: boolean
  tags: string[]
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchConversations = async () => {
      setIsLoading(true)

      // Mock data - replace with actual API call
      const mockConversations: Conversation[] = [
        {
          id: "1",
          title: "Project Planning Discussion",
          preview: "Can you help me create a timeline for my web development project?",
          messageCount: 15,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          isBookmarked: true,
          isArchived: false,
          tags: ["planning", "web-dev"],
        },
        {
          id: "2",
          title: "Machine Learning Concepts",
          preview: "What are the key differences between supervised and unsupervised learning?",
          messageCount: 8,
          lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          isBookmarked: false,
          isArchived: false,
          tags: ["ml", "concepts"],
        },
        {
          id: "3",
          title: "Database Design Help",
          preview: "I need help designing a database schema for my e-commerce application.",
          messageCount: 22,
          lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          isBookmarked: true,
          isArchived: false,
          tags: ["database", "design"],
        },
        {
          id: "4",
          title: "React Best Practices",
          preview: "What are some best practices for state management in React applications?",
          messageCount: 12,
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          isBookmarked: false,
          isArchived: false,
          tags: ["react", "best-practices"],
        },
        {
          id: "5",
          title: "API Integration Questions",
          preview: "How do I handle authentication when integrating with third-party APIs?",
          messageCount: 6,
          lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          isBookmarked: false,
          isArchived: true,
          tags: ["api", "auth"],
        },
      ]

      setTimeout(() => {
        setConversations(mockConversations)
        setIsLoading(false)
      }, 1000)
    }

    fetchConversations()
  }, [])

  const handleBookmark = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, isBookmarked: !conv.isBookmarked } : conv)),
    )
  }

  const handleArchive = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, isArchived: !conv.isArchived } : conv)),
    )
  }

  const handleDelete = (conversationId: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
  }

  if (isLoading) {
    return <ConversationListSkeleton />
  }

  const activeConversations = conversations.filter((conv) => !conv.isArchived)
  const archivedConversations = conversations.filter((conv) => conv.isArchived)

  return (
    <div className="space-y-6">
      {/* Active Conversations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Conversations</h2>
        {activeConversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No active conversations yet. Start a new conversation with the AI assistant!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onBookmark={handleBookmark}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archived Conversations */}
      {archivedConversations.length > 0 && (
        <div>
          <Separator className="my-6" />
          <h2 className="text-xl font-semibold mb-4">Archived Conversations</h2>
          <div className="space-y-4">
            {archivedConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onBookmark={handleBookmark}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ConversationCard({
  conversation,
  onBookmark,
  onArchive,
  onDelete,
}: {
  conversation: Conversation
  onBookmark: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card className={conversation.isArchived ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{conversation.title}</CardTitle>
              {conversation.isBookmarked && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              {conversation.isArchived && <Badge variant="secondary">Archived</Badge>}
            </div>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {conversation.messageCount} messages
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">{conversation.preview}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {conversation.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBookmark(conversation.id)}
              className={conversation.isBookmarked ? "text-yellow-600" : ""}
            >
              <Star className={`h-4 w-4 ${conversation.isBookmarked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onArchive(conversation.id)}>
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(conversation.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-[250px] bg-muted animate-pulse rounded" />
                <div className="h-4 w-[300px] bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-[80%] bg-muted animate-pulse rounded" />
              <div className="flex gap-2 mt-4">
                <div className="h-6 w-[60px] bg-muted animate-pulse rounded" />
                <div className="h-6 w-[80px] bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
