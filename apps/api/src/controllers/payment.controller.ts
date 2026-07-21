import type { FastifyRequest, FastifyReply } from 'fastify';
import { paymentService } from '../services/payment.service';

export class PaymentController {
  /**
   * Handles the POST /billing/razorpay/webhook route.
   */
  async handleRazorpayWebhook(request: FastifyRequest, reply: FastifyReply) {
    // Enqueue the incoming webhook body payload to process asynchronously.
    await paymentService.enqueueRazorpayWebhook(request.body as Record<string, unknown>);

    // Acknowledge the webhook provider immediately.
    return reply.code(202).send({
      queued: true
    });
  }
}

export const paymentController = new PaymentController();
