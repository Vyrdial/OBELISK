'use client'

import { useEffect } from 'react'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'

interface PerformanceMonitorProps {
  enableDevLogging?: boolean
  enableWarnings?: boolean
}

export default function PerformanceMonitor({ 
  enableDevLogging = false, 
  enableWarnings = true 
}: PerformanceMonitorProps) {
  const { metrics } = usePerformanceOptimization()

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !enableDevLogging) return

    if (enableDevLogging) {
      console.log('Performance Metrics:', {
        fps: metrics.fps,
        memoryUsage: `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        adaptiveQuality: metrics.adaptiveQuality,
        isLowPerformance: metrics.isLowPerformance
      })
    }

    // Warn about performance issues
    if (enableWarnings) {
      if (metrics.fps < 20) {
        console.warn('🚨 Very low FPS detected:', metrics.fps)
      } else if (metrics.fps < 30) {
        console.warn('⚠️ Low FPS detected:', metrics.fps)
      }

      if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
        console.warn('🚨 High memory usage:', `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
      }
    }
  }, [metrics, enableDevLogging, enableWarnings])

  // Dev-only performance overlay
  if (process.env.NODE_ENV === 'development' && enableDevLogging) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono backdrop-blur-sm">
        <div className="space-y-1">
          <div className={`flex justify-between gap-4 ${metrics.fps < 30 ? 'text-red-400' : 'text-green-400'}`}>
            <span>FPS:</span>
            <span>{metrics.fps}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Memory:</span>
            <span>{(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Quality:</span>
            <span className={
              metrics.adaptiveQuality === 'high' ? 'text-green-400' :
              metrics.adaptiveQuality === 'medium' ? 'text-yellow-400' : 'text-red-400'
            }>
              {metrics.adaptiveQuality}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Hook for performance monitoring in components
export function usePerformanceWarnings() {
  const { metrics } = usePerformanceOptimization()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Component-specific performance warnings
    if (metrics.isLowPerformance) {
      console.group('⚠️ Performance Warning')
      console.warn('Low performance detected. Consider:')
      console.warn('- Reducing animation complexity')
      console.warn('- Implementing virtualization for large lists')
      console.warn('- Using React.memo for expensive components')
      console.warn('- Debouncing frequent updates')
      console.groupEnd()
    }
  }, [metrics.isLowPerformance])

  return metrics
}