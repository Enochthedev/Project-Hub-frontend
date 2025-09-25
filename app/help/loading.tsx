import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function HelpLoading() {
  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-10 max-w-2xl mx-auto" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 flex-1" />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-6" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
