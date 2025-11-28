/**
 * LocalStorage wrapper utilities with error handling and serialization
 */

const PREFIX = 'nft_access_pass_';

/**
 * Gets the prefixed key
 */
function getKey(key: string): string {
  return `${PREFIX}${key}`;
}

/**
 * Checks if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets an item from localStorage with type safety
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) return defaultValue;
  
  try {
    const item = localStorage.getItem(getKey(key));
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Sets an item in localStorage
 */
export function setItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes an item from localStorage
 */
export function removeItem(key: string): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(getKey(key));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears all items with our prefix from localStorage
 */
export function clearAll(): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets all keys with our prefix
 */
export function getAllKeys(): string[] {
  if (!isStorageAvailable()) return [];
  
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      keys.push(key.slice(PREFIX.length));
    }
  }
  return keys;
}

/**
 * Gets the size of stored data in bytes
 */
export function getStorageSize(): number {
  if (!isStorageAvailable()) return 0;
  
  let size = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      const value = localStorage.getItem(key) || '';
      size += key.length + value.length;
    }
  }
  return size * 2; // UTF-16 uses 2 bytes per character
}

/**
 * Storage item with expiration
 */
interface ExpirableItem<T> {
  value: T;
  expiry: number;
}

/**
 * Sets an item with expiration time
 */
export function setItemWithExpiry<T>(key: string, value: T, ttlMs: number): boolean {
  const item: ExpirableItem<T> = {
    value,
    expiry: Date.now() + ttlMs,
  };
  return setItem(key, item);
}

/**
 * Gets an item with expiration check
 */
export function getItemWithExpiry<T>(key: string, defaultValue: T): T {
  const item = getItem<ExpirableItem<T> | null>(key, null);
  
  if (!item) return defaultValue;
  
  if (Date.now() > item.expiry) {
    removeItem(key);
    return defaultValue;
  }
  
  return item.value;
}

/**
 * Cache utility for storing and retrieving cached data
 */
export const cache = {
  /**
   * Gets a cached value or fetches it
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000
  ): Promise<T> {
    const cached = getItemWithExpiry<T | null>(key, null);
    if (cached !== null) return cached;
    
    const value = await fetcher();
    setItemWithExpiry(key, value, ttlMs);
    return value;
  },
  
  /**
   * Invalidates a cached value
   */
  invalidate(key: string): void {
    removeItem(key);
  },
  
  /**
   * Invalidates all cached values matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    getAllKeys()
      .filter(key => regex.test(key))
      .forEach(key => removeItem(key));
  },
};

/**
 * Session storage utilities
 */
export const sessionStorage = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = window.sessionStorage.getItem(getKey(key));
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },
  
  setItem<T>(key: string, value: T): boolean {
    try {
      window.sessionStorage.setItem(getKey(key), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  removeItem(key: string): boolean {
    try {
      window.sessionStorage.removeItem(getKey(key));
      return true;
    } catch {
      return false;
    }
  },
};

export default {
  isStorageAvailable,
  getItem,
  setItem,
  removeItem,
  clearAll,
  getAllKeys,
  getStorageSize,
  setItemWithExpiry,
  getItemWithExpiry,
  cache,
  sessionStorage,
};

