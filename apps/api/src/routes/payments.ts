import type { FastifyPluginAsync } from 'fastify';
import { paymentController } from '../controllers/payment.controller';

/**
 * Registers webhook receiver endpoints for payment service providers (Razorpay).
 */
export const registerPaymentRoutes: FastifyPluginAsync = async (app) => {
  app.post('/billing/razorpay/webhook', paymentController.handleRazorpayWebhook);
};

