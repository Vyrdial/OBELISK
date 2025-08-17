'use client'

// Performance regression testing suite
export interface PerformanceTest {
  name: string
  test: () => Promise<PerformanceResult>
  threshold: {
    duration: number // max milliseconds
    memory?: number // max MB
    fps?: number // min FPS
  }
}

export interface PerformanceResult {
  name: string
  duration: number
  memoryUsed: number
  fps?: number
  passed: boolean
  error?: string
}

export class PerformanceTestSuite {
  private tests: PerformanceTest[] = []
  private results: PerformanceResult[] = []

  addTest(test: PerformanceTest): void {
    this.tests.push(test)
  }

  async runAll(): Promise<PerformanceResult[]> {
    this.results = []
    
    for (const test of this.tests) {
      try {
        const result = await this.runTest(test)
        this.results.push(result)
      } catch (error) {
        this.results.push({
          name: test.name,
          duration: 0,
          memoryUsed: 0,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return this.results
  }

  private async runTest(test: PerformanceTest): Promise<PerformanceResult> {
    const startMemory = this.getMemoryUsage()
    const startTime = performance.now()
    
    // Run the test
    const result = await test.test()
    
    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()
    
    const duration = endTime - startTime
    const memoryUsed = endMemory - startMemory
    
    // Check thresholds
    const passed = 
      duration <= test.threshold.duration &&
      (!test.threshold.memory || memoryUsed <= test.threshold.memory) &&
      (!test.threshold.fps || (result.fps || 0) >= test.threshold.fps)

    return {
      ...result,
      duration,
      memoryUsed,
      passed
    }
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  getSummary() {
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.passed).length
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests
    const totalMemory = this.results.reduce((sum, r) => sum + r.memoryUsed, 0)

    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      avgDuration: Math.round(avgDuration),
      totalMemory: Math.round(totalMemory * 100) / 100
    }
  }
}

// Predefined performance tests
export const createPerformanceTests = (): PerformanceTest[] => [
  {
    name: 'Component Render Performance',
    threshold: { duration: 100, memory: 5 },
    test: async () => {
      // Simulate component rendering
      const startTime = performance.now()
      
      // Create mock DOM elements
      const container = document.createElement('div')
      for (let i = 0; i < 100; i++) {
        const element = document.createElement('div')
        element.textContent = `Item ${i}`
        container.appendChild(element)
      }
      
      // Clean up
      container.remove()
      
      return {
        name: 'Component Render Performance',
        duration: performance.now() - startTime,
        memoryUsed: 0,
        passed: false
      }
    }
  },
  
  {
    name: 'State Update Performance',
    threshold: { duration: 50, memory: 2 },
    test: async () => {
      // Simulate multiple state updates
      const startTime = performance.now()
      
      const state: Record<string, number> = {}
      for (let i = 0; i < 1000; i++) {
        state[`key${i}`] = Math.random()
      }
      
      return {
        name: 'State Update Performance',
        duration: performance.now() - startTime,
        memoryUsed: 0,
        passed: false
      }
    }
  },

  {
    name: 'Animation Performance',
    threshold: { duration: 1000, fps: 30 },
    test: async () => {
      return new Promise<PerformanceResult>((resolve) => {
        const startTime = performance.now()
        let frameCount = 0
        let lastTime = startTime
        
        function frame(currentTime: number) {
          frameCount++
          
          if (currentTime - startTime > 1000) {
            const fps = frameCount / ((currentTime - startTime) / 1000)
            resolve({
              name: 'Animation Performance',
              duration: currentTime - startTime,
              memoryUsed: 0,
              fps,
              passed: false
            })
          } else {
            requestAnimationFrame(frame)
          }
        }
        
        requestAnimationFrame(frame)
      })
    }
  },

  {
    name: 'Cache Performance',
    threshold: { duration: 10, memory: 1 },
    test: async () => {
      const startTime = performance.now()
      
      // Test cache operations
      const cache = new Map()
      
      // Write operations
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, { data: Math.random(), timestamp: Date.now() })
      }
      
      // Read operations
      for (let i = 0; i < 1000; i++) {
        cache.get(`key${i}`)
      }
      
      cache.clear()
      
      return {
        name: 'Cache Performance',
        duration: performance.now() - startTime,
        memoryUsed: 0,
        passed: false
      }
    }
  },

  {
    name: 'Bundle Loading Performance',
    threshold: { duration: 2000, memory: 10 },
    test: async () => {
      const startTime = performance.now()
      
      try {
        // Test dynamic import performance
        await import('@/hooks/useAdvancedMemo')
        await import('@/hooks/useIntelligentPreload')
        await import('@/utils/advancedCache')
        
        return {
          name: 'Bundle Loading Performance',
          duration: performance.now() - startTime,
          memoryUsed: 0,
          passed: false
        }
      } catch (error) {
        throw new Error(`Bundle loading failed: ${error}`)
      }
    }
  }
]

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const runTests = async (): Promise<PerformanceResult[]> => {
    const suite = new PerformanceTestSuite()
    const tests = createPerformanceTests()
    
    tests.forEach(test => suite.addTest(test))
    
    const results = await suite.runAll()
    const summary = suite.getSummary()
    
    console.log('Performance Test Results:', {
      results,
      summary
    })
    
    return results
  }

  const monitorPageLoad = () => {
    if (typeof window === 'undefined') return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.navigationStart
    }

    console.log('Page Load Metrics:', metrics)
    return metrics
  }

  const measureFPS = (duration: number = 5000): Promise<number> => {
    return new Promise((resolve) => {
      let frameCount = 0
      const startTime = performance.now()
      
      function frame(currentTime: number) {
        frameCount++
        
        if (currentTime - startTime >= duration) {
          const fps = frameCount / (duration / 1000)
          resolve(fps)
        } else {
          requestAnimationFrame(frame)
        }
      }
      
      requestAnimationFrame(frame)
    })
  }

  return {
    runTests,
    monitorPageLoad,
    measureFPS
  }
}

// Regression testing utilities
export class RegressionTester {
  private baseline: Record<string, number> = {}
  
  setBaseline(metrics: Record<string, number>): void {
    this.baseline = { ...metrics }
  }
  
  compareToBaseline(current: Record<string, number>, tolerance: number = 0.1): {
    passed: boolean
    regressions: string[]
    improvements: string[]
  } {
    const regressions: string[] = []
    const improvements: string[] = []
    
    for (const [metric, value] of Object.entries(current)) {
      const baselineValue = this.baseline[metric]
      if (baselineValue) {
        const change = (value - baselineValue) / baselineValue
        
        if (change > tolerance) {
          regressions.push(`${metric}: ${Math.round(change * 100)}% slower`)
        } else if (change < -tolerance) {
          improvements.push(`${metric}: ${Math.round(-change * 100)}% faster`)
        }
      }
    }
    
    return {
      passed: regressions.length === 0,
      regressions,
      improvements
    }
  }
}

// Browser compatibility testing
export const checkBrowserCapabilities = () => {
  if (typeof window === 'undefined') return {}

  return {
    webp: () => {
      const canvas = document.createElement('canvas')
      return canvas.toDataURL('image/webp').indexOf('webp') > -1
    },
    
    intersectionObserver: () => 'IntersectionObserver' in window,
    
    performanceObserver: () => 'PerformanceObserver' in window,
    
    webWorkers: () => 'Worker' in window,
    
    serviceWorker: () => 'serviceWorker' in navigator,
    
    es6Modules: () => 'noModule' in HTMLScriptElement.prototype,
    
    requestIdleCallback: () => 'requestIdleCallback' in window,
    
    memory: () => 'memory' in performance
  }
}