import { Wifi, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { TouchButton } from "@/components/ui/touch-button"
import { ResponsiveContainer } from "@/components/ui/responsive-container"

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F1FF] to-[#DECDF5] dark:from-[#534D56] dark:to-[#656176] flex items-center justify-center">
      <ResponsiveContainer maxWidth="md" className="text-center">
        <div className="bg-white/80 dark:bg-[#534D56]/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-xl border border-[#DECDF5]/50 dark:border-[#656176]/50">
          {/* Offline Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#1B998B] to-[#1B998B]/70 rounded-full flex items-center justify-center shadow-lg">
              <Wifi className="w-12 h-12 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>

          {/* Title and Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-4">
            You're Offline
          </h1>
          
          <p className="text-lg text-[#656176] dark:text-[#DECDF5] mb-8 leading-relaxed">
            No internet connection detected. Some features may be limited, but you can still browse cached content.
          </p>

          {/* Offline Features */}
          <div className="bg-[#DECDF5]/30 dark:bg-[#656176]/30 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-4">
              Available Offline
            </h2>
            <ul className="text-left space-y-2 text-[#656176] dark:text-[#DECDF5]">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#1B998B] rounded-full"></div>
                Previously viewed projects
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#1B998B] rounded-full"></div>
                Saved bookmarks
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#1B998B] rounded-full"></div>
                Basic navigation
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#1B998B] rounded-full"></div>
                Cached content
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TouchButton
              onClick={handleRetry}
              className="bg-[#1B998B] hover:bg-[#1B998B]/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </TouchButton>
            
            <TouchButton
              variant="outline"
              asChild
              className="border-[#1B998B] text-[#1B998B] hover:bg-[#1B998B]/10 px-8 py-3 rounded-lg font-medium"
            >
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Link>
            </TouchButton>
          </div>

          {/* Connection Status */}
          <div className="mt-8 pt-6 border-t border-[#DECDF5]/50 dark:border-[#656176]/50">
            <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
              We'll automatically reconnect when your internet is back
            </p>
          </div>
        </div>
      </ResponsiveContainer>
    </main>
  )
}

export const metadata = {
  title: 'Offline - Project Hub',
  description: 'You are currently offline. Some features may be limited.',
}
