import { UserProfile } from './profileSystem'

interface ProfileCacheEntry {
  profile: UserProfile | null
  timestamp: number
  promise?: Promise<UserProfile | null>
}

class ProfileCache {
  private cache = new Map<string, ProfileCacheEntry>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes cache

  get(userId: string): ProfileCacheEntry | undefined {
    const entry = this.cache.get(userId)
    if (!entry) return undefined

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(userId)
      return undefined
    }

    return entry
  }

  set(userId: string, profile: UserProfile | null): void {
    this.cache.set(userId, {
      profile,
      timestamp: Date.now()
    })
  }

  setPromise(userId: string, promise: Promise<UserProfile | null>): void {
    const existing = this.cache.get(userId)
    if (existing) {
      existing.promise = promise
    } else {
      this.cache.set(userId, {
        profile: null,
        timestamp: Date.now(),
        promise
      })
    }
  }

  invalidate(userId: string): void {
    this.cache.delete(userId)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const profileCache = new ProfileCache()