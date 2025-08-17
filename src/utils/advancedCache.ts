'use client'

// Advanced caching system with multiple strategies
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  tags: string[]
}

interface CacheConfig {
  maxSize?: number
  defaultTTL?: number
  enableLRU?: boolean
  enableStats?: boolean
}

class AdvancedCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: Required<CacheConfig>
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    memory: 0
  }

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 100,
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes
      enableLRU: config.enableLRU ?? true,
      enableStats: config.enableStats ?? true
    }
  }

  set(key: string, value: T, ttl?: number, tags: string[] = []): void {
    // Evict expired entries before adding new ones
    this.evictExpired()

    // Evict LRU if at capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
      tags
    }

    this.cache.set(key, entry)
    this.updateStats()
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      if (this.config.enableStats) this.stats.misses++
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      if (this.config.enableStats) this.stats.misses++
      return null
    }

    // Update access tracking
    entry.accessCount++
    entry.lastAccessed = Date.now()
    
    if (this.config.enableStats) this.stats.hits++
    return entry.data
  }

  invalidate(key: string): boolean {
    return this.cache.delete(key)
  }

  invalidateByTag(tag: string): number {
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  clear(): void {
    this.cache.clear()
    this.resetStats()
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private evictExpired(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        if (this.config.enableStats) this.stats.evictions++
      }
    }
  }

  private evictLRU(): void {
    if (!this.config.enableLRU || this.cache.size === 0) return

    let lruKey = ''
    let lruTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
      if (this.config.enableStats) this.stats.evictions++
    }
  }

  private updateStats(): void {
    if (!this.config.enableStats) return
    
    // Estimate memory usage
    this.stats.memory = this.cache.size * 1000 // Rough estimate
  }

  private resetStats(): void {
    this.stats = { hits: 0, misses: 0, evictions: 0, memory: 0 }
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
      size: this.cache.size,
      capacity: this.config.maxSize
    }
  }
}

// Global cache instances
export const componentCache = new AdvancedCache({ 
  maxSize: 50, 
  defaultTTL: 10 * 60 * 1000 // 10 minutes
})

export const apiCache = new AdvancedCache({ 
  maxSize: 200, 
  defaultTTL: 5 * 60 * 1000 // 5 minutes
})

export const userDataCache = new AdvancedCache({ 
  maxSize: 30, 
  defaultTTL: 15 * 60 * 1000 // 15 minutes
})

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cache?: AdvancedCache<T>
    ttl?: number
    tags?: string[]
    enabled?: boolean
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const fetcherRef = useRef(fetcher)
  
  const cache = options.cache || apiCache
  const enabled = options.enabled ?? true

  fetcherRef.current = fetcher

  const fetchData = useCallback(async () => {
    if (!enabled) return

    // Try cache first
    const cached = cache.get(key)
    if (cached) {
      setData(cached)
      return cached
    }

    // Fetch fresh data
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetcherRef.current()
      cache.set(key, result, options.ttl, options.tags)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [key, cache, enabled, options.ttl, options.tags])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const invalidate = useCallback(() => {
    cache.invalidate(key)
    return fetchData()
  }, [key, cache, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate
  }
}

// Hook for cached computations
export function useCachedComputation<T>(
  key: string,
  computation: () => T,
  deps: unknown[],
  ttl?: number
) {
  return useMemo(() => {
    // Check cache first
    const cached = componentCache.get(key)
    if (cached) return cached

    // Compute and cache
    const result = computation()
    componentCache.set(key, result, ttl)
    return result
  }, [key, computation, ttl, ...deps])
}

// Advanced cache invalidation strategies
export const cacheInvalidation = {
  // Invalidate related user data
  invalidateUser: (userId: string) => {
    userDataCache.invalidateByTag(`user:${userId}`)
    apiCache.invalidateByTag(`user:${userId}`)
  },

  // Invalidate lesson-related data
  invalidateLesson: (lessonId: string) => {
    apiCache.invalidateByTag(`lesson:${lessonId}`)
    componentCache.invalidateByTag(`lesson:${lessonId}`)
  },

  // Invalidate profile data
  invalidateProfile: (userId: string) => {
    userDataCache.invalidateByTag(`profile:${userId}`)
    apiCache.invalidateByTag(`profile:${userId}`)
  },

  // Clear all caches
  clearAll: () => {
    componentCache.clear()
    apiCache.clear()
    userDataCache.clear()
  }
}

// Cache warming utilities
export const cacheWarming = {
  // Warm frequently accessed data
  warmUserData: async (userId: string) => {
    const promises = [
      // Warm profile data
      fetch(`/api/profile/${userId}`).then(r => r.json()),
      // Warm lesson progress  
      fetch(`/api/progress/${userId}`).then(r => r.json()),
      // Warm achievements
      fetch(`/api/achievements/${userId}`).then(r => r.json())
    ]

    const results = await Promise.allSettled(promises)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const keys = [`profile:${userId}`, `progress:${userId}`, `achievements:${userId}`]
        userDataCache.set(keys[index], result.value, 15 * 60 * 1000, [`user:${userId}`])
      }
    })
  },

  // Warm lesson data
  warmLessonData: async (lessonIds: string[]) => {
    const promises = lessonIds.map(id => 
      fetch(`/api/lessons/${id}`).then(r => r.json())
    )

    const results = await Promise.allSettled(promises)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const lessonId = lessonIds[index]
        apiCache.set(`lesson:${lessonId}`, result.value, 30 * 60 * 1000, [`lesson:${lessonId}`])
      }
    })
  }
}

// Import statements
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'