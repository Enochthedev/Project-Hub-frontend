"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedBlobProps {
  className?: string
  color?: string
  size?: "sm" | "md" | "lg"
  speed?: "slow" | "medium" | "fast"
  opacity?: number
}

export function AnimatedBlob({
  className,
  color = "#DECDF5",
  size = "md",
  speed = "medium",
  opacity = 0.7,
}: AnimatedBlobProps) {
  const blobRef = useRef<SVGSVGElement>(null)
  const [mounted, setMounted] = useState(false)
  const [uniqueId] = useState(() => Math.random().toString(36).substring(2, 9))

  const sizeMap = {
    sm: "w-24 h-24",
    md: "w-48 h-48",
    lg: "w-72 h-72",
  }

  const speedMap = {
    slow: "20s",
    medium: "15s",
    fast: "10s",
  }

  useEffect(() => {
    setMounted(true)

    if (!blobRef.current) return

    const animate = () => {
      if (!blobRef.current) return

      // Generate random values for the blob path
      const points = 8
      const slice = (Math.PI * 2) / points
      const radius = 50

      const randomPoints = Array.from({ length: points }, (_, i) => {
        const angle = slice * i
        const randomRadius = radius + (Math.random() * 15 - 7.5)
        const x = 50 + randomRadius * Math.cos(angle)
        const y = 50 + randomRadius * Math.sin(angle)
        return `${x},${y}`
      })

      const path = blobRef.current.querySelector("path")
      if (path) {
        path.setAttribute("d", `M${randomPoints.join("L")}Z`)
      }

      // Schedule next animation
      setTimeout(animate, Math.random() * 1000 + 1000)
    }

    animate()
  }, [])

  if (!mounted) return null

  return (
    <svg
      ref={blobRef}
      viewBox="0 0 100 100"
      className={cn(`absolute animate-blob ${sizeMap[size]}`, className)}
      style={
        {
          "--blob-speed": speedMap[speed],
        } as React.CSSProperties
      }
    >
      <defs>
        <linearGradient id={`blob-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <stop offset="100%" stopColor={color} stopOpacity={opacity * 0.6} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#blob-gradient-${uniqueId})`}
        d="M50,90 C70,90 80,70 80,50 C80,30 70,10 50,10 C30,10 20,30 20,50 C20,70 30,90 50,90 Z"
      />
    </svg>
  )
}
