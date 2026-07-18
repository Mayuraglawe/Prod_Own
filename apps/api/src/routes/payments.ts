import type { FastifyPluginAsync } from 'fastify';

import { createBillingQueue } from '@prod-own/queue';

/**
 * Registers webhook receiver endpoints for payment service providers (Razorpay).
 * 
 * Flow details:
 * 1. Exposes POST `/billing/razorpay/webhook` for inbound payment alerts.
 * 2. Connects to the BullMQ billing queue.
 * 3. Immediately enqueues the payload to process asynchronously. 
 *    Asynchronous processing prevents webhook retries due to local database delays, locks, or network congestion.
 * 4. Responds with HTTP 202 Accepted to tell the Razorpay gateway the payload was received safely.
 */
export const registerPaymentRoutes: FastifyPluginAsync = async (app) => {
  app.post('/billing/razorpay/webhook', async (request, reply) => {
    // Instantiate the BullMQ billing queue
    // Ensures ledger updates and transaction histories are written reliably
    const queue = createBillingQueue();

    // Enqueue the incoming webhook body payload to process asynchronously.
    // The background worker is responsible for validating Razorpay signatures, matching transaction metadata,
    // updating subscription tables, and writing changes to the transactional database.
    await queue.add('razorpay-webhook', request.body as Record<string, unknown>);

    // Acknowledge the webhook provider immediately.
    // Razorpay has strict webhook processing timeout rules; responding early prevents duplicate trigger loops.
    return reply.code(202).send({
      queued: true
    });
  });
};

