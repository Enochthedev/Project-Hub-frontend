"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface AnimatedMascotProps {
  src: string
  alt: string
  className?: string
  size?: "sm" | "md" | "lg"
  animation?: "float" | "bounce" | "pulse" | "shake" | "spin"
  delay?: number
}

export function AnimatedMascot({
  src,
  alt,
  className,
  size = "md",
  animation = "float",
  delay = 0,
}: AnimatedMascotProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const animationMap = {
    float: "animate-float",
    bounce: "animate-bounce",
    pulse: "animate-pulse",
    shake: "animate-shake",
    spin: "animate-spin",
  }

  if (!mounted) return null

  return (
    <div className={cn(sizeMap[size], animationMap[animation], className)} style={{ animationDelay: `${delay}s` }}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={size === "sm" ? 64 : size === "md" ? 96 : 128}
        height={size === "sm" ? 64 : size === "md" ? 96 : 128}
        className="h-full w-full object-contain"
      />
    </div>
  )
}
