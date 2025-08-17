'use client'

import { LazyMotion as FramerLazyMotion, domAnimation, m } from 'framer-motion'
import { ReactNode, Suspense } from 'react'

interface LazyMotionProps {
  children: ReactNode
  features?: typeof domAnimation
  strict?: boolean
}

// Wrapper for lazy-loading Framer Motion features
export default function LazyMotion({ 
  children, 
  features = domAnimation,
  strict = false // Changed to false to prevent strict mode re-renders
}: LazyMotionProps) {
  return (
    <FramerLazyMotion features={features} strict={strict} reducedMotion="user">
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </FramerLazyMotion>
  )
}

// Export optimized motion components
export { m as motion }