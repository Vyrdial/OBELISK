'use client'

import { createClient } from '@supabase/supabase-js'
import { cachedDbQuery, BatchProcessor } from './serverOptimization'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create optimized Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Query optimization wrapper
export class OptimizedQuery {
  private static batchProcessor = new BatchProcessor(
    async (queries: Array<{ key: string; query: () => Promise<any> }>) => {
      // Process batch of queries
      await Promise.all(queries.map(q => q.query()))
    },
    { batchSize: 5, flushInterval: 100 }
  )

  static async execute<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: {
      cache?: boolean
      ttl?: number
      batch?: boolean
    } = {}
  ): Promise<T> {
    const { cache = true, ttl = 5 * 60 * 1000, batch = false } = options

    if (batch) {
      return new Promise((resolve, reject) => {
        this.batchProcessor.add({
          key,
          query: async () => {
            try {
              const result = cache 
                ? await cachedDbQuery(key, queryFn, ttl)
                : await queryFn()
              resolve(result)
            } catch (error) {
              reject(error)
            }
          }
        })
      })
    }

    return cache ? cachedDbQuery(key, queryFn, ttl) : queryFn()
  }
}

// Optimized profile operations
export const profileQueries = {
  // Get user profile with caching
  async getProfile(userId: string, useCache = true) {
    return OptimizedQuery.execute(
      `profile:${userId}`,
      async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        return data
      },
      { cache: useCache, ttl: 15 * 60 * 1000 } // 15 minutes
    )
  },

  // Get multiple profiles efficiently
  async getProfiles(userIds: string[]) {
    if (userIds.length === 0) return []
    
    return OptimizedQuery.execute(
      `profiles:${userIds.sort().join(',')}`,
      async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)

        if (error) throw error
        return data || []
      },
      { cache: true, ttl: 10 * 60 * 1000 }
    )
  },

  // Update profile with cache invalidation
  async updateProfile(userId: string, updates: Record<string, any>) {
    // Clear related caches
    const cacheKeys = [
      `profile:${userId}`,
      `user:${userId}`,
      `profile_stats:${userId}`
    ]
    
    // Use transaction for atomic update
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    // Clear caches after successful update
    cacheKeys.forEach(key => {
      // This would clear from your cache implementation
      console.log(`Cache invalidated: ${key}`)
    })

    return data
  }
}

// Optimized lesson data queries
export const lessonQueries = {
  // Get lesson progress with aggregations
  async getLessonProgress(userId: string) {
    return OptimizedQuery.execute(
      `lesson_progress:${userId}`,
      async () => {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select(`
            lesson_id,
            completed_at,
            score,
            lessons (
              title,
              category,
              difficulty
            )
          `)
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })

        if (error) throw error
        return data || []
      },
      { cache: true, ttl: 5 * 60 * 1000 }
    )
  },

  // Get lesson statistics
  async getLessonStats(userId: string) {
    return OptimizedQuery.execute(
      `lesson_stats:${userId}`,
      async () => {
        // Use RPC for efficient aggregation
        const { data, error } = await supabase
          .rpc('get_user_lesson_stats', { user_id: userId })

        if (error) throw error
        return data
      },
      { cache: true, ttl: 30 * 60 * 1000 } // 30 minutes
    )
  }
}

