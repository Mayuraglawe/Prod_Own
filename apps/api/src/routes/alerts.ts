import type { FastifyPluginAsync } from 'fastify';

import { createAlertQueue } from '@prod-own/queue';

/**
 * Registers webhook receiver endpoints for outbound alert dispatching.
 * Slack incoming alerts are offloaded to BullMQ alert queue immediately to keep API response times minimal.
 */
export const registerAlertRoutes: FastifyPluginAsync = async (app) => {
  app.post('/alerts/slack', async (request, reply) => {
    // Instantiate the BullMQ alert queue connection
    const queue = createAlertQueue();
    // Enqueue the alert message payload to be picked up asynchronously by the worker
    await queue.add('slack-webhook', request.body as Record<string, unknown>);

    // Respond immediately with 202 Accepted status
    return reply.code(202).send({
      queued: true
    });
  });
};

