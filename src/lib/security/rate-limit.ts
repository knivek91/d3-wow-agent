import { eq } from "drizzle-orm";
import { createDb } from "../../db/index";
import { rateLimits } from "../../db/schema";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
};

function getWindowStart(now: number, windowMs: number): number {
  return Math.floor(now / windowMs) * windowMs;
}

export async function checkRateLimit(
  env: Env,
  userId: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const db = createDb(env);
  const now = Date.now();
  const windowStart = getWindowStart(now, config.windowMs);
  const resetAt = windowStart + config.windowMs;

  const existing = await db.query.rateLimits.findFirst({
    where: eq(rateLimits.userId, userId),
  });

  if (!existing || existing.windowStart < windowStart) {
    await db.insert(rateLimits).values({ userId, count: 1, windowStart });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt };
  }

  await db
    .update(rateLimits)
    .set({ count: existing.count + 1 })
    .where(eq(rateLimits.userId, userId));

  return { allowed: true, remaining: config.maxRequests - existing.count - 1, resetAt };
}
