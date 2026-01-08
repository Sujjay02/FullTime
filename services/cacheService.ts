
interface CacheItem<T> {
  data: T;
  expiry: number;
}

// In-memory store to replace localStorage
const memoryCache = new Map<string, CacheItem<any>>();

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
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      expiry: now + (ttlSeconds * 1000),
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
