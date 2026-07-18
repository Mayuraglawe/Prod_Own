import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

// Config and utilities imported from local monorepo packages
import { env } from '@prod-own/config';
import { createObservabilitySdk } from '@prod-own/observability';

// Route registration handlers for each functional API endpoint group
import { registerHealthRoutes } from './routes/health';
import { registerIngestRoutes } from './routes/ingest';
import { registerAlertRoutes } from './routes/alerts';
import { registerPaymentRoutes } from './routes/payments';

/**
 * Builds, configures, and returns a fully initialized Fastify instance.
 * 
 * Flow details:
 * 1. Initializes the custom OpenTelemetry (OTEL) Observability SDK, starting
 *    span collectors for distributed tracing, CPU profiling, and memory metrics.
 * 2. Instantiates Fastify with standard JSON logging enabled and reverse proxy trust.
 * 3. Configures standard CORS filters referencing the target Client Dashboard domain (env.APP_URL).
 * 4. Mounts Helmet middleware for essential HTTP security header injections.
 * 5. Registers routing sub-modules dynamically.
 * 6. Adds a clean-up hook listening for the fastify application close lifecycle event 
 *    to gracefully shut down the OTEL collector.
 * 
 * @returns Fully configured FastifyInstance ready to accept connections.
 */
export async function buildApp() {
  // Initialize and spin up OpenTelemetry tracing metrics collector for application observability
  const sdk = createObservabilitySdk();
  await sdk.start();

  // Create the Fastify server instance
  const app = Fastify({
    // Enables structured stdout/stderr JSON logging for production-ready log parsing
    logger: true, 
    // Enable proxy header trust (X-Forwarded-For, X-Forwarded-Proto) to obtain true client IPs behind reverse proxies
    trustProxy: true 
  });

  // Enable Cross-Origin Resource Sharing matching our client dashboard URL to prevent unauthorized origin access
  await app.register(cors, {
    origin: env.APP_URL
  });

  // Helmet configures security headers (e.g. Content-Security-Policy, X-Frame-Options) to mitigate common web vulnerabilities
  await app.register(helmet);

  // Mount API route modules to split path execution logic cleanly
  // Health check routes for system-level checks (e.g., Docker/K8s liveness/readiness probes)
  await app.register(registerHealthRoutes);
  
  // Ingest routes to handle raw incoming telemetry/error reporting streams
  await app.register(registerIngestRoutes);
  
  // Alert routes to handle inbound alert requests and forward them to external integration handlers
  await app.register(registerAlertRoutes);
  
  // Payment and billing webhook endpoints (e.g. Razorpay webhook payloads)
  await app.register(registerPaymentRoutes);

  // Register onClose hook to guarantee graceful shutdown of OpenTelemetry SDK trace pipelines on server termination
  app.addHook('onClose', async () => {
    await sdk.shutdown();
  });

  return app;
}

