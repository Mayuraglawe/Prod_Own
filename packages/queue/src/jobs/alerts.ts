import { createAlertQueue } from '../factories';

export type AlertJobPayload = {
  issueId: string;
  trigger: 'new_issue' | 'reopened';
};

/**
 * Enqueues an alert job for evaluation and dispatch.
 */
export async function enqueueAlert(issueId: string, trigger: AlertJobPayload['trigger']) {
  const queue = createAlertQueue();
  await queue.add('dispatch_alert', {
    issueId,
    trigger
  });
}
