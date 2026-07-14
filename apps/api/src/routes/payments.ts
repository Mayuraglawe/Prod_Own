import type { FastifyPluginAsync } from 'fastify';

import { createBillingQueue } from '@prod-own/queue';

/**
 * Registers webhook receiver endpoints for payment service providers (Razorpay).
 * Incoming webhook requests are queued into the billing queue for reliable processing and ledger updates.
 */
export const registerPaymentRoutes: FastifyPluginAsync = async (app) => {
  app.post('/billing/razorpay/webhook', async (request, reply) => {
    // Instantiate the BullMQ billing queue
    const queue = createBillingQueue();
    // Enqueue the incoming webhook body payload to process asynchronously
    await queue.add('razorpay-webhook', request.body as Record<string, unknown>);

    // Acknowledge the webhook provider immediately
    return reply.code(202).send({
      queued: true
    });
  });
};

