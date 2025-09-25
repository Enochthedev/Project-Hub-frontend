import { Loader2 } from "lucide-react"

export default function ResetPasswordLoading() {
  return (
    <main className="container py-20">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#1B998B]" />
            <p className="text-[#656176] dark:text-[#DECDF5]">Loading reset password form...</p>
          </div>
        </div>
      </div>
    </main>
  )
}
