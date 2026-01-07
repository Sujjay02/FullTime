const CACHE_PREFIX = 'ft_cache_v1_';

interface CacheItem<T> {
  data: T;
  expiry: number;
}

const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Retrieves data from localStorage if it exists and hasn't expired.
 * @param key Unique cache key
 */
export const getCachedData = <T>(key: string): T | null => {
  if (!isStorageAvailable()) return null;

  try {
    const itemStr = localStorage.getItem(CACHE_PREFIX + key);
    if (!itemStr) return null;

    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = Date.now();

    if (now > item.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return item.data;
  } catch (error) {
    console.warn("Cache read error:", error);
    return null;
  }
};

/**
 * Saves data to localStorage with a Time-To-Live (TTL).
 * @param key Unique cache key
 * @param data Data to store
 * @param ttlSeconds Time to live in seconds
 */
export const setCachedData = <T>(key: string, data: T, ttlSeconds: number): void => {
  if (!isStorageAvailable()) return;

  try {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      expiry: now + (ttlSeconds * 1000),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.warn("Cache write error (likely storage full):", error);
    // Optional: Clear old cache items if storage is full?
    // localStorage.clear(); 
  }
};

/**
 * Clear all app-specific cache
 */
export const clearCache = (): void => {
  if (!isStorageAvailable()) return;
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};