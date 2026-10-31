import { redisClient } from "../config/redis.config.js";

export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
  isReady: boolean;
}

export class CacheService {
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(private readonly store: CacheStore, private readonly ttlSeconds = 30) {}

  async getOrSet<T>(key: string, load: () => Promise<T>): Promise<T> {
    if (this.store.isReady) {
      try {
        const cached = await this.store.get(key);
        if (cached !== null) return JSON.parse(cached) as T;
      } catch {
        // Cache outages and malformed entries fall back to the source of truth.
      }
    }

    const pending = this.inFlight.get(key);
    if (pending) return pending as Promise<T>;

    const loadAndCache = (async () => {
      const value = await load();
      if (this.store.isReady) {
        try { await this.store.set(key, JSON.stringify(value), { EX: this.ttlSeconds }); }
        catch { /* A failed cache write must not fail a successful read. */ }
      }
      return value;
    })();
    this.inFlight.set(key, loadAndCache);
    try {
      return await loadAndCache;
    } finally {
      this.inFlight.delete(key);
    }
  }

  async invalidate(key: string): Promise<void> {
    if (!this.store.isReady) return;
    try { await this.store.del(key); }
    catch { /* TTL provides eventual invalidation if Redis is unavailable. */ }
  }
}

const configuredTtl = Number(process.env.CACHE_TTL_SECONDS ?? 30);
export const cacheService = new CacheService(redisClient, Number.isInteger(configuredTtl) && configuredTtl > 0 ? configuredTtl : 30);
