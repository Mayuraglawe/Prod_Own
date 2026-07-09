import { Queue, ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';

import { env } from '@prod-own/config';

export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export function createQueue(name: string) {
  return new Queue(name, {
    // Cast to ConnectionOptions to bypass type mismatch between different resolved ioredis subversions
    connection: redisConnection as unknown as ConnectionOptions
  });
}
