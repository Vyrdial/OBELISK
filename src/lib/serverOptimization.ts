import { cache } from 'react'
import { NextRequest, NextResponse } from 'next/server'

// Server-side cache for expensive operations
interface ServerCacheConfig {
  ttl: number
  maxSize: number
}

class ServerCache<T = unknown> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()
  private config: ServerCacheConfig

  constructor(config: ServerCacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 }) {
    this.config = config
  }

  set(key: string, data: T, customTTL?: number): void {
    // Evict expired entries
    this.evictExpired()

    // Evict oldest if at capacity
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTTL || this.config.ttl
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  private evictExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

// Global server caches
export const dbQueryCache = new ServerCache({ ttl: 10 * 60 * 1000, maxSize: 200 })
export const apiResponseCache = new ServerCache({ ttl: 5 * 60 * 1000, maxSize: 100 })
export const profileCache = new ServerCache({ ttl: 15 * 60 * 1000, maxSize: 50 })

// Cached database query wrapper
export const cachedDbQuery = cache(async <T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  const cached = dbQueryCache.get(key)
  if (cached) return cached as T

  const result = await queryFn()
  dbQueryCache.set(key, result, ttl)
  return result
})

// Cached profile fetch
export const cachedProfileFetch = cache(async (userId: string) => {
  return cachedDbQuery(
    `profile:${userId}`,
    async () => {
      // This would be replaced with actual Supabase query
      return { id: userId, level: 1, experience: 0 }
    },
    15 * 60 * 1000 // 15 minutes
  )
})

// Response compression utilities
export function withCompression(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req)
    
    // Add compression headers for large responses
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1024) {
      response.headers.set('Content-Encoding', 'gzip')
    }

    return response
  }
}

// Request deduplication for identical requests
const pendingRequests = new Map<string, Promise<unknown>>()

export function withDeduplication<T>(
  handler: (req: NextRequest) => Promise<T>,
  keyExtractor: (req: NextRequest) => string
) {
  return async (req: NextRequest): Promise<T> => {
    const key = keyExtractor(req)
    
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key) as Promise<T>
    }

    const promise = handler(req)
    pendingRequests.set(key, promise)

    try {
      const result = await promise
      return result
    } finally {
      pendingRequests.delete(key)
    }
  }
}

// Database connection pooling optimization
export class DatabasePool {
  private static instance: DatabasePool
  private connectionCount = 0
  private maxConnections = 10
  private activeConnections = new Set<string>()

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool()
    }
    return DatabasePool.instance
  }

  async acquireConnection(operation: string): Promise<string> {
    if (this.connectionCount >= this.maxConnections) {
      // Wait for available connection
      await new Promise(resolve => setTimeout(resolve, 100))
      return this.acquireConnection(operation)
    }

    const connectionId = `conn_${Date.now()}_${Math.random()}`
    this.activeConnections.add(connectionId)
    this.connectionCount++
    
    return connectionId
  }

  releaseConnection(connectionId: string): void {
    if (this.activeConnections.has(connectionId)) {
      this.activeConnections.delete(connectionId)
      this.connectionCount--
    }
  }

  getStats() {
    return {
      active: this.connectionCount,
      max: this.maxConnections,
      available: this.maxConnections - this.connectionCount
    }
  }
}

// Optimized API route wrapper
export function optimizedApiRoute(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withCompression(
    withDeduplication(
      async (req: NextRequest) => {
        const start = Date.now()
        
        try {
          const response = await handler(req)
          
          // Add performance headers
          response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
          response.headers.set('X-Cache-Status', 'MISS')
          
          return response
        } catch (error) {
          console.error('API Route Error:', error)
          return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          )
        }
      },
      (req) => `${req.method}:${req.url}`
    )
  )
}

// Server-side performance monitoring
export class ServerPerformanceMonitor {
  private static metrics = {
    requestCount: 0,
    totalResponseTime: 0,
    errorCount: 0,
    cacheHits: 0,
    cacheMisses: 0
  }

  static recordRequest(responseTime: number, cached: boolean = false) {
    this.metrics.requestCount++
    this.metrics.totalResponseTime += responseTime
    
    if (cached) {
      this.metrics.cacheHits++
    } else {
      this.metrics.cacheMisses++
    }
  }

  static recordError() {
    this.metrics.errorCount++
  }

  static getMetrics() {
    const avgResponseTime = this.metrics.requestCount > 0 
      ? this.metrics.totalResponseTime / this.metrics.requestCount 
      : 0
    
    const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
      : 0

    return {
      ...this.metrics,
      avgResponseTime: Math.round(avgResponseTime),
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    }
  }

  static reset() {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    }
  }
}

// Batch operations for database efficiency
export class BatchProcessor<T> {
  private batch: T[] = []
  private batchSize: number
  private flushInterval: number
  private timeout: NodeJS.Timeout | null = null

  constructor(
    private processor: (items: T[]) => Promise<void>,
    options: { batchSize?: number; flushInterval?: number } = {}
  ) {
    this.batchSize = options.batchSize || 10
    this.flushInterval = options.flushInterval || 1000
  }

  add(item: T): void {
    this.batch.push(item)

    if (this.batch.length >= this.batchSize) {
      this.flush()
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), this.flushInterval)
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return

    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    const items = this.batch.splice(0)
    await this.processor(items)
  }
}

// Streaming response for large datasets
export function createStreamingResponse(
  dataGenerator: AsyncGenerator<unknown, void, unknown>
) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of dataGenerator) {
          const data = JSON.stringify(chunk) + '\n'
          controller.enqueue(encoder.encode(data))
        }
      } catch (error) {
        controller.error(error)
      } finally {
        controller.close()
      }
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
    }
  })
}