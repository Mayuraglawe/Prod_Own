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

  it('scrubs a realistic, messy JSON stack trace payload', () => {
    const bus = new InMemoryEventBus();
    const service = new ProcessingService(bus);
    
    const rawPayload = JSON.stringify({
      level: 'error',
      message: 'Failed to connect to payment gateway',
      environment: 'production',
      request: {
        headers: {
          Authorization: 'Bearer super-secret-jwt-token-12345',
          'X-User-Email': 'customer.name@company.com'
        },
        body: '{"amount": 5000, "api_key": "live_key_xyz987"}'
      },
      stacktrace: 'Error: Connection Refused\\n    at gateway.ts:42 (token=Bearer abcxyz email=dev@app.com)'
    });

    const scrubbed = service.scrubPII(rawPayload);
    
    // Ensure raw secrets are GONE
    expect(scrubbed).not.toContain('super-secret-jwt-token-12345');
    expect(scrubbed).not.toContain('customer.name@company.com');
    expect(scrubbed).not.toContain('live_key_xyz987');
    expect(scrubbed).not.toContain('dev@app.com');
    expect(scrubbed).not.toContain('abcxyz');

    // Ensure placeholders were inserted
    expect(scrubbed).toContain('[SCRUBBED_TOKEN]');
    expect(scrubbed).toContain('[SCRUBBED_EMAIL]');
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
