"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePWA } from "@/lib/pwa"

interface NetworkStatusProps {
  className?: string
  showWhenOnline?: boolean
  autoHide?: boolean
  hideDelay?: number
}

export function NetworkStatus({ 
  className, 
  showWhenOnline = false, 
  autoHide = true,
  hideDelay = 3000 
}: NetworkStatusProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [justCameOnline, setJustCameOnline] = useState(false)
  const { isOnline } = usePWA()

  useEffect(() => {
    const handleNetworkChange = (event: CustomEvent) => {
      const { online, wasOnline } = event.detail
      
      if (online && !wasOnline) {
        // Just came back online
        setJustCameOnline(true)
        setIsVisible(true)
        
        if (autoHide) {
          setTimeout(() => {
            setIsVisible(false)
            setJustCameOnline(false)
          }, hideDelay)
        }
      } else if (!online) {
        // Went offline
        setJustCameOnline(false)
        setIsVisible(true)
      }
    }

    window.addEventListener('pwa-network-change', handleNetworkChange as EventListener)
    
    // Initial state
    if (!isOnline) {
      setIsVisible(true)
    }

    return () => {
      window.removeEventListener('pwa-network-change', handleNetworkChange as EventListener)
    }
  }, [isOnline, autoHide, hideDelay])

  // Don't show if online and showWhenOnline is false (unless just came online)
  if (isOnline && !showWhenOnline && !justCameOnline) {
    return null
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={cn(
      "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300",
      "bg-white/95 dark:bg-[#534D56]/95 backdrop-blur-lg rounded-full shadow-lg border",
      isOnline 
        ? "border-green-200 dark:border-green-800" 
        : "border-red-200 dark:border-red-800",
      className
    )}>
      <div className="flex items-center gap-3 px-4 py-2">
        <div className={cn(
          "p-1.5 rounded-full",
          isOnline 
            ? "bg-green-100 dark:bg-green-900/30" 
            : "bg-red-100 dark:bg-red-900/30"
        )}>
          {isOnline ? (
            justCameOnline ? (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
            )
          ) : (
            <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
        </div>
        
        <span className={cn(
          "text-sm font-medium",
          isOnline 
            ? "text-green-700 dark:text-green-300" 
            : "text-red-700 dark:text-red-300"
        )}>
          {isOnline 
            ? (justCameOnline ? "Back online!" : "Connected")
            : "No internet connection"
          }
        </span>
        
        {!isOnline && (
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-600 dark:text-red-400">
              Limited functionality
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Inline network indicator for components
export function NetworkIndicator({ className }: { className?: string }) {
  const { isOnline } = usePWA()
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        isOnline ? "bg-green-500" : "bg-red-500"
      )} />
      <span className={cn(
        "text-xs",
        isOnline 
          ? "text-green-600 dark:text-green-400" 
          : "text-red-600 dark:text-red-400"
      )}>
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  )
}