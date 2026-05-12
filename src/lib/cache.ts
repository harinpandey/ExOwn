import "server-only";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

declare global {
  var __exownCache: Map<string, CacheEntry<unknown>> | undefined;
}

const localCache = globalThis.__exownCache ?? new Map<string, CacheEntry<unknown>>();
if (process.env.NODE_ENV !== "production") {
  globalThis.__exownCache = localCache;
}

async function upstashGet<T>(key: string): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(`${url.replace(/\/$/, "")}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) return null;
  const payload = await response.json();
  if (!payload?.result) return null;

  return JSON.parse(payload.result) as T;
}

async function upstashSet(key: string, value: unknown, ttlSeconds: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([["SET", key, JSON.stringify(value), "EX", ttlSeconds]]),
    cache: "no-store",
  });
}

export async function getCached<T>(key: string, ttlSeconds: number, producer: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const local = localCache.get(key) as CacheEntry<T> | undefined;

  if (local && local.expiresAt > now) {
    return local.value;
  }

  try {
    const redisValue = await upstashGet<T>(key);
    if (redisValue !== null) {
      localCache.set(key, { value: redisValue, expiresAt: now + ttlSeconds * 1000 });
      return redisValue;
    }
  } catch (error) {
    console.error("[cache] Redis read failed", error);
  }

  const value = await producer();
  localCache.set(key, { value, expiresAt: now + ttlSeconds * 1000 });

  try {
    await upstashSet(key, value, ttlSeconds);
  } catch (error) {
    console.error("[cache] Redis write failed", error);
  }

  return value;
}

export function invalidateCachePrefix(prefix: string) {
  for (const key of localCache.keys()) {
    if (key.startsWith(prefix)) {
      localCache.delete(key);
    }
  }
}
