import { Worker, ConnectionOptions } from 'bullmq';

import { env } from '@prod-own/config';
import { createObservabilitySdk } from '@prod-own/observability';
import { redisConnection } from '@prod-own/queue';
import { queueNames } from '@prod-own/queue';

// Import job handlers
import { processFingerprintJob } from './jobs/fingerprint.job';

/**
 * Initializes and starts the BullMQ background worker service.
 * - Starts the OpenTelemetry SDK to record tracing spans of processed queue jobs.
 * - Configures a Worker subscribing to the fingerprints queue.
 * - Handles failed jobs logging.
 * - Listens for system termination signals (SIGINT, SIGTERM) to perform graceful shutdowns.
 */
export async function startWorker() {
  // Start OpenTelemetry SDK tracing sessions
  const sdk = createObservabilitySdk();
  await sdk.start();

  // Instantiate the fingerprints processor worker subscribing to the 'fingerprints' queue
  const worker = new Worker(
    queueNames.fingerprints,
    processFingerprintJob,
    {
      // Cast to ConnectionOptions to bypass type mismatch between different resolved ioredis subversions
      connection: redisConnection as unknown as ConnectionOptions,
      concurrency: 4 // Process up to 4 jobs concurrently per worker process instance
    }
  );

  // Monitor and log failures occurred inside fingerprint jobs execution
  worker.on('failed', (job, error) => {
    console.error('Fingerprint job failed', {
      jobId: job?.id,
      error: error.message
    });
  });

  // Gracefully release all worker connections and shutdown tracing collector prior to process exit
  const shutdown = async () => {
    await worker.close();
    await sdk.shutdown();
    process.exit(0);
  };

  // Register signal listeners for termination events (e.g. from Docker container shutdown or Ctrl+C)
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.info('Worker started', {
    redisUrl: env.REDIS_URL,
    queue: queueNames.fingerprints
  });
}

