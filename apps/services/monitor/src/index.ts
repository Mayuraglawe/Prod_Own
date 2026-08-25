import { Kafka } from 'kafkajs';
import { Queue, ConnectionOptions } from 'bullmq';
import { env } from '@litetrace/config';
import IORedis from 'ioredis';

// Setup Kafka Admin for consumer lag metrics
const kafka = new Kafka({
  clientId: 'litetrace-monitor',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});
const admin = kafka.admin();

// Setup BullMQ Queue for notification metrics
const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});
const notificationQueue = new Queue('notification-queue', { connection: redisConnection as unknown as ConnectionOptions });

export interface HttpDispatcher {
  postJson(url: string, payload: Record<string, unknown>): Promise<{ status: number }>;
}

export class DefaultHttpDispatcher implements HttpDispatcher {
  public async postJson(url: string, payload: Record<string, unknown>): Promise<{ status: number }> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return { status: response.status };
    } catch (err) {
      console.error(`Failed to post alert notification to ${url}:`, err);
      return { status: 500 };
    }
  }
}

export class MonitorAlertCooldown {
  private lastFired = new Map<string, number>();

  constructor(private readonly cooldownMs: number = 15 * 60 * 1000) {}

  public shouldFire(alertKey: string): boolean {
    const now = Date.now();
    const last = this.lastFired.get(alertKey);
    if (!last || now - last >= this.cooldownMs) {
      this.lastFired.set(alertKey, now);
      return true;
    }
    return false;
  }

  public clear(): void {
    this.lastFired.clear();
  }
}

export interface MetricBreachItem {
  alertType: 'KAFKA_LAG_HIGH' | 'NOTIFICATION_QUEUE_BACKLOG';
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  metricDetails: Record<string, unknown>;
}

export interface MonitorAlertPayload {
  alertType: 'KAFKA_LAG_HIGH' | 'NOTIFICATION_QUEUE_BACKLOG' | 'SYSTEM_HEALTH_BREACH';
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  metricDetails: Record<string, unknown>;
  timestamp: string;
  breaches?: MetricBreachItem[];
}

/**
 * Dispatches monitor alert notifications to configured HTTP Webhooks (Slack/n8n)
 * and enqueues to BullMQ notificationQueue for internal async handling.
 */
export async function sendMonitorAlert(
  payload: MonitorAlertPayload,
  httpDispatcher: HttpDispatcher = new DefaultHttpDispatcher(),
  targetQueue: Queue = notificationQueue
): Promise<{ dispatchedWebhook: boolean; enqueuedJob: boolean }> {
  let dispatchedWebhook = false;
  let enqueuedJob = false;

  const webhookUrl = process.env.MONITOR_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const isSlack = webhookUrl.includes('slack.com');
      const body = isSlack
        ? {
            text: `🚨 *[MONITOR SYSTEM ALERT - ${payload.severity}]* ${payload.message}`,
            attachments: payload.breaches
              ? payload.breaches.map(b => ({
                  color: payload.severity === 'CRITICAL' ? '#FF0000' : '#FFA500',
                  title: `${b.alertType} (${b.severity})`,
                  text: b.message,
                  fields: Object.entries(b.metricDetails).map(([key, val]) => ({
                    title: key,
                    value: String(val),
                    short: true
                  })),
                  ts: Math.floor(new Date(payload.timestamp).getTime() / 1000)
                }))
              : [
                  {
                    color: payload.severity === 'CRITICAL' ? '#FF0000' : '#FFA500',
                    title: payload.alertType,
                    fields: Object.entries(payload.metricDetails).map(([key, val]) => ({
                      title: key,
                      value: String(val),
                      short: true
                    })),
                    ts: Math.floor(new Date(payload.timestamp).getTime() / 1000)
                  }
                ]
          }
        : payload;

      const res = await httpDispatcher.postJson(webhookUrl, body as Record<string, unknown>);
      if (res.status >= 200 && res.status < 300) {
        dispatchedWebhook = true;
      }
    } catch (err) {
      console.error('Error dispatching monitor alert webhook:', err);
    }
  }

  if (targetQueue) {
    try {
      await targetQueue.add('monitor-alert', payload, { removeOnComplete: true });
      enqueuedJob = true;
    } catch (err) {
      console.error('Error enqueuing monitor alert to BullMQ:', err);
    }
  }

  return { dispatchedWebhook, enqueuedJob };
}

/**
 * Polls Kafka to calculate consumer lag for a specific group and topic.
 */
export async function getKafkaConsumerLag(groupId: string, topic: string): Promise<number> {
  try {
    const offsets = await admin.fetchTopicOffsets(topic);
    const consumerOffsets = await admin.fetchOffsets({ groupId, topics: [topic] });
    
    let totalLag = 0;
    
    const topicOffsets = consumerOffsets.find((t: { topic: string }) => t.topic === topic);
    if (!topicOffsets) return 0;
    
    for (const partition of offsets) {
      const consumerPartition = topicOffsets.partitions.find((p: { partition: number, offset: string }) => p.partition === partition.partition);
      if (consumerPartition && consumerPartition.offset !== '-1') {
        const highWatermark = parseInt(partition.high, 10);
        const currentOffset = parseInt(consumerPartition.offset, 10);
        
        if (!isNaN(highWatermark) && !isNaN(currentOffset)) {
          totalLag += Math.max(0, highWatermark - currentOffset);
        }
      } else {
        // If consumer hasn't committed an offset, lag is the high watermark
        totalLag += parseInt(partition.high, 10) || 0;
      }
    }
    
    return totalLag;
  } catch (err) {
    console.error('Error fetching Kafka lag:', err);
    return 0;
  }
}

