import type { Job } from 'bullmq';
import { eventService, RawEventPayload } from '../services/event.service';

export async function processFingerprintJob(job: Job<RawEventPayload>) {
  // Extract data from job payload
  const { tenantId, sourceId, content, metadata } = job.data;
  
  // Persist raw event via service layer
  const event = await eventService.createRawEvent({
    tenantId,
    sourceId,
    content,
    metadata
  });

  return {
    jobId: job.id,
    tenantId,
    sourceId,
    eventId: event.id,
    processed: true
  };
}
