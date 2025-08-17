'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTabVisibility } from './useTabVisibility'

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low'
  condition?: () => boolean
  delay?: number
  maxRetries?: number
}

interface PreloadEntry {
  path: string
  component: () => Promise<unknown>
  options: PreloadOptions
  status: 'pending' | 'loading' | 'loaded' | 'error'
  loadTime?: number
  retries?: number
}

// Global preload cache to avoid duplicate requests
const preloadCache = new Map<string, Promise<unknown>>()
const loadedModules = new Set<string>()
const preloadQueue: PreloadEntry[] = []

export function useIntelligentPreload() {
  const { isVisible } = useTabVisibility()
  const [isProcessing, setIsProcessing] = useState(false)
  const processingRef = useRef(false)
  const router = useRouter()

  // Process preload queue with intelligent scheduling
  const processQueue = useCallback(async () => {
    if (processingRef.current || !isVisible || preloadQueue.length === 0) return
    
    processingRef.current = true
    setIsProcessing(true)

    // Sort by priority and filter by conditions
    const validEntries = preloadQueue
      .filter(entry => entry.status === 'pending')
      .filter(entry => !entry.options.condition || entry.options.condition())
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.options.priority || 'medium'] - priorityOrder[a.options.priority || 'medium']
      })

    // Process high priority items immediately, others with delay
    for (const entry of validEntries.slice(0, 3)) { // Limit concurrent preloads
      if (!isVisible) break // Stop if tab becomes hidden
      
      try {
        entry.status = 'loading'
        const startTime = performance.now()
        
        // Add delay for non-high priority items
        if (entry.options.priority !== 'high' && entry.options.delay) {
          await new Promise(resolve => setTimeout(resolve, entry.options.delay))
        }
        
        // Skip if already loaded
        if (loadedModules.has(entry.path)) {
          entry.status = 'loaded'
          continue
        }

        // Check cache first
        let loadPromise = preloadCache.get(entry.path)
        if (!loadPromise) {
          loadPromise = entry.component()
          preloadCache.set(entry.path, loadPromise)
        }

        await loadPromise
        
        entry.status = 'loaded'
        entry.loadTime = performance.now() - startTime
        loadedModules.add(entry.path)
        
        // Prefetch the route as well
        router.prefetch(entry.path)
        
      } catch (error) {
        entry.status = 'error'
        console.warn(`Failed to preload ${entry.path}:`, error)
        
        // Retry logic
        const maxRetries = entry.options.maxRetries || 2
        if ((entry.retries || 0) < maxRetries) {
          entry.retries = (entry.retries || 0) + 1
          entry.status = 'pending'
        }
      }
    }

    // Remove completed entries
    preloadQueue.splice(0, preloadQueue.length, ...preloadQueue.filter(e => e.status === 'pending'))
    
    processingRef.current = false
    setIsProcessing(false)
  }, [isVisible, router])

  // Auto-process queue when conditions change
  useEffect(() => {
    const interval = setInterval(processQueue, 1000)
    return () => clearInterval(interval)
  }, [processQueue])

  const preload = useCallback((
    path: string, 
    component: () => Promise<unknown>, 
    options: PreloadOptions = {}
  ) => {
    // Skip if already loaded or in queue
    if (loadedModules.has(path) || preloadQueue.some(entry => entry.path === path)) {
      return
    }

    preloadQueue.push({
      path,
      component,
      options: { priority: 'medium', maxRetries: 2, ...options },
      status: 'pending'
    })

    // Process immediately for high priority
    if (options.priority === 'high') {
      setTimeout(processQueue, 0)
    }
  }, [processQueue])

  const preloadRoute = useCallback((path: string, options?: PreloadOptions) => {
    preload(path, () => router.prefetch(path), options)
  }, [preload, router])

  const getPreloadStatus = useCallback((path: string) => {
    const entry = preloadQueue.find(e => e.path === path)
    if (loadedModules.has(path)) return 'loaded'
    return entry?.status || 'not-queued'
  }, [])

  return {
    preload,
    preloadRoute,
    getPreloadStatus,
    isProcessing,
    queueLength: preloadQueue.length
  }
}

// Hook for route-based preloading
export function useRoutePreload(routes: Array<{ path: string; component: () => Promise<unknown>; priority?: 'high' | 'medium' | 'low' }>) {
  const { preload } = useIntelligentPreload()
  const { isVisible } = useTabVisibility()

  useEffect(() => {
    if (!isVisible) return

    // Preload routes with staggered timing
    routes.forEach((route, index) => {
      preload(route.path, route.component, {
        priority: route.priority || 'medium',
        delay: index * 500 // Stagger by 500ms
      })
    })
  }, [routes, preload, isVisible])
}

// Hook for intersection-based preloading
export function useIntersectionPreload(
  elementRef: React.RefObject<HTMLElement>,
  component: () => Promise<unknown>,
  options: PreloadOptions = {}
) {
  const { preload } = useIntelligentPreload()
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element || hasTriggered) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggered) {
            preload(`intersection-${Date.now()}`, component, options)
            setHasTriggered(true)
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, component, preload, options, hasTriggered])
}

// Hook for user behavior prediction
export function usePredictivePreload() {
  const { preload } = useIntelligentPreload()
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const hoverStartRef = useRef<number>(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link) {
        hoverStartRef.current = Date.now()
        
        // Preload after 100ms of hover (indicates intent)
        setTimeout(() => {
          const hoverDuration = Date.now() - hoverStartRef.current
          if (hoverDuration >= 100) {
            const href = link.getAttribute('href')
            if (href && href.startsWith('/')) {
              preload(href, () => import(/* webpackChunkName: "predicted-route" */ `@/app${href}/page`), {
                priority: 'high'
              })
            }
          }
        }, 100)
      }
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true, capture: true })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter, { capture: true })
    }
  }, [preload])
}