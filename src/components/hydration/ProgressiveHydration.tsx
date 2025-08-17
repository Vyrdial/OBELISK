'use client'

import { useState, useEffect, useRef, ReactNode, useCallback } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface ProgressiveHydrationProps {
  children: ReactNode
  priority?: 'immediate' | 'high' | 'normal' | 'low' | 'idle'
  fallback?: ReactNode
  onHydrated?: () => void
}

export default function ProgressiveHydration({
  children,
  priority = 'normal',
  fallback = null,
  onHydrated
}: ProgressiveHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(priority === 'immediate')
  const [shouldHydrate, setShouldHydrate] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const hydrationTimeoutRef = useRef<number>()
  
  // Use intersection observer for viewport-based hydration
  const { isIntersecting } = useIntersectionObserver(elementRef, {
    threshold: 0.01,
    rootMargin: '50px',
  })

  const hydrate = useCallback(() => {
    if (!isHydrated) {
      setIsHydrated(true)
      setShouldHydrate(true)
      onHydrated?.()
    }
  }, [isHydrated, onHydrated])

  useEffect(() => {
    if (priority === 'immediate') {
      hydrate()
      return
    }

    const scheduleHydration = () => {
      switch (priority) {
        case 'high':
          // Hydrate after initial render
          hydrationTimeoutRef.current = window.setTimeout(hydrate, 0)
          break
          
        case 'normal':
          // Hydrate when visible or after short delay
          if (isIntersecting) {
            hydrate()
          } else {
            hydrationTimeoutRef.current = window.setTimeout(hydrate, 2000)
          }
          break
          
        case 'low':
          // Hydrate only when visible
          if (isIntersecting) {
            hydrationTimeoutRef.current = window.setTimeout(hydrate, 500)
          }
          break
          
        case 'idle':
          // Hydrate when browser is idle
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(hydrate, { timeout: 5000 })
          } else {
            hydrationTimeoutRef.current = window.setTimeout(hydrate, 5000)
          }
          break
      }
    }

    scheduleHydration()

    return () => {
      if (hydrationTimeoutRef.current) {
        clearTimeout(hydrationTimeoutRef.current)
      }
    }
  }, [priority, isIntersecting, hydrate])

  // Force hydration on user interaction
  useEffect(() => {
    if (isHydrated) return

    const handleInteraction = () => {
      hydrate()
    }

    const events = ['mouseenter', 'touchstart', 'focus']
    const element = elementRef.current

    if (element) {
      events.forEach(event => {
        element.addEventListener(event, handleInteraction, { 
          once: true, 
          passive: true 
        })
      })

      return () => {
        events.forEach(event => {
          element.removeEventListener(event, handleInteraction)
        })
      }
    }
  }, [isHydrated, hydrate])

  return (
    <div ref={elementRef}>
      {shouldHydrate ? children : fallback}
    </div>
  )
}