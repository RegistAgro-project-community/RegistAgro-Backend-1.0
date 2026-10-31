import { CacheService, type CacheStore } from "../../src/services/cache.service.js";

jest.mock("../../src/config/redis.config.js", () => ({ redisClient: { isReady: false } }));

describe("cache-aside service", () => {
  const makeStore = (isReady = true): jest.Mocked<CacheStore> => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    del: jest.fn().mockResolvedValue(1),
    isReady,
  });

  it("serves a hit without loading the database and caches misses for the TTL", async () => {
    const store = makeStore();
    const cache = new CacheService(store, 45);
    const load = jest.fn().mockResolvedValue({ products: ["tomato"] });

    expect(await cache.getOrSet("catalog", load)).toEqual({ products: ["tomato"] });
    expect(store.set).toHaveBeenCalledWith("catalog", '{"products":["tomato"]}', { EX: 45 });
    store.get.mockResolvedValueOnce('{"products":["cached"]}');
    expect(await cache.getOrSet("catalog", load)).toEqual({ products: ["cached"] });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("falls back to the source of truth when Redis is down or contains invalid JSON", async () => {
    const store = makeStore(false);
    const cache = new CacheService(store);
    const load = jest.fn().mockResolvedValue([1, 2]);
    expect(await cache.getOrSet("key", load)).toEqual([1, 2]);
    expect(store.get).not.toHaveBeenCalled();

    store.isReady = true;
    store.get.mockResolvedValueOnce("not-json");
    expect(await cache.getOrSet("key", load)).toEqual([1, 2]);
    expect(store.set).toHaveBeenCalled();
  });

  it("coalesces concurrent cache misses within an API instance", async () => {
    const store = makeStore(false);
    const cache = new CacheService(store);
    let finishLoad!: (value: string[]) => void;
    const load = jest.fn(() => new Promise<string[]>(resolve => { finishLoad = resolve; }));
    const first = cache.getOrSet("catalog", load);
    const second = cache.getOrSet("catalog", load);
    finishLoad(["shared-result"]);
    await expect(Promise.all([first, second])).resolves.toEqual([["shared-result"], ["shared-result"]]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("does not make cache invalidation failures fail the caller", async () => {
    const store = makeStore();
    store.del.mockRejectedValue(new Error("offline"));
    await expect(new CacheService(store).invalidate("catalog")).resolves.toBeUndefined();
  });
});
