import { describe, it, expect } from 'vitest';
import { IngestionService } from './index.js';
import { InMemoryEventBus } from '@litetrace/events';

describe('IngestionService', () => {
  it('publishes telemetry.received event successfully', async () => {
    const bus = new InMemoryEventBus();
    const service = new IngestionService(bus);

    const res = await service.processIngestRequest({
      rawBody: '{"message":"TypeError: Cannot read properties of undefined"}',
      headers: { 'x-sdk-name': 'sentry.javascript.nextjs' },
      tenantId: 'tenant-100',
      projectId: 'proj-500',
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
        headers: {},
        tenantId: 't1',
        projectId: 'p1',
      })
    ).rejects.toThrow('Payload Body Cannot Be Empty');
  });
});
