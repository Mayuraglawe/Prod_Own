import type { FastifyPluginAsync } from 'fastify';
import { ingestController } from '../controllers/ingest.controller';
import { IngestSchema } from '../schemas/ingest.schema';

/**
 * Registers telemetry payload ingestion endpoints.
 */
export const registerIngestRoutes: FastifyPluginAsync = async (app) => {
  app.post('/ingest', { schema: IngestSchema }, ingestController.handleIngest);
};

