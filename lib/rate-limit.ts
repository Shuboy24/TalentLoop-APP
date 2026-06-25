import { NextResponse } from "next/server";

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter for MVP.
 * In production, replace with @upstash/ratelimit.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }

  record.count += 1;
  store.set(identifier, record);
  return { success: true };
}

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { success: false, error: "Too many requests" },
    { 
      status: 429, 
      headers: { "Retry-After": retryAfter.toString() } 
    }
  );
}