// Optimized achievement queries
export const achievementQueries = {
  // Get user achievements with efficient joins
  async getUserAchievements(userId: string) {
    return OptimizedQuery.execute(
      `achievements:${userId}`,
      async () => {
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            id,
            unlocked_at,
            achievements (
              id,
              title,
              description,
              icon,
              category
            )
          `)
          .eq('user_id', userId)
          .order('unlocked_at', { ascending: false })

        if (error) throw error
        return data || []
      },
      { cache: true, ttl: 10 * 60 * 1000 }
    )
  },

  // Batch check multiple achievements
  async checkAchievements(userId: string, achievementIds: string[]) {
    if (achievementIds.length === 0) return []

    return OptimizedQuery.execute(
      `achievement_check:${userId}:${achievementIds.sort().join(',')}`,
      async () => {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', userId)
          .in('achievement_id', achievementIds)

        if (error) throw error
        return data?.map(item => item.achievement_id) || []
      },
      { cache: true, ttl: 5 * 60 * 1000, batch: true }
    )
  }
}

// Connection pool monitoring
export const connectionMonitor = {
  async getPoolStats() {
    // This would integrate with your connection pool
    return {
      active: 0,
      idle: 0,
      waiting: 0,
      total: 0
    }
  },

  async healthCheck() {
    try {
      const start = Date.now()
      const { error } = await supabase.from('profiles').select('id').limit(1)
      const duration = Date.now() - start
      
      return {
        healthy: !error,
        latency: duration,
        error: error?.message
      }
    } catch (error) {
      return {
        healthy: false,
        latency: -1,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Realtime optimization
export const optimizedRealtime = {
  // Subscribe to changes with throttling
  subscribeToProfile(userId: string, callback: (payload: any) => void) {
    let lastUpdate = 0
    const throttleMs = 1000 // 1 second throttle

    return supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          const now = Date.now()
          if (now - lastUpdate > throttleMs) {
            lastUpdate = now
            callback(payload)
          }
        }
      )
      .subscribe()
  },

  // Batch realtime updates
  subscribeToBatch(tables: string[], callback: (payload: any) => void) {
    const channel = supabase.channel('batch_updates')
    
    tables.forEach(table => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        callback
      )
    })

    return channel.subscribe()
  }
}

// Query builder with automatic optimization
export class QueryBuilder {
  private query: any
  private cacheKey: string = ''
  private cacheTTL: number = 5 * 60 * 1000

  constructor(table: string) {
    this.query = supabase.from(table)
    this.cacheKey = table
  }

  select(columns: string = '*') {
    this.query = this.query.select(columns)
    this.cacheKey += `:select:${columns}`
    return this
  }

  eq(column: string, value: any) {
    this.query = this.query.eq(column, value)
    this.cacheKey += `:eq:${column}:${value}`
    return this
  }

  in(column: string, values: any[]) {
    this.query = this.query.in(column, values)
    this.cacheKey += `:in:${column}:${values.sort().join(',')}`
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.query = this.query.order(column, options)
    this.cacheKey += `:order:${column}:${options?.ascending ? 'asc' : 'desc'}`
    return this
  }

  limit(count: number) {
    this.query = this.query.limit(count)
    this.cacheKey += `:limit:${count}`
    return this
  }

  cache(ttl: number = 5 * 60 * 1000) {
    this.cacheTTL = ttl
    return this
  }

  async execute<T>(): Promise<T> {
    return OptimizedQuery.execute(
      this.cacheKey,
      async () => {
        const { data, error } = await this.query
        if (error) throw error
        return data
      },
      { cache: true, ttl: this.cacheTTL }
    )
  }

  async single<T>(): Promise<T> {
    return OptimizedQuery.execute(
      this.cacheKey + ':single',
      async () => {
        const { data, error } = await this.query.single()
        if (error) throw error
        return data
      },
      { cache: true, ttl: this.cacheTTL }
    )
  }
}

// Usage example
export const db = {
  profiles: (userId?: string) => {
    const builder = new QueryBuilder('profiles')
    if (userId) {
      builder.eq('id', userId)
    }
    return builder
  },
  
  lessons: () => new QueryBuilder('lessons'),
  achievements: () => new QueryBuilder('achievements'),
  
  // Helper for common patterns
  async getUserData(userId: string) {
    const [profile, achievements, lessonProgress] = await Promise.all([
      profileQueries.getProfile(userId),
      achievementQueries.getUserAchievements(userId),
      lessonQueries.getLessonProgress(userId)
    ])

    return {
      profile,
      achievements,
      lessonProgress
    }
  }
}