import redis from "../config/redis";

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);

  return value === null ? null : JSON.parse(value) as T;
}

export async function setCache(key: string, value: unknown, ttl = 300): Promise<void> {
  await redis.set(
    key,
    JSON.stringify(value),
    { EX: ttl }
  );
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function deleteCacheByPattern(pattern: string): Promise<void> {
  const keysToDelete: string[] = [];
  for await (const keys of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    keysToDelete.push(...keys);
  }

  for (let index = 0; index < keysToDelete.length; index += 1000) {
    await redis.del(keysToDelete.slice(index, index + 1000));
  }
}

export async function invalidateCatalogCache(): Promise<void> {
  await deleteCacheByPattern("catalog:*");
}

export async function invalidateVendorBusinessCache(businessId: string): Promise<void> {
  await Promise.all([
    deleteCache(`vendor:${businessId}:profile`),
    deleteCacheByPattern(`vendor:${businessId}:products:*`),
  ]);
}