import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import { env } from '@prod-own/config';
import { createObservabilitySdk } from '@prod-own/observability';
import { registerHealthRoutes } from './routes/health';
import { registerIngestRoutes } from './routes/ingest';
import { registerAlertRoutes } from './routes/alerts';
import { registerPaymentRoutes } from './routes/payments';

export async function buildApp() {
  const sdk = createObservabilitySdk();
  await sdk.start();

  const app = Fastify({
    logger: true,
    trustProxy: true
  });

  await app.register(cors, {
    origin: env.APP_URL
  });

  await app.register(helmet);
  await app.register(registerHealthRoutes);
  await app.register(registerIngestRoutes);
  await app.register(registerAlertRoutes);
  await app.register(registerPaymentRoutes);

  app.addHook('onClose', async () => {
    await sdk.shutdown();
  });

  return app;
}
