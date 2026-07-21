import { createBillingQueue } from '@prod-own/queue';

export class PaymentService {
  /**
   * Enqueues a Razorpay webhook for billing processing.
   */
  async enqueueRazorpayWebhook(payload: Record<string, unknown>): Promise<void> {
    const queue = createBillingQueue();
    await queue.add('razorpay-webhook', payload);
  }
}

export const paymentService = new PaymentService();
