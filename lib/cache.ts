export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  multiRemove?: (keys: string[]) => Promise<void>;
}

export interface TimedCacheEntry<T> {
  data: T;
  cachedAt: number;
}

export interface TimedCacheResult<T> {
  data: T;
  cachedAt: number;
  isStale: boolean;
}

let cachedAsyncStorage: StorageAdapter | null = null;

async function getDefaultStorage(): Promise<StorageAdapter> {
  if (cachedAsyncStorage) return cachedAsyncStorage;
  const mod = await import('@react-native-async-storage/async-storage');
  const AsyncStorage = mod.default;
  cachedAsyncStorage = {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
    multiRemove: (keys) => AsyncStorage.multiRemove(keys),
  };
  return cachedAsyncStorage;
}

async function removeKeys(storage: StorageAdapter, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  if (storage.multiRemove) {
    await storage.multiRemove(keys);
    return;
  }
  await Promise.all(keys.map((key) => storage.removeItem(key)));
}

export async function readTimedCache<T>(
  key: string,
  ttlMs: number,
  storage?: StorageAdapter,
  now = Date.now()
): Promise<TimedCacheResult<T> | null> {
  const store = storage ?? (await getDefaultStorage());
  try {
    const raw = await store.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TimedCacheEntry<T>>;
    if (typeof parsed.cachedAt !== 'number' || parsed.data === undefined) {
      return null;
    }
    return {
      data: parsed.data,
      cachedAt: parsed.cachedAt,
      isStale: now - parsed.cachedAt > ttlMs,
    };
  } catch {
    return null;
  }
}

export async function writeTimedCache<T>(
  key: string,
  data: T,
  storage?: StorageAdapter,
  now = Date.now()
): Promise<void> {
  const store = storage ?? (await getDefaultStorage());
  const payload: TimedCacheEntry<T> = {
    data,
    cachedAt: now,
  };
  try {
    await store.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage quota/serialization errors so network flow never breaks
  }
}

export interface LruDiskCacheOptions {
  prefix: string;
  ttlMs: number;
  maxEntries: number;
  storage?: StorageAdapter;
}

/**
 * Bounded per-item disk cache with LRU eviction.
 * Prevents storing 1000s of full objects in a single AsyncStorage row
 * (which can exceed Android's 2MB SQLite CursorWindow limit).
 */
export class LruDiskCache<T> {
  private readonly prefix: string;
  private readonly ttlMs: number;
  private readonly maxEntries: number;
  private readonly storage?: StorageAdapter;

  constructor(options: LruDiskCacheOptions) {
    this.prefix = options.prefix;
    this.ttlMs = options.ttlMs;
    this.maxEntries = Math.max(1, options.maxEntries);
    this.storage = options.storage;
  }

  private get indexKey(): string {
    return `${this.prefix}:__lru_index__`;
  }

  private itemKey(id: string): string {
    return `${this.prefix}:${id}`;
  }

  private async getStore(): Promise<StorageAdapter> {
    return this.storage ?? (await getDefaultStorage());
  }

  private async readIndex(store: StorageAdapter): Promise<string[]> {
    try {
      const raw = await store.getItem(this.indexKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  private async writeIndex(store: StorageAdapter, ids: string[]): Promise<void> {
    try {
      await store.setItem(this.indexKey, JSON.stringify(ids));
    } catch {
      // Ignore storage errors
    }
  }

  async get(id: string, now = Date.now()): Promise<TimedCacheResult<T> | null> {
    const store = await this.getStore();
    const result = await readTimedCache<T>(this.itemKey(id), this.ttlMs, store, now);
    if (!result) return null;

    // Bump recency in LRU index (most recent at the end)
    const index = await this.readIndex(store);
    if (index[index.length - 1] !== id) {
      const next = [...index.filter((existing) => existing !== id), id];
      await this.writeIndex(store, next);
    }

    return result;
  }

  async set(id: string, data: T, now = Date.now()): Promise<void> {
    await this.setMany([{ id, data }], now);
  }

  async setMany(entries: { id: string; data: T }[], now = Date.now()): Promise<void> {
    if (entries.length === 0) return;
    const store = await this.getStore();

    // Keep only the last maxEntries if a batch itself is larger than maxEntries
    const boundedBatch = entries.slice(-this.maxEntries);

    await Promise.all(
      boundedBatch.map((entry) => writeTimedCache(this.itemKey(entry.id), entry.data, store, now))
    );

    const index = await this.readIndex(store);
    const batchIds = new Set(boundedBatch.map((e) => e.id));
    const merged = [
      ...index.filter((existing) => !batchIds.has(existing)),
      ...boundedBatch.map((e) => e.id),
    ];

    const overflow = merged.length - this.maxEntries;
    if (overflow > 0) {
      const evictedIds = merged.slice(0, overflow);
      const keptIds = merged.slice(overflow);
      await removeKeys(
        store,
        evictedIds.map((id) => this.itemKey(id))
      );
      await this.writeIndex(store, keptIds);
    } else {
      await this.writeIndex(store, merged);
    }
  }

  async clear(): Promise<void> {
    const store = await this.getStore();
    const index = await this.readIndex(store);
    await removeKeys(store, [this.indexKey, ...index.map((id) => this.itemKey(id))]);
  }
}
