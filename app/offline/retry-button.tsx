"use client"

import { RefreshCw } from "lucide-react"
import { TouchButton } from "@/components/ui/touch-button"

export function RetryButton() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <TouchButton
      onClick={handleRetry}
      className="bg-[#1B998B] hover:bg-[#1B998B]/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
    >
      <RefreshCw className="w-5 h-5 mr-2" />
      Try Again
    </TouchButton>
  )
}
