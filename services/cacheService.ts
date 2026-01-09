
interface CacheItem<T> {
  data: T;
  expiry: number;
  lastAccessed: number;
}

const MAX_CACHE_SIZE = 100; // Maximum number of cache entries

// In-memory store to replace localStorage
const memoryCache = new Map<string, CacheItem<any>>();

/**
 * LRU eviction: Remove the oldest accessed item when cache is full
 */
const evictLRU = () => {
  if (memoryCache.size < MAX_CACHE_SIZE) return;

  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  for (const [key, item] of memoryCache.entries()) {
    if (item.lastAccessed < oldestTime) {
      oldestTime = item.lastAccessed;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    memoryCache.delete(oldestKey);
  }
};

/**
 * Retrieves data from memory if it exists and hasn't expired.
 * @param key Unique cache key
 */
export const getCachedData = <T>(key: string): T | null => {
  try {
    const item = memoryCache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now > item.expiry) {
      memoryCache.delete(key);
      return null;
    }

    // Update last accessed time for LRU
    item.lastAccessed = now;
    memoryCache.set(key, item);

    return item.data as T;
  } catch (error) {
    console.warn("Cache read error:", error);
    return null;
  }
};

/**
 * Saves data to memory with a Time-To-Live (TTL).
 * @param key Unique cache key
 * @param data Data to store
 * @param ttlSeconds Time to live in seconds
 */
export const setCachedData = <T>(key: string, data: T, ttlSeconds: number): void => {
  try {
    evictLRU(); // Evict oldest item if cache is full

    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      expiry: now + (ttlSeconds * 1000),
      lastAccessed: now,
    };
    memoryCache.set(key, item);
  } catch (error) {
    console.warn("Cache write error:", error);
  }
};

/**
 * Clear all app-specific cache
 */
export const clearCache = (): void => {
  memoryCache.clear();
};
