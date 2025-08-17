'use client'

import { useState, useEffect, ReactNode, Suspense } from 'react'

interface HydrationBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export default function HydrationBoundary({ 
  children, 
  fallback = null,
  className = ''
}: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <div className={className}>
        {fallback}
      </div>
    )
  }

  return (
    <Suspense fallback={fallback}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  )
}

// Hook to check hydration status
export function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

// Component that only renders on client
export function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  const isHydrated = useHydrated()
  
  if (!isHydrated) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}