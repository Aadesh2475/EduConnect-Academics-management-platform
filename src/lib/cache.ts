// Simple in-memory cache for development
// In production, use Redis

interface CacheEntry<T> {
  data: T
  expires: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup expired entries every minute
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    return entry.data as T
  }

  async set<T>(key: string, data: T, ttlSeconds: number = 300): Promise<void> {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Global cache instance
const globalForCache = globalThis as unknown as {
  cache: MemoryCache | undefined
}

export const cache = globalForCache.cache ?? new MemoryCache()

if (process.env.NODE_ENV !== 'production') globalForCache.cache = cache

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  return cache.get<T>(key)
}

export async function cacheSet<T>(key: string, data: T, ttl?: number): Promise<void> {
  return cache.set(key, data, ttl)
}

export async function cacheDelete(key: string): Promise<void> {
  return cache.delete(key)
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  return cache.deletePattern(pattern)
}

// Cache keys
export const CACHE_KEYS = {
  userClasses: (userId: string) => `user:${userId}:classes`,
  classDetails: (classId: string) => `class:${classId}`,
  classStudents: (classId: string) => `class:${classId}:students`,
  classMaterials: (classId: string) => `class:${classId}:materials`,
  classAssignments: (classId: string) => `class:${classId}:assignments`,
  classExams: (classId: string) => `class:${classId}:exams`,
  studentPerformance: (studentId: string) => `student:${studentId}:performance`,
  studentAttendance: (studentId: string) => `student:${studentId}:attendance`,
  announcements: () => `announcements`,
  events: (month: number, year: number) => `events:${year}:${month}`,
}

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 900, // 15 minutes
  extraLong: 3600, // 1 hour
}
