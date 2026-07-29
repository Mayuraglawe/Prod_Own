import { createAlertQueue } from '../factories';

export type AlertJobPayload = {
  issueId: string;
  trigger: 'new_issue' | 'reopened';
};

/**
 * Module-level singleton Queue instance.
 * Created once on first import and reused across all enqueueAlert calls,
 * avoiding per-call connection overhead.
 */
const alertQueue = createAlertQueue();

/**
 * Enqueues an alert dispatch job into the alerts BullMQ queue.
 *
 * @param issueId - The ID of the issue that triggered the alert
 * @param trigger - Whether this is a brand-new issue or a re-opened one
 */
export async function enqueueAlert(issueId: string, trigger: AlertJobPayload['trigger']) {
  await alertQueue.add('dispatch_alert', { issueId, trigger });
}
