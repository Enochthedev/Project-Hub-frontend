import { Suspense } from "react"
import { ConversationList } from "@/components/ai/conversation-list"
import { ConversationSearch } from "@/components/ai/conversation-search"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function ManageContent() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Conversations</h1>
        <p className="text-muted-foreground">View, search, and manage your AI assistant conversations</p>
      </div>

      <Suspense fallback={<SearchLoadingSkeleton />}>
        <ConversationSearch />
      </Suspense>

      <Suspense fallback={<ConversationLoadingSkeleton />}>
        <ConversationList />
      </Suspense>
    </div>
  )
}

function SearchLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </CardContent>
    </Card>
  )
}

function ConversationLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <Skeleton className="h-6 w-[80px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="h-8 w-[70px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AssistantManagePage() {
  return <ManageContent />
}
