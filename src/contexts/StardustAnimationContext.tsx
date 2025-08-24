'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useProfile } from '@/hooks/useProfile'

interface StardustAnimationContextType {
  displayStardust: number
  setDisplayStardust: (value: number) => void
  animateToValue: (targetValue: number, duration?: number) => void
}

const StardustAnimationContext = createContext<StardustAnimationContextType | undefined>(undefined)

export function StardustAnimationProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile()
  const [displayStardust, setDisplayStardust] = useState(0)
  
  // Sync with profile on load and profile changes
  useEffect(() => {
    if (profile?.stardust !== undefined) {
      setDisplayStardust(profile.stardust)
    }
  }, [profile?.stardust])
  
  const animateToValue = (targetValue: number, duration = 2000) => {
    const startValue = displayStardust
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease in-out
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      const currentValue = Math.floor(startValue + (targetValue - startValue) * eased)
      setDisplayStardust(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayStardust(targetValue)
      }
    }
    
    animate()
  }
  
  return (
    <StardustAnimationContext.Provider value={{ displayStardust, setDisplayStardust, animateToValue }}>
      {children}
    </StardustAnimationContext.Provider>
  )
}

export function useStardustAnimation() {
  const context = useContext(StardustAnimationContext)
  if (!context) {
    throw new Error('useStardustAnimation must be used within StardustAnimationProvider')
  }
  return context
}