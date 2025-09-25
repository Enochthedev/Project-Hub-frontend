import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProjectCompareLoading() {
  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Project Selection */}
      <div className="mb-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 pb-4 border-b">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
            </div>

            {/* Table Rows */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}
