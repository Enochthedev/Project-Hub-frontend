"use client"

import { useEffect, useState } from "react"

// Enhanced breakpoints for better responsive design
const MOBILE_SMALL_BREAKPOINT = 480
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1280
const DESKTOP_LARGE_BREAKPOINT = 1536

export function useMobile() {
  const [screenSize, setScreenSize] = useState<{
    width: number
    height: number
    isMobileSmall: boolean
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    isDesktopLarge: boolean
    isTouch: boolean
    orientation: 'portrait' | 'landscape'
  }>({
    width: 0,
    height: 0,
    isMobileSmall: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isDesktopLarge: false,
    isTouch: false,
    orientation: 'portrait',
  })

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setScreenSize({
        width,
        height,
        isMobileSmall: width < MOBILE_SMALL_BREAKPOINT,
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT && width < DESKTOP_LARGE_BREAKPOINT,
        isDesktopLarge: width >= DESKTOP_LARGE_BREAKPOINT,
        isTouch,
        orientation: width > height ? 'landscape' : 'portrait',
      })
    }

    // Initial check
    checkScreenSize()

    // Add event listeners
    window.addEventListener("resize", checkScreenSize)
    window.addEventListener("orientationchange", checkScreenSize)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkScreenSize)
      window.removeEventListener("orientationchange", checkScreenSize)
    }
  }, [])

  return {
    // Legacy compatibility
    isMobile: screenSize.isMobile,
    isTablet: screenSize.isTablet,
    isDesktop: screenSize.isDesktop || screenSize.isDesktopLarge,
    
    // Enhanced breakpoints
    isMobileSmall: screenSize.isMobileSmall,
    isDesktopLarge: screenSize.isDesktopLarge,
    
    // Additional properties
    isTouch: screenSize.isTouch,
    orientation: screenSize.orientation,
    screenWidth: screenSize.width,
    screenHeight: screenSize.height,
    
    // Utility functions
    isLandscape: screenSize.orientation === 'landscape',
    isPortrait: screenSize.orientation === 'portrait',
    isMobileDevice: screenSize.isMobile || screenSize.isTouch,
  }
}
