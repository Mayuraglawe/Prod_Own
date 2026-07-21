import type { FastifyRequest, FastifyReply } from 'fastify';

export class HealthController {
  /**
   * Handles the GET /health route.
   */
  async checkHealth(request: FastifyRequest, reply: FastifyReply) {
    // Fast path response with minimal compute/IO load to avoid DDOS via health polling
    return {
      ok: true
    };
  }
}

export const healthController = new HealthController();
