import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import { env } from '@prod-own/config';
import { createObservabilitySdk } from '@prod-own/observability';
import { registerHealthRoutes } from './routes/health';
import { registerIngestRoutes } from './routes/ingest';
import { registerAlertRoutes } from './routes/alerts';
import { registerPaymentRoutes } from './routes/payments';

/**
 * Builds, configures, and returns a fully initialized Fastify instance.
 * - Starts the OpenTelemetry observability SDK to track requests and DB/Redis callspans.
 * - Registers global security middlewares (CORS, Helmet).
 * - Mounts health, ingest, alert, and billing route groups.
 * - Configures Fastify onClose hook to shutdown the OTEL SDK cleanly.
 */
export async function buildApp() {
  // Initialize and spin up OpenTelemetry tracing metrics collector
  const sdk = createObservabilitySdk();
  await sdk.start();

  const app = Fastify({
    logger: true, // Enables standard structured JSON logger output to stdout/stderr
    trustProxy: true // Trusts upstream proxies (e.g. Nginx, Cloudflare) for accurate client IP tracking
  });

  // Enable Cross-Origin Resource Sharing matching our client dashboard URL
  await app.register(cors, {
    origin: env.APP_URL
  });

  // Helmet helps secure Fastify apps by setting various HTTP headers
  await app.register(helmet);

  // Mount API Endpoint Route modules
  await app.register(registerHealthRoutes);
  await app.register(registerIngestRoutes);
  await app.register(registerAlertRoutes);
  await app.register(registerPaymentRoutes);

  // Hook into Fastify server shutdown event to close the OTEL collector session
  app.addHook('onClose', async () => {
    await sdk.shutdown();
  });

  return app;
}

