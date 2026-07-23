import { alertsWorker } from './alerts';

// Register error handlers to prevent silent worker crashes
const workers = [alertsWorker];

workers.forEach((worker) => {
  worker.on('error', (err) => {
    console.error(`[Worker Error] ${worker.name}:`, err);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Job Failed] ${worker.name} (Job ${job?.id}):`, err);
  });
});

console.log('[Workers] Started BullMQ workers for:', workers.map(w => w.name).join(', '));

// Handle graceful shutdown
const shutdown = async () => {
  console.log('[Workers] Shutting down gracefully...');
  await Promise.all(workers.map(w => w.close()));
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
