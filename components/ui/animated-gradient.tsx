"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AnimatedGradientProps {
  className?: string
  children: React.ReactNode
  colors?: string[]
  direction?: "to-r" | "to-l" | "to-t" | "to-b" | "to-tr" | "to-tl" | "to-br" | "to-bl"
  speed?: "slow" | "medium" | "fast"
}

export function AnimatedGradient({
  className,
  children,
  colors = ["#1B998B", "#DECDF5", "#1B998B"],
  direction = "to-r",
  speed = "medium",
}: AnimatedGradientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const speedMap = {
    slow: "20s",
    medium: "10s",
    fast: "5s",
  }

  const gradientSize = colors.length * 100

  const gradientStyle = {
    backgroundSize: `${gradientSize}% 100%`,
    backgroundImage: `linear-gradient(${direction}, ${colors.join(", ")})`,
    animation: `gradientAnimation ${speedMap[speed]} linear infinite`,
  }

  if (!mounted) {
    return <span className={className}>{children}</span>
  }

  return (
    <div className={cn("bg-clip-text text-transparent relative", className)} style={gradientStyle}>
      {children}
    </div>
  )
}
