import { Worker, ConnectionOptions } from 'bullmq';

import { env } from '@prod-own/config';
import { createObservabilitySdk } from '@prod-own/observability';
import { redisConnection } from '@prod-own/queue';
import { queueNames } from '@prod-own/queue';

export async function startWorker() {
  const sdk = createObservabilitySdk();
  await sdk.start();

  const worker = new Worker(
    queueNames.fingerprints,
    async (job) => {
      return {
        jobId: job.id,
        tenantId: job.data.tenantId,
        sourceId: job.data.sourceId,
        processed: true
      };
    },
    {
      // Cast to ConnectionOptions to bypass type mismatch between different resolved ioredis subversions
      connection: redisConnection as unknown as ConnectionOptions,
      concurrency: 4
    }
  );

  worker.on('failed', (job, error) => {
    console.error('Fingerprint job failed', {
      jobId: job?.id,
      error: error.message
    });
  });

  const shutdown = async () => {
    await worker.close();
    await sdk.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.info('Worker started', {
    redisUrl: env.REDIS_URL,
    queue: queueNames.fingerprints
  });
}
