"use client"

import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { forwardRef } from "react"

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    "2xl"?: number
  }
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
  autoFit?: boolean
  minItemWidth?: string
}

const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    children, 
    className, 
    cols = { xs: 1, sm: 2, md: 2, lg: 3, xl: 3, "2xl": 4 },
    gap = "md",
    autoFit = false,
    minItemWidth = "280px",
    ...props 
  }, ref) => {
    const { isMobileSmall, isMobile, isTablet, isDesktop } = useMobile()

    const gapClasses = {
      none: "gap-0",
      xs: "gap-2",
      sm: "gap-3",
      md: "gap-4 md:gap-6",
      lg: "gap-6 md:gap-8",
      xl: "gap-8 md:gap-10",
    }

    const getGridCols = () => {
      if (autoFit) {
        return `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
      }

      const colClasses = []
      if (cols.xs) colClasses.push(`grid-cols-${cols.xs}`)
      if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`)
      if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`)
      if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`)
      if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`)
      if (cols["2xl"]) colClasses.push(`2xl:grid-cols-${cols["2xl"]}`)
      
      return colClasses.join(" ")
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full",
          autoFit ? "" : getGridCols(),
          gapClasses[gap],
          className
        )}
        style={autoFit ? { gridTemplateColumns: getGridCols() } : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = "ResponsiveGrid"

export { ResponsiveGrid }