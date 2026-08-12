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

/**
 * Polls Kafka to calculate consumer lag for a specific group and topic.
 */
async function getKafkaConsumerLag(groupId: string, topic: string): Promise<number> {
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
async function getBullMQQueueMetrics(queue: Queue) {
  try {
    const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed');
    return counts;
  } catch (err) {
    console.error('Error fetching BullMQ metrics:', err);
    return null;
  }
}

/**
 * Main polling loop for the sidecar monitor.
 */
async function startMonitor() {
  await admin.connect();
  console.log('Monitor Sidecar started...');

  const KAFKA_LAG_THRESHOLD = 5000;
  const POLL_INTERVAL_MS = 30000;

  setInterval(async () => {
    // 1. Check Grouping Service Kafka Lag
    const groupingLag = await getKafkaConsumerLag('grouping-service-group', 'TELEMETRY_RECEIVED');
    console.log(`[Metrics] Kafka Consumer Lag (TELEMETRY_RECEIVED): ${groupingLag}`);
    
    if (groupingLag > KAFKA_LAG_THRESHOLD) {
      console.warn(`🚨 [ALERT] High Consumer Lag detected! Current lag: ${groupingLag}`);
      // In production, trigger n8n webhook or slack alert here
    }

    // 2. Check Notification Queue Depth
    const queueMetrics = await getBullMQQueueMetrics(notificationQueue);
    if (queueMetrics) {
      console.log(`[Metrics] BullMQ Notification Queue: Waiting=${queueMetrics.waiting} Active=${queueMetrics.active} Failed=${queueMetrics.failed}`);
      
      if (queueMetrics.waiting > 1000) {
        console.warn(`🚨 [ALERT] High Notification Queue depth! Waiting: ${queueMetrics.waiting}`);
      }
    }
  }, POLL_INTERVAL_MS);
}

// Ensure graceful shutdown
process.on('SIGTERM', async () => {
  await admin.disconnect();
  await redisConnection.quit();
  process.exit(0);
});

startMonitor().catch(err => {
  console.error('Failed to start monitor:', err);
  process.exit(1);
});