/**
 * Polls BullMQ to get active queue depth metrics.
 */
export async function getBullMQQueueMetrics(queue: Queue) {
  try {
    const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed');
    return counts;
  } catch (err) {
    console.error('Error fetching BullMQ metrics:', err);
    return null;
  }
}

export const globalMonitorCooldown = new MonitorAlertCooldown();

/**
 * Checks Kafka lag and dispatches alert if threshold is breached.
 */
export async function checkAndAlertConsumerLag(
  groupId: string,
  topic: string,
  threshold = 5000,
  cooldownTracker: MonitorAlertCooldown = globalMonitorCooldown,
  httpDispatcher?: HttpDispatcher,
  queue: Queue = notificationQueue
) {
  const lag = await getKafkaConsumerLag(groupId, topic);
  console.log(`[Metrics] Kafka Consumer Lag (${topic}): ${lag}`);
  
  if (lag > threshold) {
    console.warn(`🚨 [ALERT] High Consumer Lag detected! Current lag: ${lag}`);
    const alertKey = `kafka_lag_${groupId}_${topic}`;
    if (cooldownTracker.shouldFire(alertKey)) {
      await sendMonitorAlert(
        {
          alertType: 'KAFKA_LAG_HIGH',
          severity: lag > threshold * 2 ? 'CRITICAL' : 'WARNING',
          message: `Kafka Consumer Lag on topic '${topic}' (group: ${groupId}) reached ${lag} (threshold: ${threshold})`,
          metricDetails: {
            topic,
            groupId,
            currentLag: lag,
            threshold
          },
          timestamp: new Date().toISOString()
        },
        httpDispatcher,
        queue
      );
    } else {
      console.log(`[Metrics] Alert for ${alertKey} suppressed due to active cooldown.`);
    }
  }
  return lag;
}

/**
 * Checks BullMQ queue depth metrics and dispatches alert if threshold is breached.
 */
export async function checkAndAlertQueueMetrics(
  queue: Queue = notificationQueue,
  threshold = 1000,
  cooldownTracker: MonitorAlertCooldown = globalMonitorCooldown,
  httpDispatcher?: HttpDispatcher
) {
  const queueMetrics = await getBullMQQueueMetrics(queue);
  if (queueMetrics) {
    console.log(`[Metrics] BullMQ Notification Queue: Waiting=${queueMetrics.waiting} Active=${queueMetrics.active} Failed=${queueMetrics.failed}`);
    
    const waiting = queueMetrics.waiting || 0;
    if (waiting > threshold) {
      console.warn(`🚨 [ALERT] High Notification Queue depth! Waiting: ${waiting}`);
      const alertKey = `bullmq_depth_${queue.name || 'notification-queue'}`;
      if (cooldownTracker.shouldFire(alertKey)) {
        await sendMonitorAlert(
          {
            alertType: 'NOTIFICATION_QUEUE_BACKLOG',
            severity: waiting > threshold * 5 ? 'CRITICAL' : 'WARNING',
            message: `BullMQ Queue depth for '${queue.name || 'notification-queue'}' reached ${waiting} waiting jobs (threshold: ${threshold})`,
            metricDetails: {
              queueName: queue.name || 'notification-queue',
              waiting,
              active: queueMetrics.active,
              failed: queueMetrics.failed,
              threshold
            },
            timestamp: new Date().toISOString()
          },
          httpDispatcher,
          queue
        );
      } else {
        console.log(`[Metrics] Alert for ${alertKey} suppressed due to active cooldown.`);
      }
    }
  }
  return queueMetrics;
}

/**
 * Executes a full monitor poll cycle.
 * Gathers all metrics (Kafka lag, BullMQ queue depth), collects active breaches,
 * and sends EXACTLY ONE consolidated notification if any unthrottled breaches occur.
 */
