'use client'

import { useEffect } from 'react'

interface MockAPIInitializerProps {
  children: React.ReactNode
}

export function MockAPIInitializer({ children }: MockAPIInitializerProps) {
  useEffect(() => {
    const initMockAPI = async () => {
      const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
      
      if (isMockMode && typeof window !== 'undefined') {
        try {
          const { startMockAPI } = await import('@/lib/mocks/browser')
          await startMockAPI()
          
          // Add visual indicator that mock mode is active
          const indicator = document.createElement('div')
          indicator.innerHTML = '🎭 Mock API Mode'
          indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff6b35;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-family: system-ui, -apple-system, sans-serif;
          `
          document.body.appendChild(indicator)
          
          console.log('🎭 Mock API initialized - Frontend running in standalone mode')
        } catch (error) {
          console.error('Failed to initialize mock API:', error)
        }
      }
    }

    initMockAPI()
  }, [])

  return <>{children}</>
}