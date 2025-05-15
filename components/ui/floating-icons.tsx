"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  Code,
  Database,
  FileCode,
  Laptop,
  Layers,
  Lightbulb,
  Palette,
  Rocket,
  Server,
  Smartphone,
  Terminal,
  Zap,
} from "lucide-react"

interface FloatingIconsProps {
  count?: number
  className?: string
}

type IconData = {
  icon: React.ReactNode
  x: number
  y: number
  size: number
  speed: number
  delay: number
  rotate: number
}

export function FloatingIcons({ count = 10, className = "" }: FloatingIconsProps) {
  const [icons, setIcons] = useState<IconData[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const iconComponents = [
      <Code key="code" />,
      <Database key="database" />,
      <FileCode key="file-code" />,
      <Laptop key="laptop" />,
      <Layers key="layers" />,
      <Lightbulb key="lightbulb" />,
      <Palette key="palette" />,
      <Rocket key="rocket" />,
      <Server key="server" />,
      <Smartphone key="smartphone" />,
      <Terminal key="terminal" />,
      <Zap key="zap" />,
    ]

    const newIcons = Array.from({ length: count }, (_, i) => {
      return {
        icon: iconComponents[Math.floor(Math.random() * iconComponents.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 10,
        speed: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        rotate: Math.random() * 360,
      }
    })

    setIcons(newIcons)
  }, [count])

  if (!mounted) return null

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {icons.map((icon, index) => (
        <div
          key={index}
          className="absolute opacity-10 dark:opacity-20"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            width: `${icon.size}px`,
            height: `${icon.size}px`,
            animation: `floatUpDown ${icon.speed}s ease-in-out infinite`,
            animationDelay: `${icon.delay}s`,
            transform: `rotate(${icon.rotate}deg)`,
          }}
        >
          {icon.icon}
        </div>
      ))}
    </div>
  )
}
