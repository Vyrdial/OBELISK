'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface HydrationContextType {
  isHydrated: boolean
  isPartiallyHydrated: boolean
  hydrationProgress: number
  markComponentHydrated: (componentId: string) => void
  isComponentHydrated: (componentId: string) => boolean
}

const HydrationContext = createContext<HydrationContextType | undefined>(undefined)

interface HydrationProviderProps {
  children: ReactNode
  totalComponents?: number
}

export function HydrationProvider({ 
  children, 
  totalComponents = 10 
}: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [hydratedComponents, setHydratedComponents] = useState<Set<string>>(new Set())
  
  const hydrationProgress = (hydratedComponents.size / totalComponents) * 100
  const isPartiallyHydrated = hydratedComponents.size > 0 && !isHydrated

  useEffect(() => {
    // Mark as fully hydrated after initial render
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const markComponentHydrated = useCallback((componentId: string) => {
    setHydratedComponents(prev => new Set(prev).add(componentId))
  }, [])

  const isComponentHydrated = useCallback((componentId: string) => {
    return hydratedComponents.has(componentId) || isHydrated
  }, [hydratedComponents, isHydrated])

  return (
    <HydrationContext.Provider
      value={{
        isHydrated,
        isPartiallyHydrated,
        hydrationProgress,
        markComponentHydrated,
        isComponentHydrated
      }}
    >
      {children}
    </HydrationContext.Provider>
  )
}

export function useHydration() {
  const context = useContext(HydrationContext)
  if (!context) {
    throw new Error('useHydration must be used within HydrationProvider')
  }
  return context
}

// Component wrapper that tracks its hydration
export function HydrationTracker({ 
  id, 
  children 
}: { 
  id: string
  children: ReactNode 
}) {
  const { markComponentHydrated } = useHydration()
  
  useEffect(() => {
    markComponentHydrated(id)
  }, [id]) // Remove markComponentHydrated from dependencies to prevent infinite loop
  
  return <>{children}</>
}