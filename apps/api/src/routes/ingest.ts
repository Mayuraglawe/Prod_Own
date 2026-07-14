import type { FastifyPluginAsync } from 'fastify';

import { createFingerprintQueue } from '@prod-own/queue';

/**
 * Registers telemetry payload ingestion endpoints.
 * Validates payload parameters strictly before forwarding jobs to BullMQ queue.
 */
export const registerIngestRoutes: FastifyPluginAsync = async (app) => {
  app.post('/ingest', async (request, reply) => {
    const body = request.body as {
      tenantId?: string;
      sourceId?: string;
      content?: string;
      metadata?: Record<string, unknown>;
    };

    // Strict validation check for critical fields before queue persistence or side effects
    if (!body?.tenantId || !body?.sourceId || !body?.content) {
      return reply.code(400).send({
        error: 'tenantId, sourceId, and content are required'
      });
    }

    // Connect to BullMQ fingerprints queue
    const queue = createFingerprintQueue();
    
    // Add job to BullMQ queue for background processing (scrubbing, fingerprint generation, deduplication)
    await queue.add('fingerprint', {
      tenantId: body.tenantId,
      sourceId: body.sourceId,
      content: body.content,
      metadata: body.metadata
    });

    // Send 202 Accepted status indicating processing has started asynchronously
    return reply.code(202).send({
      accepted: true
    });
  });
};

