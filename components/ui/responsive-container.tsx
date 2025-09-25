"use client"

import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { forwardRef } from "react"

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  centerContent?: boolean
  mobileFullWidth?: boolean
}

const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ 
    children, 
    className, 
    maxWidth = "2xl", 
    padding = "md", 
    centerContent = true,
    mobileFullWidth = true,
    ...props 
  }, ref) => {
    const { isMobile, isTablet } = useMobile()

    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md", 
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      full: "max-w-full",
    }

    const paddingClasses = {
      none: "",
      sm: "px-2 sm:px-4",
      md: "px-4 sm:px-6 lg:px-8",
      lg: "px-6 sm:px-8 lg:px-12",
      xl: "px-8 sm:px-12 lg:px-16",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          centerContent && "mx-auto",
          !mobileFullWidth || !isMobile ? maxWidthClasses[maxWidth] : "max-w-full",
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveContainer.displayName = "ResponsiveContainer"

export { ResponsiveContainer }