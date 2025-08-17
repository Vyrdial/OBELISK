'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'

interface LazyLoadWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  delay?: number
}

export default function LazyLoadWrapper({
  children,
  fallback = null,
  threshold = 0.1,
  rootMargin = '50px',
  delay = 0
}: LazyLoadWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true
  })

  useEffect(() => {
    if (inView) {
      if (delay > 0) {
        const timer = setTimeout(() => setIsLoaded(true), delay)
        return () => clearTimeout(timer)
      } else {
        setIsLoaded(true)
      }
    }
  }, [inView, delay])

  return (
    <div ref={ref} style={{ minHeight: '1px' }}>
      {isLoaded ? children : fallback}
    </div>
  )
}