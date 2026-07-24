import { Queue, ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';

import { env } from '@litetrace/config';

/**
 * Shared IORedis client instance configuration.
 * Configured specifically for BullMQ:
 * - maxRetriesPerRequest: set to null as required by BullMQ to avoid connection dropouts on long polling commands.
 * - enableReadyCheck: false to speed up initialization.
 */
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

/**
 * Generic factory to instantiate a BullMQ Queue.
 * Binds the queue to the shared ioredis connection with a type cast to ConnectionOptions.
 *
 * @param name - The name of the queue to construct
 */
export function createQueue(name: string) {
  return new Queue(name, {
    // Cast to ConnectionOptions to bypass type mismatch between different resolved ioredis subversions
    connection: redisConnection as unknown as ConnectionOptions
  });
}

