"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ParticleBackgroundProps {
  className?: string
  particleColor?: string
  particleCount?: number
  particleSize?: number
  speed?: number
  connected?: boolean
}

export function ParticleBackground({
  className,
  particleColor = "#DECDF5",
  particleCount = 50,
  particleSize = 2,
  speed = 1,
  connected = true,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let particles: {
      x: number
      y: number
      dirX: number
      dirY: number
      size: number
    }[] = []

    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          dirX: (Math.random() - 0.5) * speed,
          dirY: (Math.random() - 0.5) * speed,
          size: Math.random() * particleSize + 1,
        })
      }
    }

    const drawParticles = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = particleColor
        ctx.fill()

        // Update position
        p.x += p.dirX
        p.y += p.dirY

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.dirX *= -1
        if (p.y < 0 || p.y > canvas.height) p.dirY *= -1
      })

      // Connect particles
      if (connected) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.beginPath()
              ctx.strokeStyle = `${particleColor}${Math.floor((1 - distance / 100) * 255)
                .toString(16)
                .padStart(2, "0")}`
              ctx.lineWidth = 0.5
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(drawParticles)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()
    drawParticles()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleColor, particleCount, particleSize, speed, connected])

  if (!mounted) return null

  return <canvas ref={canvasRef} className={cn("absolute inset-0 -z-10 h-full w-full opacity-30", className)} />
}
