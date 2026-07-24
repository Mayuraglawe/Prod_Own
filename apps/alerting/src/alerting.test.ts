import { describe, it, expect, vi } from 'vitest';
import { AlertingService } from './index.js';
import { InMemoryEventBus, EventTopic } from '@litetrace/events';

describe('AlertingService', () => {
  it('triggers alert on new issue creation', async () => {
    const bus = new InMemoryEventBus();
    const service = new AlertingService(bus);
    const mockHandler = vi.fn().mockResolvedValue(undefined);

    bus.subscribe(EventTopic.ALERT_TRIGGERED, mockHandler);

    await service.handleIssueGrouped({
      eventId: 'e1',
      topic: EventTopic.ISSUE_GROUPED,
      timestamp: new Date().toISOString(),
      tenantId: 't1',
      projectId: 'p1',
      payload: {
        issueId: 'iss-1',
        fingerprint: 'fp-1',
        title: 'Unhandled Exception',
        level: 'error',
        isNew: true,
        occurrenceCount: 1,
        lastSeen: new Date().toISOString(),
        eventId: 'evt-1',
      },
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler.mock.calls[0]![0].payload.ruleName).toBe('New Error Detected');
  });

  it('respects cooldown and suppresses repeated burst alerts within cooldown window', async () => {
    const bus = new InMemoryEventBus();
    const service = new AlertingService(bus, undefined, 300); // 300s cooldown
    const mockHandler = vi.fn().mockResolvedValue(undefined);

    bus.subscribe(EventTopic.ALERT_TRIGGERED, mockHandler);

    const baseEvent = {
      eventId: 'e1',
      topic: EventTopic.ISSUE_GROUPED,
      timestamp: new Date().toISOString(),
      tenantId: 't1',
      projectId: 'p1',
      payload: {
        issueId: 'iss-1',
        fingerprint: 'fp-1',
        title: 'Unhandled Exception',
        level: 'error',
        isNew: true,
        occurrenceCount: 1,
        lastSeen: new Date().toISOString(),
        eventId: 'evt-1',
      },
    };

    // First call -> triggers alert
    await service.handleIssueGrouped(baseEvent);

    // Second call immediately after -> suppressed due to cooldown
    await service.handleIssueGrouped({
      ...baseEvent,
      payload: { ...baseEvent.payload, isNew: false, occurrenceCount: 5 },
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(mockHandler).toHaveBeenCalledTimes(1); // Only 1 alert fired
  });
});
