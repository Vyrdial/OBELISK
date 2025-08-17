'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTabVisibility } from './useTabVisibility'

interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  isLowPerformance: boolean
  adaptiveQuality: 'high' | 'medium' | 'low'
}

export function usePerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    isLowPerformance: false,
    adaptiveQuality: 'high'
  })
  
  const { isVisible, optimizeForBackground } = useTabVisibility()
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const fpsHistoryRef = useRef<number[]>([])

  // Monitor performance metrics
  useEffect(() => {
    if (!isVisible) return

    let animationId: number

    const measurePerformance = () => {
      const now = performance.now()
      const delta = now - lastTimeRef.current

      if (delta >= 1000) { // Update every second
        const fps = Math.round((frameCountRef.current * 1000) / delta)
        
        // Keep FPS history for trend analysis
        fpsHistoryRef.current.push(fps)
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift()
        }

        const avgFps = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
        const isLowPerformance = avgFps < 30

        // Get memory usage if available
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

        // Determine adaptive quality
        let adaptiveQuality: 'high' | 'medium' | 'low' = 'high'
        if (avgFps < 20 || memoryUsage > 100 * 1024 * 1024) { // 100MB
          adaptiveQuality = 'low'
        } else if (avgFps < 40 || memoryUsage > 50 * 1024 * 1024) { // 50MB
          adaptiveQuality = 'medium'
        }

        setMetrics({
          fps: Math.round(avgFps),
          memoryUsage,
          isLowPerformance,
          adaptiveQuality
        })

        frameCountRef.current = 0
        lastTimeRef.current = now
      }

      frameCountRef.current++
      animationId = requestAnimationFrame(measurePerformance)
    }

    animationId = requestAnimationFrame(measurePerformance)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isVisible])

  const getOptimizedSettings = useCallback(() => {
    const backgroundOpts = optimizeForBackground()
    
    return {
      ...backgroundOpts,
      particleCount: metrics.adaptiveQuality === 'low' ? 20 : 
                    metrics.adaptiveQuality === 'medium' ? 50 : 100,
      animationQuality: metrics.adaptiveQuality,
      enableBlur: metrics.adaptiveQuality !== 'low',
      enableShadows: metrics.adaptiveQuality === 'high',
      refreshRate: metrics.isLowPerformance ? 30 : 60,
      enableParticles: !metrics.isLowPerformance,
      enableComplexAnimations: metrics.adaptiveQuality === 'high' && isVisible
    }
  }, [metrics, optimizeForBackground, isVisible])

  return {
    metrics,
    getOptimizedSettings,
    isVisible
  }
}

// Hook for adaptive component rendering
export function useAdaptiveRendering<T>(
  component: T,
  fallbackComponent: T,
  options: { threshold?: number } = {}
) {
  const { metrics } = usePerformanceOptimization()
  const { threshold = 30 } = options

  return metrics.fps < threshold ? fallbackComponent : component
}

// Hook for conditional effects based on performance
export function usePerformanceEffect(
  effect: () => void | (() => void),
  deps: any[],
  options: { minFps?: number; onlyWhenVisible?: boolean } = {}
) {
  const { metrics, isVisible } = usePerformanceOptimization()
  const { minFps = 30, onlyWhenVisible = true } = options

  useEffect(() => {
    if (onlyWhenVisible && !isVisible) return
    if (metrics.fps < minFps) return

    return effect()
  }, [...deps, metrics.fps, isVisible])
}