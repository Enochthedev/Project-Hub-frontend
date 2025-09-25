"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  padding?: "none" | "sm" | "md" | "lg" | "xl"
}

export function ResponsiveContainer({ children, className, padding = "md" }: ResponsiveContainerProps) {
  const paddingClasses = {
    none: "",
    sm: "px-4",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12",
    xl: "px-8 sm:px-12 lg:px-16",
  }

  return <div className={cn("container mx-auto w-full", paddingClasses[padding], className)}>{children}</div>
}
