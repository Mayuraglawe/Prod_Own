import { describe, it, expect } from 'vitest';
import { IngestionService } from './index.js';
import { InMemoryEventBus } from '@litetrace/events';

describe('IngestionService', () => {
  it('publishes telemetry.received event successfully', async () => {
    const bus = new InMemoryEventBus();
    const service = new IngestionService(bus);

    const res = await service.processIngestRequest({
      rawBody: '{"message":"TypeError: Cannot read properties of undefined"}',
      headers: { 'x-sdk-name': 'sentry.javascript.nextjs', 'x-sdk-version': '1.0.0' },
      tenantId: '123e4567-e89b-12d3-a456-426614174000',
      projectId: '987fcdeb-51a2-43d7-9012-345678901234',
    });

    expect(res.status).toBe('QUEUED');
    expect(res.eventId).toContain('evt_');
  });

  it('rejects empty payload requests', async () => {
    const bus = new InMemoryEventBus();
    const service = new IngestionService(bus);

    await expect(
      service.processIngestRequest({
        rawBody: '',
        headers: { 'x-sdk-name': 'sentry.javascript.nextjs', 'x-sdk-version': '1.0.0' },
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        projectId: '987fcdeb-51a2-43d7-9012-345678901234',
      })
    ).rejects.toThrow('Payload Body Cannot Be Empty');
  });
});
