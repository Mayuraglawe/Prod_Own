import { Redis } from '@upstash/redis';
import { env } from '@litetrace/config';
import crypto from 'crypto';

// Initialize the Upstash Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Token bucket rate limiter using a Lua script for atomic operations.
 * @param tenantId The tenant to rate limit
 * @param capacity Maximum tokens the bucket can hold
 * @param refillRate Tokens added per second
 * @returns true if allowed, false if rate limited
 */
export async function checkRateLimit(
  tenantId: string,
  capacity: number,
  refillRate: number
): Promise<boolean> {
  const key = `ratelimit:${tenantId}`;
  
  // Lua script for atomic token bucket
  // ARGV[1] = capacity
  // ARGV[2] = refillRate
  // ARGV[3] = now (timestamp in ms)
  const script = `
    local key = KEYS[1]
    local capacity = tonumber(ARGV[1])
    local refillRate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    
    local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
    local tokens = tonumber(bucket[1])
    local lastRefill = tonumber(bucket[2])
    
    if not tokens then
      tokens = capacity
      lastRefill = now
    else
      local elapsed = (now - lastRefill) / 1000
      local addTokens = math.floor(elapsed * refillRate)
      tokens = math.min(capacity, tokens + addTokens)
      if addTokens > 0 then
        lastRefill = now
      end
    end
    
    if tokens >= 1 then
      tokens = tokens - 1
      redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
      redis.call('EXPIRE', key, 3600) -- expire idle tenants after 1hr
      return 1
    else
      redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
      redis.call('EXPIRE', key, 3600)
      return 0
    end
  `;

  const now = Date.now();
  
  // Execute Lua script
  const allowed = await redis.eval(
    script,
    [key],
    [capacity, refillRate, now]
  );
  
  return allowed === 1;
}

/**
 * Fast-path edge deduplication for identical payloads hitting the API concurrently.
 * @param rawBody The incoming payload body
 * @param tenantId The tenant identifier
 * @param windowSeconds How long to suppress identical payloads
 * @returns true if duplicate (should drop), false if new
 */
export async function isDuplicate(
  rawBody: string,
  tenantId: string,
  windowSeconds: number = 5
): Promise<boolean> {
  // Compute a fast SHA-256 over the payload and tenant
  const hash = crypto.createHash('sha256')
    .update(tenantId)
    .update(rawBody)
    .digest('hex');
    
  const key = `dedup:${hash}`;
  
  // SET EX NX sets the key with expiry, only if it does not exist
  // Returns "OK" if set (meaning it's new), or null if it already exists (meaning duplicate)
  const result = await redis.set(key, '1', { ex: windowSeconds, nx: true });
  
  // If result is null, it existed, so it's a duplicate
  return result === null;
}
