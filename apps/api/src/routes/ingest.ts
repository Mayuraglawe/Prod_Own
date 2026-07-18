import type { FastifyPluginAsync } from 'fastify';

import { createFingerprintQueue } from '@prod-own/queue';

/**
 * Registers telemetry payload ingestion endpoints.
 * 
 * Flow details:
 * 1. Exposes POST `/ingest` for receiving raw error telemetry data.
 * 2. Parses the request body containing:
 *    - `tenantId`: Identifies the client/tenant workspace. Used to enforce Postgres row-level security (RLS) isolation boundaries.
 *    - `sourceId`: Identifies the client configuration or SDK source (e.g., browser-sdk, node-sdk).
 *    - `content`: The raw error stack trace, message, or payload log block.
 *    - `metadata`: Additional optional structural keys to query/filter by.
 * 3. Enforces strict input validation BEFORE doing any persistence, queueing, or side effects.
 * 4. Connects to the BullMQ redis-backed fingerprint queue instance.
 * 5. Adds the job asynchronously using name `fingerprint` for worker pickup.
 *    The worker will subsequently scrub secrets/PII, compute the unique fingerprint hash, and store records.
 * 6. Returns an immediate HTTP 202 Accepted status to ensure minimal API response latency.
 */
export const registerIngestRoutes: FastifyPluginAsync = async (app) => {
  app.post('/ingest', async (request, reply) => {
    // Cast input body structure to typed layout for strict checking
    const body = request.body as {
      tenantId?: string;
      sourceId?: string;
      content?: string;
      metadata?: Record<string, unknown>;
    };

    // Strict validation check for critical fields before queue persistence or downstream side effects.
    // Telemetry payloads must be validated first to prevent malformed tasks from clogging the queue.
    if (!body?.tenantId || !body?.sourceId || !body?.content) {
      return reply.code(400).send({
        error: 'tenantId, sourceId, and content are required'
      });
    }

    // Connect to the BullMQ fingerprints processing queue
    // This abstracts standard Redis connection parameters through a central factory
    const queue = createFingerprintQueue();
    
    // Add job to BullMQ queue for background processing (scrubbing, fingerprint generation, deduplication).
    // This allows the ingestion layer to scale horizontally under high event volume since heavy lift is async.
    await queue.add('fingerprint', {
      tenantId: body.tenantId,
      sourceId: body.sourceId,
      content: body.content,
      metadata: body.metadata
    });

    // Send 202 Accepted status indicating that the task has been enqueued successfully 
    // and is currently awaiting asynchronous processing.
    return reply.code(202).send({
      accepted: true
    });
  });
};

