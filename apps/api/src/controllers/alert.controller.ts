import type { FastifyRequest, FastifyReply } from 'fastify';
import { alertService } from '../services/alert.service';

export class AlertController {
  /**
   * Handles the POST /alerts/slack route.
   */
  async handleSlackWebhook(request: FastifyRequest, reply: FastifyReply) {
    // Enqueue the alert message payload to be processed asynchronously
    await alertService.enqueueSlackWebhook(request.body as Record<string, unknown>);

    // Respond immediately with a 202 Accepted status.
    return reply.code(202).send({
      queued: true
    });
  }
}

export const alertController = new AlertController();
