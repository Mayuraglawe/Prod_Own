import type { FastifyPluginAsync } from 'fastify';

import { createAlertQueue } from '@prod-own/queue';

/**
 * Registers webhook receiver endpoints for outbound alert dispatching.
 * 
 * Flow details:
 * 1. Exposes POST `/alerts/slack` endpoint.
 * 2. Connects to the BullMQ alert processing queue.
 * 3. Immediately enqueues the inbound webhook payload as a background task.
 *    Offloading alert distribution to workers avoids blocking API runtime threads and protects against third-party API API rate-limiting or outages.
 * 4. Responds with HTTP 202 Accepted to acknowledge receipt and offloading.
 */
export const registerAlertRoutes: FastifyPluginAsync = async (app) => {
  app.post('/alerts/slack', async (request, reply) => {
    // Instantiate connection to the dedicated BullMQ alert dispatching queue.
    // Handles scheduling, retry limits, and exponential backoff configuration internally.
    const queue = createAlertQueue();

    // Enqueue the alert message payload to be processed asynchronously by the background worker.
    // The task name 'slack-webhook' triggers the corresponding worker handler module.
    await queue.add('slack-webhook', request.body as Record<string, unknown>);

    // Respond immediately with a 202 Accepted status.
    // Webhook source servers expect quick response times to prevent connection timeouts.
    return reply.code(202).send({
      queued: true
    });
  });
};

