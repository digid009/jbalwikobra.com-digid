/**
 * Optimized Admin Cache Manager
 * Reduces API calls and minimizes cache egress usage
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AdminCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly STATS_TTL = 2 * 60 * 1000; // 2 minutes for stats (more frequent updates)
  private readonly LIST_TTL = 3 * 60 * 1000; // 3 minutes for lists

  // Cache keys with strategic TTL
  private readonly CACHE_CONFIG = {
    'admin:stats': this.STATS_TTL,
    'admin:orders': this.LIST_TTL,
    'admin:users': this.LIST_TTL,
    'admin:products': this.LIST_TTL,
    'admin:reviews': this.LIST_TTL,
    'admin:banners': this.LIST_TTL * 2, // Banners change less frequently
    'admin:flash-sales': this.LIST_TTL,
    'admin:feed-posts': this.LIST_TTL,
    'admin:notifications': 30 * 1000, // 30 seconds for real-time notifications
  };

  /**
   * Get cached data or fetch if not available/expired
   */
  async getOrFetch<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<T> {
    const cacheKey = key;
    const ttl = options?.ttl || this.CACHE_CONFIG[key as keyof typeof this.CACHE_CONFIG] || this.DEFAULT_TTL;

    // Force refresh if requested
    if (options?.forceRefresh) {
      this.invalidate(cacheKey);
    }

    // Check if we have valid cached data
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      console.log(`🎯 Cache HIT: ${cacheKey}`);
      return cached.data;
    }

    // Fetch fresh data
    console.log(`📡 Cache MISS: ${cacheKey} - Fetching...`);
    try {
      const data = await fetchFunction();
      
      // Store in cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl
      });

      return data;
    } catch (error) {
      // If fetch fails and we have stale data, return it
      if (cached) {
        console.log(`⚠️  Using stale cache for ${cacheKey} due to fetch error`);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Prefetch data to warm cache
   */
  async prefetch<T>(key: string, fetchFunction: () => Promise<T>): Promise<void> {
    try {
      await this.getOrFetch(key, fetchFunction);
    } catch (error) {
      console.warn(`Failed to prefetch ${key}:`, error);
    }
  }

  /**
   * Batch prefetch multiple cache entries
   */
  async prefetchBatch(entries: Array<{ key: string; fetchFn: () => Promise<any> }>): Promise<void> {
    const promises = entries.map(({ key, fetchFn }) => this.prefetch(key, fetchFn));
    await Promise.allSettled(promises);
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️  Cache invalidated: ${key}`);
  }

  /**
   * Invalidate multiple entries by pattern
   */
  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
    keys.forEach(key => this.cache.delete(key));
    console.log(`🗑️  Cache invalidated pattern "${pattern}": ${keys.length} entries`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️  All cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    entries: Array<{ key: string; age: number; size: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      size: JSON.stringify(entry.data).length
    }));

    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate: 0, // Would need hit/miss tracking for accurate rate
      entries
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Smart cache strategy: prefetch related data
   */
  async smartPrefetch(currentPage: string): Promise<void> {
    const prefetchMap: Record<string, string[]> = {
      'dashboard': ['admin:stats', 'admin:notifications'],
      'orders': ['admin:orders', 'admin:stats'],
      'users': ['admin:users'],
      'products': ['admin:products'],
      'reviews': ['admin:reviews'],
      'banners': ['admin:banners'],
      'flash-sales': ['admin:flash-sales'],
      'feed': ['admin:feed-posts']
    };

    const keysToWarm = prefetchMap[currentPage] || [];
    console.log(`🔥 Smart prefetch for ${currentPage}: ${keysToWarm.join(', ')}`);
    
    // This would be implemented by the component using this cache
    // by calling the appropriate fetch functions
  }
}

// Global instance
export const adminCache = new AdminCacheManager();

// Cleanup interval
setInterval(() => {
  adminCache.cleanup();
}, 5 * 60 * 1000); // Cleanup every 5 minutes

export default adminCache;
