import { createAlertQueue } from '@prod-own/queue';

export class AlertService {
  /**
   * Enqueues a Slack webhook alert dispatch.
   */
  async enqueueSlackWebhook(payload: Record<string, unknown>): Promise<void> {
    const queue = createAlertQueue();
    // The task name 'slack-webhook' triggers the corresponding worker handler module.
    await queue.add('slack-webhook', payload);
  }
}

export const alertService = new AlertService();
