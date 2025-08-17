'use client'

import { useState, useEffect, useRef, ReactNode, Suspense } from 'react'
import { useTabVisibility } from '@/hooks/useTabVisibility'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'
import SuspenseFallback from '@/components/loading/SuspenseFallback'

interface ProgressiveLoaderProps {
  children: ReactNode
  priority: 'critical' | 'high' | 'medium' | 'low'
  delay?: number
  condition?: () => boolean
  fallback?: ReactNode
  placeholder?: ReactNode
  onLoad?: () => void
  onError?: (error: Error) => void
}

export default function ProgressiveLoader({
  children,
  priority,
  delay = 0,
  condition,
  fallback,
  placeholder,
  onLoad,
  onError
}: ProgressiveLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(priority === 'critical')
  const [hasError, setHasError] = useState(false)
  const { isVisible } = useTabVisibility()
  const { metrics } = usePerformanceOptimization()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current || !isVisible) return

    // Skip if condition fails
    if (condition && !condition()) return

    // Calculate effective delay based on performance and priority
    const performanceMultiplier = metrics.isLowPerformance ? 2 : 1
    const priorityDelays = {
      critical: 0,
      high: 100 * performanceMultiplier,
      medium: 500 * performanceMultiplier,
      low: 1000 * performanceMultiplier
    }

    const effectiveDelay = Math.max(delay, priorityDelays[priority])

    timeoutRef.current = setTimeout(() => {
      setShouldLoad(true)
      loadedRef.current = true
      onLoad?.()
    }, effectiveDelay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isVisible, condition, delay, priority, metrics.isLowPerformance, onLoad])

  // Error boundary for progressive content
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true)
      onError?.(new Error(event.message))
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [onError])

  if (hasError) {
    return fallback || <div>Failed to load content</div>
  }

  if (!shouldLoad) {
    return placeholder || <SuspenseFallback size="sm" message="Loading..." />
  }

  return (
    <Suspense fallback={fallback || <SuspenseFallback />}>
      {children}
    </Suspense>
  )
}

// Progressive image loading component
interface ProgressiveImageProps {
  src: string
  alt: string
  placeholderSrc?: string
  className?: string
  priority?: 'critical' | 'high' | 'medium' | 'low'
}

export function ProgressiveImage({
  src,
  alt,
  placeholderSrc,
  className = '',
  priority = 'medium'
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { isVisible } = useTabVisibility()
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!isVisible || priority === 'low') return

    const img = new Image()
    
    img.onload = () => {
      setIsLoaded(true)
    }
    
    img.onerror = () => {
      setHasError(true)
    }
    
    // Start loading with a delay based on priority
    const delays = { critical: 0, high: 50, medium: 200, low: 500 }
    setTimeout(() => {
      img.src = src
    }, delays[priority])

  }, [src, isVisible, priority])

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={isLoaded ? src : undefined}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority === 'critical' ? 'eager' : 'lazy'}
      />
      
      {/* Loading state */}
      {!isLoaded && !placeholderSrc && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}

// Progressive list loading
interface ProgressiveListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  batchSize?: number
  loadDelay?: number
  className?: string
}

export function ProgressiveList<T>({
  items,
  renderItem,
  batchSize = 10,
  loadDelay = 100,
  className = ''
}: ProgressiveListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(Math.min(batchSize, items.length))
  const { isVisible } = useTabVisibility()
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!isVisible || visibleCount >= items.length) return

    timeoutRef.current = setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + batchSize, items.length))
    }, loadDelay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [visibleCount, items.length, batchSize, loadDelay, isVisible])

  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <ProgressiveLoader
          key={index}
          priority={index < 5 ? 'high' : 'medium'}
          delay={index * 50}
        >
          {renderItem(item, index)}
        </ProgressiveLoader>
      ))}
      
      {hasMore && (
        <div className="flex justify-center py-4">
          <SuspenseFallback size="sm" message="Loading more..." />
        </div>
      )}
    </div>
  )
}

// Progressive content sections
interface ProgressiveContentProps {
  sections: Array<{
    id: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    content: ReactNode
    condition?: () => boolean
  }>
  className?: string
}

export function ProgressiveContent({ sections, className = '' }: ProgressiveContentProps) {
  return (
    <div className={className}>
      {sections.map((section) => (
        <ProgressiveLoader
          key={section.id}
          priority={section.priority}
          condition={section.condition}
          placeholder={
            <div className="h-32 bg-gray-100 animate-pulse rounded-lg mb-4" />
          }
        >
          {section.content}
        </ProgressiveLoader>
      ))}
    </div>
  )
}

// Hook for progressive data loading
export function useProgressiveData<T>(
  dataFetchers: Array<{
    key: string
    fetcher: () => Promise<T>
    priority: 'critical' | 'high' | 'medium' | 'low'
  }>
) {
  const [data, setData] = useState<Record<string, T>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, Error>>({})
  const { isVisible } = useTabVisibility()

  useEffect(() => {
    if (!isVisible) return

    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const sortedFetchers = [...dataFetchers].sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    )

    // Load data progressively
    sortedFetchers.forEach((fetcher, index) => {
      const delay = fetcher.priority === 'critical' ? 0 : index * 200

      setTimeout(async () => {
        if (!isVisible) return

        setLoading(prev => ({ ...prev, [fetcher.key]: true }))
        
        try {
          const result = await fetcher.fetcher()
          setData(prev => ({ ...prev, [fetcher.key]: result }))
        } catch (error) {
          setErrors(prev => ({ 
            ...prev, 
            [fetcher.key]: error instanceof Error ? error : new Error('Fetch failed')
          }))
        } finally {
          setLoading(prev => ({ ...prev, [fetcher.key]: false }))
        }
      }, delay)
    })
  }, [dataFetchers, isVisible])

  return { data, loading, errors }
}