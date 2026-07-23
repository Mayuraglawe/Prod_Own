import { Worker, ConnectionOptions } from 'bullmq';
import { queueNames, redisConnection, AlertJobPayload } from '@prod-own/queue';
import { prisma } from '@prod-own/db';

export const alertsWorker = new Worker<AlertJobPayload>(
  queueNames.alerts,
  async (job) => {
    const { issueId, trigger } = job.data;
    
    console.log(`[Alerts Worker] Processing alert job for issue ${issueId}`);
    
    // Fetch issue with source
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { source: true }
    });

    if (!issue) {
      console.log(`[Alerts Worker] Issue ${issueId} not found, skipping.`);
      return;
    }

    // Fetch alert configs for the source
    // Using (prisma as any) temporarily because of TS/ESLint cache conflicts in IDE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configs = await (prisma as any).alertConfig.findMany({
      where: {
        sourceId: issue.sourceId,
        events: {
          has: trigger
        }
      }
    });

    if (configs.length === 0) {
      console.log(`[Alerts Worker] No alert configs found for issue ${issueId}`);
      return;
    }

    // Process each config
    for (const config of configs) {
      // Deduplication: issue_id:channel:hour_bucket
      const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60));
      const dedupKey = `dedup:alert:${issueId}:${config.channel}:${hourBucket}`;
      
      const isNew = await redisConnection.set(dedupKey, '1', 'EX', 3600, 'NX');
      
      if (!isNew) {
        console.log(`[Alerts Worker] Throttled alert for issue ${issueId} on channel ${config.channel}`);
        continue;
      }

      // Dispatch to webhook
      console.log(`[Alerts Worker] Dispatching alert to ${config.webhookUrl} for issue ${issueId}`);
      try {
        const payload = {
          issue: {
            id: issue.id,
            title: issue.title || 'Untitled Issue',
            status: issue.status,
            eventCount: issue.eventCount,
            firstSeen: issue.firstSeen,
            lastSeen: issue.lastSeen,
          },
          project: issue.source.name,
          trigger
        };

        const response = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          console.error(`[Alerts Worker] Failed to dispatch to ${config.channel}: ${response.statusText}`);
        } else {
            console.log(`[Alerts Worker] Successfully dispatched to ${config.channel}`);
            // Store AlertEvent for audit trail
            await prisma.alertEvent.create({
                data: {
                    tenantId: config.tenantId,
                    channel: config.channel,
                    title: `Alert: ${payload.issue.title}`,
                    message: `Triggered by ${trigger}`,
                    severity: 'error'
                }
            });
        }
      } catch (error) {
        console.error(`[Alerts Worker] Error dispatching to ${config.channel}:`, error);
      }
    }
  },
  { 
    // Cast connection because of ioredis type mismatch in BullMQ
    connection: redisConnection as unknown as ConnectionOptions 
  }
);
