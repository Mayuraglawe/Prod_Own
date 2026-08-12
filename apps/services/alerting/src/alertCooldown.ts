import { Redis } from '@upstash/redis';
import { env } from '@litetrace/config';

// Initialize the Upstash Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Checks if an alert should fire based on a Redis-backed cooldown window.
 * Uses atomic SET NX EX to prevent race conditions during error bursts.
 * 
 * @param issueId The ID of the issue triggering the alert
 * @param ruleId The ID of the alert rule being evaluated
 * @param windowSeconds The cooldown window in seconds (default 1800s / 30m)
 * @returns true if the alert should fire, false if it's currently suppressed
 */
export async function shouldFireAlert(
  issueId: string,
  ruleId: string,
  windowSeconds: number = 1800
): Promise<boolean> {
  const key = `cooldown:${ruleId}:${issueId}`;
  
  // Try to set the key with the expiry window, only if it doesn't already exist
  const result = await redis.set(key, '1', { ex: windowSeconds, nx: true });
  
  // If result is 'OK', the key was successfully set, meaning no recent alert fired
  // If result is null, the key already exists, meaning we are in the cooldown window
  return result !== null;
}
