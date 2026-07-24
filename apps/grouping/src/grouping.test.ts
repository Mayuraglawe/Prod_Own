import { describe, it, expect, vi } from 'vitest';
import { GroupingService } from './index.js';
import { InMemoryEventBus, EventTopic } from '@litetrace/events';

describe('GroupingService', () => {
  it('generates deterministic SHA256 fingerprint for issues', () => {
    const bus = new InMemoryEventBus();
    const service = new GroupingService(bus);

    const fp1 = service.generateFingerprint('ReferenceError: x is not defined', 'app.js');
    const fp2 = service.generateFingerprint('ReferenceError: x is not defined', 'app.js');
    const fp3 = service.generateFingerprint('SyntaxError: unexpected token', 'app.js');

    expect(fp1).toBe(fp2);
    expect(fp1).not.toBe(fp3);
  });

  it('groups duplicate telemetry events under the same issue ID', async () => {
    const bus = new InMemoryEventBus();
    const service = new GroupingService(bus);
    const mockHandler = vi.fn().mockResolvedValue(undefined);

    bus.subscribe(EventTopic.ISSUE_GROUPED, mockHandler);

    const baseEvent = {
      eventId: 'evt-1',
      topic: EventTopic.TELEMETRY_PROCESSED,
      timestamp: new Date().toISOString(),
      tenantId: 't1',
      projectId: 'p1',
      payload: {
        eventId: 'evt-1',
        type: 'error' as const,
        level: 'error',
        message: 'Network Timeout',
        scrubbedPayload: {},
      },
    };

    await service.handleTelemetryProcessed(baseEvent);
    await service.handleTelemetryProcessed({ ...baseEvent, eventId: 'evt-2' });

    await new Promise((r) => setTimeout(r, 50));

    expect(mockHandler).toHaveBeenCalledTimes(2);
    const issue1 = mockHandler.mock.calls[0]![0].payload;
    const issue2 = mockHandler.mock.calls[1]![0].payload;

    expect(issue1.issueId).toBe(issue2.issueId);
    expect(issue1.isNew).toBe(true);
    expect(issue2.isNew).toBe(false);
    expect(issue2.occurrenceCount).toBe(2);
  });
});
