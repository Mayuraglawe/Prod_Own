import { describe, it, expect, vi } from 'vitest';
import { ProcessingService } from './index.js';
import { InMemoryEventBus, EventTopic } from '@litetrace/events';

describe('ProcessingService', () => {
  it('scrubs emails, Bearer tokens, and API keys before persistence', () => {
    const bus = new InMemoryEventBus();
    const service = new ProcessingService(bus);

    const input = 'User test@example.com used bearer secret_token_123 and apikey=secret_key_999';
    const scrubbed = service.scrubPII(input);

    expect(scrubbed).not.toContain('test@example.com');
    expect(scrubbed).not.toContain('secret_token_123');
    expect(scrubbed).not.toContain('secret_key_999');
    expect(scrubbed).toContain('[SCRUBBED_EMAIL]');
    expect(scrubbed).toContain('[SCRUBBED_TOKEN]');
    expect(scrubbed).toContain('[SCRUBBED_KEY]');
  });

  it('uploads payload to S3 and publishes telemetry.processed event', async () => {
    const bus = new InMemoryEventBus();
    const service = new ProcessingService(bus);
    const mockHandler = vi.fn().mockResolvedValue(undefined);

    bus.subscribe(EventTopic.TELEMETRY_PROCESSED, mockHandler);

    await service.handleTelemetryReceived({
      eventId: 'evt-100',
      topic: EventTopic.TELEMETRY_RECEIVED,
      timestamp: new Date().toISOString(),
      tenantId: 'tenant-1',
      projectId: 'proj-1',
      payload: {
        rawBody: JSON.stringify({ message: 'Database Connection Timeout', level: 'fatal' }),
        headers: {},
      },
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler.mock.calls[0]![0].payload.s3BlobUri).toContain('s3://litetrace-blobs/');
  });
});
