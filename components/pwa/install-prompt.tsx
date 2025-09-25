"use client"

import { useState, useEffect } from "react"
import { Download, X, Smartphone, Monitor } from "lucide-react"
import { TouchButton } from "@/components/ui/touch-button"
import { Card, CardContent } from "@/components/ui/card"
import { usePWA } from "@/lib/pwa"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface InstallPromptProps {
  className?: string
  variant?: "banner" | "card" | "floating"
  autoShow?: boolean
  showDelay?: number
}

export function InstallPrompt({ 
  className, 
  variant = "banner", 
  autoShow = true,
  showDelay = 3000 
}: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { canInstall, isInstalled, installApp } = usePWA()
  const { isMobile } = useMobile()

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show prompt after delay if auto-show is enabled
    if (autoShow && canInstall && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, showDelay)

      return () => clearTimeout(timer)
    }
  }, [canInstall, isInstalled, isDismissed, autoShow, showDelay])

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed, can't install, or dismissed
  if (isInstalled || !canInstall || isDismissed || !isVisible) {
    return null
  }

  const BannerVariant = () => (
    <div className={cn(
      "fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-[#1B998B] to-[#1B998B]/90 text-white shadow-lg border-b border-white/20",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isMobile ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                Install Project Hub
              </h3>
              <p className="text-xs sm:text-sm text-white/90">
                {isMobile 
                  ? "Add to your home screen for quick access"
                  : "Install as an app for the best experience"
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TouchButton
              onClick={handleInstall}
              size="sm"
              className="bg-white text-[#1B998B] hover:bg-white/90 font-medium"
            >
              <Download className="w-4 h-4 mr-1" />
              Install
            </TouchButton>
            <TouchButton
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  )

  const CardVariant = () => (
    <Card className={cn(
      "border-[#1B998B]/20 bg-gradient-to-br from-[#1B998B]/5 to-[#1B998B]/10",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#1B998B]/10 rounded-xl">
            {isMobile ? (
              <Smartphone className="w-6 h-6 text-[#1B998B]" />
            ) : (
              <Monitor className="w-6 h-6 text-[#1B998B]" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-[#534D56] dark:text-[#F8F1FF] mb-2">
              Install Project Hub
            </h3>
            <p className="text-[#656176] dark:text-[#DECDF5] mb-4">
              Get the full app experience with offline access, push notifications, 
              and faster loading times.
            </p>
            
            <div className="flex gap-3">
              <TouchButton
                onClick={handleInstall}
                className="bg-[#1B998B] hover:bg-[#1B998B]/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </TouchButton>
              <TouchButton
                onClick={handleDismiss}
                variant="outline"
                className="border-[#DECDF5] dark:border-[#656176]"
              >
                Maybe Later
              </TouchButton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const FloatingVariant = () => (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 max-w-sm",
      isMobile && "left-4 right-4 max-w-none",
      className
    )}>
      <Card className="border-[#1B998B]/20 bg-white/95 dark:bg-[#534D56]/95 backdrop-blur-lg shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1B998B]/10 rounded-lg">
                {isMobile ? (
                  <Smartphone className="w-4 h-4 text-[#1B998B]" />
                ) : (
                  <Monitor className="w-4 h-4 text-[#1B998B]" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#534D56] dark:text-[#F8F1FF]">
                  Install App
                </h4>
                <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
                  Quick access & offline mode
                </p>
              </div>
            </div>
            <TouchButton
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </TouchButton>
          </div>
          
          <div className="flex gap-2">
            <TouchButton
              onClick={handleInstall}
              size="sm"
              className="flex-1 bg-[#1B998B] hover:bg-[#1B998B]/90 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Install
            </TouchButton>
            <TouchButton
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="border-[#DECDF5] dark:border-[#656176] text-xs"
            >
              Later
            </TouchButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  switch (variant) {
    case "banner":
      return <BannerVariant />
    case "card":
      return <CardVariant />
    case "floating":
      return <FloatingVariant />
    default:
      return <BannerVariant />
  }
}

// Hook to manually trigger install prompt
export function useInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const { canInstall, installApp } = usePWA()

  const showPrompt = () => {
    if (canInstall) {
      setIsVisible(true)
    }
  }

  const hidePrompt = () => {
    setIsVisible(false)
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsVisible(false)
    }
    return success
  }

  return {
    isVisible,
    canInstall,
    showPrompt,
    hidePrompt,
    installApp: handleInstall,
  }
}
