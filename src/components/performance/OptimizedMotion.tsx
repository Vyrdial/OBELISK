'use client'

import { m, MotionProps, AnimatePresence } from 'framer-motion'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { useTabVisibility } from '@/hooks/useTabVisibility'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'

interface OptimizedMotionProps extends MotionProps {
  children: React.ReactNode
  fallbackComponent?: React.ReactNode
  enableOnLowPerformance?: boolean
  pauseWhenHidden?: boolean
}

export const OptimizedMotion = forwardRef<HTMLDivElement, OptimizedMotionProps>(
  function OptimizedMotion({ 
    children, 
    fallbackComponent, 
    enableOnLowPerformance = false,
    pauseWhenHidden = true,
    ...motionProps 
  }, ref) {
    const { isVisible, wasHidden } = useTabVisibility()
    const { metrics, getOptimizedSettings } = usePerformanceOptimization()
    const [shouldAnimate, setShouldAnimate] = useState(true)
    const elementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const settings = getOptimizedSettings()
      
      // Disable animations if performance is low and not explicitly enabled
      if (metrics.isLowPerformance && !enableOnLowPerformance) {
        setShouldAnimate(false)
        return
      }

      // Pause animations when tab is hidden
      if (pauseWhenHidden && !isVisible) {
        setShouldAnimate(false)
        return
      }

      // Gradually restore animations after tab becomes visible
      if (wasHidden && isVisible) {
        setTimeout(() => {
          setShouldAnimate(true)
        }, settings.animationDelay)
      } else {
        setShouldAnimate(true)
      }
    }, [isVisible, wasHidden, metrics.isLowPerformance, enableOnLowPerformance, pauseWhenHidden, getOptimizedSettings])

    // Mark element for animation tracking
    useEffect(() => {
      if (elementRef.current) {
        elementRef.current.setAttribute('data-animated', 'true')
        elementRef.current.setAttribute('data-animation-id', Math.random().toString(36))
      }
    }, [])

    // If animations are disabled, return fallback or static content
    if (!shouldAnimate) {
      if (fallbackComponent) {
        return <>{fallbackComponent}</>
      }
      return <div ref={ref}>{children}</div>
    }

    // Apply performance-based animation settings
    const transition = motionProps.transition as any
    const optimizedProps = {
      ...motionProps,
      transition: {
        ...transition,
        type: metrics.adaptiveQuality === 'low' ? 'tween' : transition?.type,
        duration: metrics.adaptiveQuality === 'low' 
          ? (transition?.duration || 0.3) * 0.5 
          : transition?.duration
      }
    }

    return (
      <m.div
        ref={ref || elementRef}
        {...optimizedProps}
      >
        {children}
      </m.div>
    )
  }
)

// Optimized AnimatePresence wrapper
interface OptimizedAnimatePresenceProps {
  children: React.ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
  enableOnLowPerformance?: boolean
}

export function OptimizedAnimatePresence({ 
  children, 
  mode = 'wait',
  enableOnLowPerformance = false 
}: OptimizedAnimatePresenceProps) {
  const { metrics } = usePerformanceOptimization()
  const { isVisible } = useTabVisibility()

  // Disable AnimatePresence on low performance unless explicitly enabled
  if (metrics.isLowPerformance && !enableOnLowPerformance) {
    return <>{children}</>
  }

  // Disable when tab is not visible to prevent background animations
  if (!isVisible) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode={mode}>
      {children}
    </AnimatePresence>
  )
}

// High-performance motion variants
export const optimizedVariants = {
  // Fast, simple animations for low performance
  simple: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Medium complexity for balanced performance
  balanced: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  
  // Full animations for high performance
  rich: {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 0.95 },
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94],
      scale: { duration: 0.3 }
    }
  }
}

// Hook to get appropriate variants based on performance
export function useOptimizedVariants() {
  const { metrics } = usePerformanceOptimization()
  
  switch (metrics.adaptiveQuality) {
    case 'low':
      return optimizedVariants.simple
    case 'medium':
      return optimizedVariants.balanced
    case 'high':
    default:
      return optimizedVariants.rich
  }
}