import { BaseEvent, AlertTriggeredPayload } from '@litetrace/events';

export interface HttpDispatcher {
  postJson(url: string, payload: Record<string, unknown>): Promise<{ status: number }>;
}

export class MockHttpDispatcher implements HttpDispatcher {
  public dispatched: Array<{ url: string; payload: Record<string, unknown> }> = [];

  public async postJson(url: string, payload: Record<string, unknown>): Promise<{ status: number }> {
    this.dispatched.push({ url, payload });
    return { status: 200 };
  }
}

export class NotificationService {
  constructor(private readonly httpDispatcher: HttpDispatcher = new MockHttpDispatcher()) {}

  public async handleAlertTriggered(event: BaseEvent<AlertTriggeredPayload>): Promise<{ dispatchedCount: number }> {
    const { alertId, issueTitle, message, webhookUrl, channels } = event.payload;
    let dispatchedCount = 0;

    for (const channel of channels) {
      if (channel === 'slack') {
        const slackUrl = process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/mock/test/channel';
        await this.httpDispatcher.postJson(slackUrl, {
          text: message,
          attachments: [{ color: '#E01E5A', title: `Alert ID: ${alertId}`, text: issueTitle }],
        });
        dispatchedCount += 1;
      } else if (channel === 'webhook' && webhookUrl) {
        await this.httpDispatcher.postJson(webhookUrl, {
          event: 'alert.triggered',
          alertId,
          issueTitle,
          tenantId: event.tenantId,
          projectId: event.projectId,
        });
        dispatchedCount += 1;
      }
    }

    return { dispatchedCount };
  }
}
