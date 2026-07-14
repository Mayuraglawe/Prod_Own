import type { FastifyPluginAsync } from 'fastify';

/**
 * Registers basic health verification routes.
 * Used by orchestrators (e.g. Docker, Kubernetes, Render) to perform liveness/readiness checks.
 */
export const registerHealthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({
    ok: true
  }));
};

