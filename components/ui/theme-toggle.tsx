"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = (toggled: boolean) => {
    const newTheme = toggled ? "dark" : "light"
    setTheme(newTheme)
  }

  // Render a placeholder with the same dimensions during SSR
  if (!mounted) {
    return (
      <div className="relative flex items-center">
        <div className="h-3.5 w-3.5 opacity-0" />
        <div className="h-6 w-11 rounded-full bg-input">
          <div className="h-5 w-5 translate-x-1 rounded-full bg-background"></div>
        </div>
        <div className="h-3.5 w-3.5 opacity-0" />
      </div>
    )
  }

  return (
    <div className="relative flex items-center">
      <Sun className="absolute left-0 h-3.5 w-3.5 -translate-x-5 text-[#534D56] dark:text-[#DECDF5]" />
      <Button
        isThemeToggle
        toggled={theme === "dark"}
        onToggle={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      />
      <Moon className="absolute right-0 h-3.5 w-3.5 translate-x-5 text-[#534D56] dark:text-[#DECDF5]" />
    </div>
  )
}
