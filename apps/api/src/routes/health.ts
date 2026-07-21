import type { FastifyPluginAsync } from 'fastify';
import { healthController } from '../controllers/health.controller';

/**
 * Registers basic health verification routes.
 */
export const registerHealthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', healthController.checkHealth);
};

