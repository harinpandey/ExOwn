import "server-only";

import { NextResponse } from "next/server";

type RateLimitConfig = {
  namespace: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type Bucket = {
  count: number;
  reset: number;
};

declare global {
  var __exownRateLimitBuckets: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__exownRateLimitBuckets ?? new Map<string, Bucket>();
if (process.env.NODE_ENV !== "production") {
  globalThis.__exownRateLimitBuckets = buckets;
}

function getClientKey(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  return forwardedFor || realIp || cfIp || "local";
}

function memoryLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.reset <= now) {
    const reset = now + windowSeconds * 1000;
    buckets.set(key, { count: 1, reset });
    return { success: true, limit, remaining: Math.max(limit - 1, 0), reset };
  }

  current.count += 1;
  const remaining = Math.max(limit - current.count, 0);
  return {
    success: current.count <= limit,
    limit,
    remaining,
    reset: current.reset,
  };
}

async function upstashLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSeconds * 2],
    ]),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const count = Number(payload?.[0]?.result ?? 0);
  const reset = (Math.floor(Date.now() / (windowSeconds * 1000)) + 1) * windowSeconds * 1000;

  return {
    success: count <= limit,
    limit,
    remaining: Math.max(limit - count, 0),
    reset,
  };
}

export async function rateLimit(req: Request, config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now();
  const windowId = Math.floor(now / (config.windowSeconds * 1000));
  const clientKey = getClientKey(req);
  const key = `exown:rate:${config.namespace}:${clientKey}:${windowId}`;

  try {
    const upstashResult = await upstashLimit(key, config.limit, config.windowSeconds);
    if (upstashResult) return upstashResult;
  } catch (error) {
    console.error("[rate-limit] Upstash check failed, using local bucket", error);
  }

  return memoryLimit(key, config.limit, config.windowSeconds);
}

export async function enforceRateLimit(req: Request, config: RateLimitConfig) {
  const result = await rateLimit(req, config);
  if (result.success) return null;

  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please slow down and try again shortly.",
    },
    {
      status: 429,
      headers: rateLimitHeaders(result),
    }
  );
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.reset / 1000).toString(),
  };
}
