import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Searches */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
