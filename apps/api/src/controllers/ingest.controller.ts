import type { FastifyRequest, FastifyReply } from 'fastify';
import { ingestService, IngestPayload } from '../services/ingest.service';

export class IngestController {
  /**
   * Handles the POST /ingest route.
   * Validates the request and passes the payload to the ingestion service.
   */
  async handleIngest(request: FastifyRequest, reply: FastifyReply) {
    // Safely cast body since Fastify schema validation ensures these fields are present and strings
    const body = request.body as IngestPayload;

    // Pass the strictly validated payload to the service layer
    await ingestService.enqueueErrorEvent({
      tenantId: body.tenantId,
      sourceId: body.sourceId,
      content: body.content,
      metadata: body.metadata
    });

    // Send 202 Accepted status indicating that the task has been enqueued
    return reply.code(202).send({
      accepted: true
    });
  }
}

export const ingestController = new IngestController();
