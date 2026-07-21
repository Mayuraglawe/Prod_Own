import type { FastifyPluginAsync } from 'fastify';
import { alertController } from '../controllers/alert.controller';

/**
 * Registers webhook receiver endpoints for outbound alert dispatching.
 */
export const registerAlertRoutes: FastifyPluginAsync = async (app) => {
  app.post('/alerts/slack', alertController.handleSlackWebhook);
};


