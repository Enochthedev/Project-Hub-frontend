import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResetPasswordLoading() {
  return (
    <main className="container py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto h-8 w-64 mb-2" />
          <Skeleton className="mx-auto h-4 w-80" />
        </div>

        <Card className="border-[#DECDF5] bg-white shadow-sm dark:border-[#656176] dark:bg-[#656176]/30">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-10 w-full" />

            <div className="text-center">
              <Skeleton className="mx-auto h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
