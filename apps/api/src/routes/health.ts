import type { FastifyPluginAsync } from 'fastify';

/**
 * Registers basic health verification routes.
 * 
 * Flow details:
 * 1. Exposes GET `/health` endpoint.
 * 2. Returns `{ ok: true }` instantly to verify that the Fastify process is running,
 *    healthy, and accepting requests.
 * 3. Typically used by cloud host platforms, container orchestrators (e.g., Docker Swarm, Kubernetes), 
 *    or load balancers for automated liveness probes and readiness checks.
 */
export const registerHealthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => {
    // Fast path response with minimal compute/IO load to avoid DDOS via health polling
    return {
      ok: true
    };
  });
};

