"use client"

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    // Initialize auth state from localStorage
    initialize()
  }, [initialize])

  return <>{children}</>
}
