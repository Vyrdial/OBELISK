'use client'

import { useState, useEffect, ReactNode } from 'react'

interface HydrationSafeProps {
  children: ReactNode
  fallback?: ReactNode
  loading?: ReactNode
}

export default function HydrationSafe({ 
  children, 
  fallback = null, 
  loading = null 
}: HydrationSafeProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const [isHydrationComplete, setIsHydrationComplete] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    
    // Ensure hydration is complete before showing complex components
    const checkHydration = () => {
      if (document.readyState === 'complete') {
        setIsHydrationComplete(true)
      } else {
        setTimeout(checkHydration, 100)
      }
    }

    checkHydration()
  }, [])

  // Show loading state during hydration
  if (!hasMounted) {
    return <>{loading || fallback}</>
  }

  // Show fallback until hydration is complete
  if (!isHydrationComplete) {
    return <>{loading || fallback}</>
  }

  return <>{children}</>
}

// Hook for hydration-aware rendering
export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}