export async function performMonitorPollCycle(
  kafkaGroupId = 'grouping-service-group',
  kafkaTopic = 'TELEMETRY_RECEIVED',
  kafkaThreshold = 5000,
  queue = notificationQueue,
  queueThreshold = 1000,
  cooldownTracker: MonitorAlertCooldown = globalMonitorCooldown,
  httpDispatcher?: HttpDispatcher
): Promise<{ groupingLag: number; queueMetrics: Record<string, number> | null; breachesCount: number }> {
  // 1. Check Kafka Consumer Lag
  const groupingLag = await getKafkaConsumerLag(kafkaGroupId, kafkaTopic);
  console.log(`[Metrics] Kafka Consumer Lag (${kafkaTopic}): ${groupingLag}`);

  // 2. Check Notification Queue Depth
  const queueMetrics = await getBullMQQueueMetrics(queue);
  if (queueMetrics) {
    console.log(`[Metrics] BullMQ Notification Queue: Waiting=${queueMetrics.waiting} Active=${queueMetrics.active} Failed=${queueMetrics.failed}`);
  }

  const breaches: MetricBreachItem[] = [];

  // Evaluate Kafka Lag breach
  if (groupingLag > kafkaThreshold) {
    console.warn(`🚨 [ALERT] High Consumer Lag detected! Current lag: ${groupingLag}`);
    const alertKey = `kafka_lag_${kafkaGroupId}_${kafkaTopic}`;
    if (cooldownTracker.shouldFire(alertKey)) {
      breaches.push({
        alertType: 'KAFKA_LAG_HIGH',
        severity: groupingLag > kafkaThreshold * 2 ? 'CRITICAL' : 'WARNING',
        message: `Kafka Consumer Lag on topic '${kafkaTopic}' (group: ${kafkaGroupId}) reached ${groupingLag} (threshold: ${kafkaThreshold})`,
        metricDetails: {
          topic: kafkaTopic,
          groupId: kafkaGroupId,
          currentLag: groupingLag,
          threshold: kafkaThreshold
        }
      });
    } else {
      console.log(`[Metrics] Alert for ${alertKey} suppressed due to active cooldown.`);
    }
  }

  // Evaluate Queue Depth breach
  if (queueMetrics) {
    const waiting = queueMetrics.waiting || 0;
    if (waiting > queueThreshold) {
      console.warn(`🚨 [ALERT] High Notification Queue depth! Waiting: ${waiting}`);
      const alertKey = `bullmq_depth_${queue.name || 'notification-queue'}`;
      if (cooldownTracker.shouldFire(alertKey)) {
        breaches.push({
          alertType: 'NOTIFICATION_QUEUE_BACKLOG',
          severity: waiting > queueThreshold * 5 ? 'CRITICAL' : 'WARNING',
          message: `BullMQ Queue depth for '${queue.name || 'notification-queue'}' reached ${waiting} waiting jobs (threshold: ${queueThreshold})`,
          metricDetails: {
            queueName: queue.name || 'notification-queue',
            waiting,
            active: queueMetrics.active,
            failed: queueMetrics.failed,
            threshold: queueThreshold
          }
        });
      } else {
        console.log(`[Metrics] Alert for ${alertKey} suppressed due to active cooldown.`);
      }
    }
  }

  // Dispatch ONE consolidated notification if there are breaches
  if (breaches.length > 0) {
    const hasCritical = breaches.some(b => b.severity === 'CRITICAL');
    const overallSeverity: 'WARNING' | 'CRITICAL' = hasCritical ? 'CRITICAL' : 'WARNING';

    const firstBreach = breaches[0];
    if (firstBreach) {
      const alertType = breaches.length === 1 ? firstBreach.alertType : 'SYSTEM_HEALTH_BREACH';
      const message = breaches.length === 1
        ? firstBreach.message
        : `System Health Breach: ${breaches.length} alert conditions detected [${breaches.map(b => b.alertType).join(', ')}]`;

      const metricDetails = breaches.length === 1
        ? firstBreach.metricDetails
        : { breachCount: breaches.length, alertTypes: breaches.map(b => b.alertType) };

      await sendMonitorAlert(
        {
          alertType,
          severity: overallSeverity,
          message,
          metricDetails,
          timestamp: new Date().toISOString(),
          breaches
        },
        httpDispatcher,
        queue
      );
    }
  }

  return { groupingLag, queueMetrics, breachesCount: breaches.length };
}

/**
 * Main polling loop for the sidecar monitor.
 */
export async function startMonitor(httpDispatcher?: HttpDispatcher) {
  try {
    await admin.connect();
    console.log('Monitor Sidecar connected to Kafka successfully...');
  } catch (err) {
    console.warn(`[Monitor Sidecar] Warning: Kafka connection unavailable at startup (${err instanceof Error ? err.message : err}). Will poll gracefully.`);
  }

  const KAFKA_LAG_THRESHOLD = 5000;
  const QUEUE_DEPTH_THRESHOLD = 1000;
  const POLL_INTERVAL_MS = 30000;

  const intervalId = setInterval(async () => {
    // Perform unified poll cycle (ensures ONE consolidated notification per poll cycle)
    await performMonitorPollCycle(
      'grouping-service-group',
      'TELEMETRY_RECEIVED',
      KAFKA_LAG_THRESHOLD,
      notificationQueue,
      QUEUE_DEPTH_THRESHOLD,
      globalMonitorCooldown,
      httpDispatcher
    );
  }, POLL_INTERVAL_MS);

  return { intervalId, admin, redisConnection };
}

// Ensure graceful shutdown
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGTERM', async () => {
    try {
      await admin.disconnect();
      await redisConnection.quit();
    } catch (err) {
      console.warn('[Monitor Sidecar] Error during shutdown cleanup:', err);
    }
    process.exit(0);
  });

  startMonitor().catch(err => {
    console.error('Failed to start monitor:', err);
  });
}



