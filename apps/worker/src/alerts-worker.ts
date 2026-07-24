import { Worker, ConnectionOptions } from 'bullmq';
import { queueNames, redisConnection, AlertJobPayload } from '@litetrace/queue';
import { prisma } from '@litetrace/db';

/**
 * Maps a job trigger type to an alert severity level.
 */
function triggerToSeverity(trigger: AlertJobPayload['trigger']): string {
  switch (trigger) {
    case 'new_issue':  return 'info';
    case 'reopened':   return 'warning';
    default:           return 'info';
  }
}

/**
 * BullMQ worker that consumes the alerts queue.
 *
 * For each job it:
 *  1. Loads the Issue with its source
 *  2. Fetches all AlertConfigs matching the trigger event type for that source
 *  3. Deduplicates per (issue, channel, 1-hour bucket) using a Redis NX key
 *  4. POSTs the alert payload to each configured webhook URL
 *  5. Writes an AlertEvent audit record on success
 */
export const alertsWorker = new Worker<AlertJobPayload>(
  queueNames.alerts,
  async (job) => {
    const { issueId, trigger } = job.data;

    console.log(`[Alerts Worker] Processing job: ${trigger} for issue ${issueId}`);

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { source: true },
    });

    if (!issue) {
      console.log(`[Alerts Worker] Issue ${issueId} not found — skipping.`);
      return;
    }

    // Fetch alert configs that subscribe to this trigger event type
    const configs = await prisma.alertConfig.findMany({
      where: {
        sourceId: issue.sourceId,
        events: { has: trigger },
      },
    });

    if (configs.length === 0) {
      console.log(`[Alerts Worker] No matching alert configs for issue ${issueId} trigger=${trigger}`);
      return;
    }

    for (const config of configs) {
      // Dedup key: one alert per issue per channel per hour
      const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60));
      const dedupKey = `dedup:alert:${issueId}:${config.channel}:${hourBucket}`;

      const acquired = await redisConnection.set(dedupKey, '1', 'EX', 3600, 'NX');
      if (!acquired) {
        console.log(`[Alerts Worker] Throttled — ${config.channel} already alerted for issue ${issueId} this hour.`);
        continue;
      }

      const webhookPayload = {
        issue: {
          id: issue.id,
          title: issue.title ?? 'Untitled Issue',
          status: issue.status,
          eventCount: issue.eventCount,
          firstSeen: issue.firstSeen,
          lastSeen: issue.lastSeen,
        },
        project: issue.source.name,
        trigger,
      };

      try {
        console.log(`[Alerts Worker] Dispatching ${trigger} alert to ${config.channel} → ${config.webhookUrl}`);

        const response = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });

        if (!response.ok) {
          console.error(
            `[Alerts Worker] Webhook failed — ${config.channel}: HTTP ${response.status} ${response.statusText}`
          );
        } else {
          console.log(`[Alerts Worker] Alert dispatched successfully to ${config.channel}`);

          // Audit trail
          await prisma.alertEvent.create({
            data: {
              tenantId: config.tenantId,
              channel: config.channel,
              title: `Alert: ${webhookPayload.issue.title}`,
              message: `Triggered by ${trigger}`,
              severity: triggerToSeverity(trigger),
            },
          });
        }
      } catch (err: unknown) {
        console.error(`[Alerts Worker] Error dispatching to ${config.channel}:`, err);
      }
    }
  },
  {
    // Cast required: ioredis type differs from BullMQ's bundled ConnectionOptions subtype
    connection: redisConnection as unknown as ConnectionOptions,
  }
);
