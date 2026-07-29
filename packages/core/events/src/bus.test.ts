import { describe, it, expect, vi } from 'vitest';
import { InMemoryEventBus } from './bus.js';
import { EventTopic } from './events.js';

describe('InMemoryEventBus', () => {
  it('publishes and subscribes to events successfully', async () => {
    const bus = new InMemoryEventBus();
    const mockHandler = vi.fn().mockResolvedValue(undefined);

    bus.subscribe(EventTopic.TELEMETRY_RECEIVED, mockHandler);

    await bus.publish(
      EventTopic.TELEMETRY_RECEIVED,
      { rawBody: '{"test":"error"}', headers: {} },
      { tenantId: 'tenant-1', projectId: 'proj-1' }
    );

    // Give microtask queue time to run
    await new Promise((r) => setTimeout(r, 50));

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler.mock.calls[0]![0].tenantId).toBe('tenant-1');
  });

  it('routes failed events to DLQ after maximum retries', async () => {
    const bus = new InMemoryEventBus({ maxRetries: 2, initialBackoffMs: 10 });
    const failingHandler = vi.fn().mockRejectedValue(new Error('Processing Failed'));

    bus.subscribe(EventTopic.TELEMETRY_PROCESSED, failingHandler);

    await bus.publish(
      EventTopic.TELEMETRY_PROCESSED,
      {
        eventId: 'evt-1',
        type: 'error',
        level: 'error',
        message: 'Fatal failure',
        scrubbedPayload: {},
      },
      { tenantId: 'tenant-1', projectId: 'proj-1' }
    );

    await new Promise((r) => setTimeout(r, 200));

    const dlq = bus.getDLQManager();
    const deadLetters = await dlq.getDeadLetters();

    expect(deadLetters.length).toBe(1);
    expect(deadLetters[0]!.errorReason).toBe('Processing Failed');
  });
});
