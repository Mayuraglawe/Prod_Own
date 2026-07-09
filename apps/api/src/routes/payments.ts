import type { FastifyPluginAsync } from 'fastify';

import { createBillingQueue } from '@prod-own/queue';

export const registerPaymentRoutes: FastifyPluginAsync = async (app) => {
  app.post('/billing/razorpay/webhook', async (request, reply) => {
    const queue = createBillingQueue();
    await queue.add('razorpay-webhook', request.body as Record<string, unknown>);

    return reply.code(202).send({
      queued: true
    });
  });
};
