import { alertsWorker } from './alerts-worker.js';
import { startFingerprintWorker } from './fingerprint-worker.js';
import type { Job } from 'bullmq';

// Register error / failure handlers to prevent silent crashes
const bullWorkers = [alertsWorker];

for (const worker of bullWorkers) {
  worker.on('error', (err: Error) => {
    console.error(`[Worker Error] ${worker.name}:`, err);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[Job Failed] ${worker.name} (job ${job?.id}):`, err);
  });
}

console.log(
  '[Workers] BullMQ workers started:',
  bullWorkers.map((w) => w.name).join(', ')
);

// Start the Redis Stream consumer for the ingest pipeline
const stopFingerprintWorker = startFingerprintWorker();

// Graceful shutdown on SIGTERM / SIGINT (Docker stop, Ctrl+C)
async function shutdown(signal: string) {
  console.log(`[Workers] ${signal} received — shutting down gracefully...`);
  stopFingerprintWorker();
  await Promise.all(bullWorkers.map((w) => w.close()));
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
