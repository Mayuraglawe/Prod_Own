import { describe, it, expect } from 'vitest';
import { NotificationService, MockHttpDispatcher } from './index.js';
import { EventTopic } from '@litetrace/events';

describe('NotificationService', () => {
  it('dispatches notifications to Slack and custom webhooks', async () => {
    const dispatcher = new MockHttpDispatcher();
    const service = new NotificationService(dispatcher);

    const result = await service.handleAlertTriggered({
      eventId: 'evt-1',
      topic: EventTopic.ALERT_TRIGGERED,
      timestamp: new Date().toISOString(),
      tenantId: 't1',
      projectId: 'p1',
      payload: {
        alertId: 'alt-1',
        ruleName: 'New Error',
        issueId: 'iss-1',
        projectKey: 'proj-1',
        issueTitle: 'Unhandled Rejection',
        occurrenceBurstCount: 1,
        channels: ['slack', 'webhook'],
        webhookUrl: 'https://n8n.example.com/webhook/test',
        message: 'New error occurred',
      },
    });

    expect(result.dispatchedCount).toBe(2);
    expect(dispatcher.dispatched.length).toBe(2);
    expect(dispatcher.dispatched[1]!.url).toBe('https://n8n.example.com/webhook/test');
  });
});
