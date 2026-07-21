import { createFingerprintQueue } from '@prod-own/queue';

export type IngestPayload = {
  tenantId: string;
  sourceId: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export class IngestService {
  /**
   * Enqueues a raw error event payload to the background queue for fingerprinting and storage.
   */
  async enqueueErrorEvent(payload: IngestPayload): Promise<void> {
    const queue = createFingerprintQueue();
    
    await queue.add('fingerprint', {
      tenantId: payload.tenantId,
      sourceId: payload.sourceId,
      content: payload.content,
      metadata: payload.metadata
    });
  }
}

export const ingestService = new IngestService();
