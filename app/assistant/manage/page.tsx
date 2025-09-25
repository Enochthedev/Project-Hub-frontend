import type { Metadata } from "next"
import { Suspense } from "react"
import { ConversationList } from "@/components/ai/conversation-list"
import { ConversationSearch } from "@/components/ai/conversation-search"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Manage Conversations | AI Assistant",
  description: "Manage your AI assistant conversations and chat history",
}

function ConversationContent() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      }
    >
      <ConversationList />
    </Suspense>
  )
}

function SearchContent() {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-64" />}>
      <ConversationSearch />
    </Suspense>
  )
}

export default function ManageConversationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Conversations</h1>
            <p className="text-muted-foreground">View and manage your AI assistant conversations</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <SearchContent />
          <Button variant="outline">Filter</Button>
        </div>

        {/* Conversations */}
        <ConversationContent />
      </div>
    </div>
  )
}
