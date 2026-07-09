import type { FastifyPluginAsync } from 'fastify';

import { createFingerprintQueue } from '@prod-own/queue';

export const registerIngestRoutes: FastifyPluginAsync = async (app) => {
  app.post('/ingest', async (request, reply) => {
    const body = request.body as {
      tenantId?: string;
      sourceId?: string;
      content?: string;
      metadata?: Record<string, unknown>;
    };

    if (!body?.tenantId || !body?.sourceId || !body?.content) {
      return reply.code(400).send({
        error: 'tenantId, sourceId, and content are required'
      });
    }

    const queue = createFingerprintQueue();
    await queue.add('fingerprint', {
      tenantId: body.tenantId,
      sourceId: body.sourceId,
      content: body.content,
      metadata: body.metadata
    });

    return reply.code(202).send({
      accepted: true
    });
  });
};
