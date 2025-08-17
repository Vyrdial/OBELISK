'use client'

import { useEffect, useState, useRef } from 'react'

// Core Web Vitals monitoring
export interface WebVitalsMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  cls: number // Cumulative Layout Shift
  fid: number // First Input Delay
  ttfb: number // Time to First Byte
  inp?: number // Interaction to Next Paint (experimental)
}

export interface BenchmarkResult {
  timestamp: number
  metrics: WebVitalsMetrics
  userAgent: string
  connection: string
  pageUrl: string
  buildVersion?: string
}

// Performance benchmark collector
export class PerformanceBenchmark {
  private static instance: PerformanceBenchmark
  private results: BenchmarkResult[] = []
  private observers: PerformanceObserver[] = []
  private vitals: Partial<WebVitalsMetrics> = {}

  static getInstance(): PerformanceBenchmark {
    if (!PerformanceBenchmark.instance) {
      PerformanceBenchmark.instance = new PerformanceBenchmark()
    }
    return PerformanceBenchmark.instance
  }

  init(): void {
    if (typeof window === 'undefined') return

    this.initWebVitalsObservers()
    this.measureTTFB()
    this.measureFCP()
  }

  private initWebVitalsObservers(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
        this.vitals.lcp = lastEntry.startTime
      })
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.vitals.cls = Math.max(this.vitals.cls || 0, clsValue)
      })

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        console.warn('CLS observer not supported')
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.vitals.fid = (entry as any).processingStart - entry.startTime
        }
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }
    }
  }

  private measureTTFB(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      this.vitals.ttfb = navigation.responseStart - navigation.requestStart
    }
  }

  private measureFCP(): void {
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcpEntry) {
      this.vitals.fcp = fcpEntry.startTime
    }
  }

  recordBenchmark(): BenchmarkResult {
    const result: BenchmarkResult = {
      timestamp: Date.now(),
      metrics: {
        fcp: this.vitals.fcp || 0,
        lcp: this.vitals.lcp || 0,
        cls: this.vitals.cls || 0,
        fid: this.vitals.fid || 0,
        ttfb: this.vitals.ttfb || 0,
        inp: this.vitals.inp
      },
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      pageUrl: window.location.href,
      buildVersion: process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
    }

    this.results.push(result)
    this.persistResult(result)
    return result
  }

  private getConnectionInfo(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      return `${connection.effectiveType || 'unknown'} (${connection.downlink || 'unknown'}mbps)`
    }
    return 'unknown'
  }

  private persistResult(result: BenchmarkResult): void {
    try {
      const stored = localStorage.getItem('performance-benchmarks')
      const existing = stored ? JSON.parse(stored) : []
      existing.push(result)
      
      // Keep only last 100 results
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100)
      }
      
      localStorage.setItem('performance-benchmarks', JSON.stringify(existing))
    } catch (e) {
      console.warn('Failed to persist benchmark result')
    }
  }

  getResults(): BenchmarkResult[] {
    return [...this.results]
  }

  getStoredResults(): BenchmarkResult[] {
    try {
      const stored = localStorage.getItem('performance-benchmarks')
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      return []
    }
  }

  analyzeTrends(): {
    improvements: string[]
    regressions: string[]
    averages: Partial<WebVitalsMetrics>
    recommendations: string[]
  } {
    const results = this.getStoredResults()
    if (results.length < 2) {
      return { improvements: [], regressions: [], averages: {}, recommendations: [] }
    }

    const recent = results.slice(-10) // Last 10 results
    const older = results.slice(-20, -10) // Previous 10 results

    const recentAvg = this.calculateAverages(recent)
    const olderAvg = this.calculateAverages(older)

    const improvements: string[] = []
    const regressions: string[] = []
    const recommendations: string[] = []

    // Compare metrics
    Object.entries(recentAvg).forEach(([metric, value]) => {
      const oldValue = olderAvg[metric as keyof WebVitalsMetrics]
      if (oldValue && value !== undefined) {
        const change = ((value - oldValue) / oldValue) * 100
        
        if (Math.abs(change) > 5) { // 5% threshold
          if (change < 0) {
            improvements.push(`${metric.toUpperCase()}: ${Math.abs(change).toFixed(1)}% faster`)
          } else {
            regressions.push(`${metric.toUpperCase()}: ${change.toFixed(1)}% slower`)
          }
        }
      }
    })

    // Generate recommendations
    if (recentAvg.lcp && recentAvg.lcp > 2500) {
      recommendations.push('LCP is slow - consider optimizing images and critical resources')
    }
    if (recentAvg.fcp && recentAvg.fcp > 1800) {
      recommendations.push('FCP is slow - optimize CSS delivery and remove render-blocking resources')
    }
    if (recentAvg.cls && recentAvg.cls > 0.1) {
      recommendations.push('CLS is high - ensure proper sizing for images and avoid late-loading content')
    }
    if (recentAvg.fid && recentAvg.fid > 100) {
      recommendations.push('FID is high - reduce main thread blocking and optimize JavaScript')
    }

    return {
      improvements,
      regressions,
      averages: recentAvg,
      recommendations
    }
  }

  private calculateAverages(results: BenchmarkResult[]): Partial<WebVitalsMetrics> {
    if (results.length === 0) return {}

    const sums: Partial<WebVitalsMetrics> = {}
    const counts: Record<string, number> = {}

    results.forEach(result => {
      Object.entries(result.metrics).forEach(([key, value]) => {
        if (value !== undefined && value > 0) {
          sums[key as keyof WebVitalsMetrics] = (sums[key as keyof WebVitalsMetrics] || 0) + value
          counts[key] = (counts[key] || 0) + 1
        }
      })
    })

    const averages: Partial<WebVitalsMetrics> = {}
    Object.entries(sums).forEach(([key, sum]) => {
      if (sum !== undefined && counts[key] > 0) {
        averages[key as keyof WebVitalsMetrics] = sum / counts[key]
      }
    })

    return averages
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// React hook for performance benchmarking
export function usePerformanceBenchmark() {
  const [metrics, setMetrics] = useState<Partial<WebVitalsMetrics>>({})
  const [trends, setTrends] = useState<{
    improvements: string[]
    regressions: string[]
    averages: Partial<WebVitalsMetrics>
    recommendations: string[]
  }>({ improvements: [], regressions: [], averages: {}, recommendations: [] })
  
  const benchmark = useRef<PerformanceBenchmark>()

  useEffect(() => {
    benchmark.current = PerformanceBenchmark.getInstance()
    benchmark.current.init()

    // Record benchmark after page load
    const timer = setTimeout(() => {
      const result = benchmark.current!.recordBenchmark()
      setMetrics(result.metrics)
      setTrends(benchmark.current!.analyzeTrends())
    }, 2000) // Wait 2 seconds for metrics to stabilize

    return () => {
      clearTimeout(timer)
      benchmark.current?.cleanup()
    }
  }, [])

  const recordManualBenchmark = () => {
    if (benchmark.current) {
      const result = benchmark.current.recordBenchmark()
      setMetrics(result.metrics)
      setTrends(benchmark.current.analyzeTrends())
      return result
    }
    return null
  }

  const getGrade = (metric: keyof WebVitalsMetrics, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      ttfb: { good: 800, poor: 1800 },
      inp: { good: 200, poor: 500 }
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  return {
    metrics,
    trends,
    recordManualBenchmark,
    getGrade,
    isSupported: typeof window !== 'undefined' && 'PerformanceObserver' in window
  }
}

// Real-time performance monitoring
export function useRealTimePerformanceMonitor() {
  const [fps, setFps] = useState<number>(0)
  const [memoryUsage, setMemoryUsage] = useState<number>(0)
  const [domNodes, setDomNodes] = useState<number>(0)
  
  const frameRef = useRef<number>()
  const fpsRef = useRef<{ frames: number, lastTime: number }>({ frames: 0, lastTime: performance.now() })

  useEffect(() => {
    let animationFrame: number

    const updateMetrics = () => {
      // FPS calculation
      const now = performance.now()
      fpsRef.current.frames++
      
      if (now - fpsRef.current.lastTime >= 1000) {
        setFps(fpsRef.current.frames)
        fpsRef.current.frames = 0
        fpsRef.current.lastTime = now
      }

      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryUsage(Math.round(memory.usedJSHeapSize / 1024 / 1024))
      }

      // DOM nodes count
      setDomNodes(document.querySelectorAll('*').length)

      animationFrame = requestAnimationFrame(updateMetrics)
    }

    animationFrame = requestAnimationFrame(updateMetrics)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  return {
    fps,
    memoryUsage,
    domNodes,
    isHealthy: fps >= 50 && memoryUsage < 100 && domNodes < 5000
  }
}