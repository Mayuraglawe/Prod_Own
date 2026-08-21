import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Queue } from 'bullmq';

// 1. Setup hoisted variables before vi.mock executes
const { 
  mockConnect, 
  mockDisconnect, 
  mockFetchTopicOffsets, 
  mockFetchOffsets, 
  mockGetJobCounts 
} = vi.hoisted(() => {
  return {
    mockConnect: vi.fn().mockResolvedValue(undefined),
    mockDisconnect: vi.fn().mockResolvedValue(undefined),
    mockFetchTopicOffsets: vi.fn(),
    mockFetchOffsets: vi.fn(),
    mockGetJobCounts: vi.fn(),
  };
});

vi.mock('kafkajs', () => {
  return {
    Kafka: vi.fn().mockImplementation(() => ({
      admin: vi.fn().mockImplementation(() => ({
        connect: mockConnect,
        disconnect: mockDisconnect,
        fetchTopicOffsets: mockFetchTopicOffsets,
        fetchOffsets: mockFetchOffsets,
      })),
    })),
  };
});

vi.mock('bullmq', () => {
  return {
    Queue: vi.fn().mockImplementation(() => ({
      getJobCounts: mockGetJobCounts,
    })),
  };
});

vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      quit: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

// Import the monitor functions after mocking
import {
  getKafkaConsumerLag,
  getBullMQQueueMetrics,
  MonitorAlertCooldown,
  sendMonitorAlert,
  checkAndAlertConsumerLag,
  checkAndAlertQueueMetrics,
  performMonitorPollCycle,
  HttpDispatcher
} from './index';

describe('Monitor Sidecar Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MONITOR_WEBHOOK_URL;
    delete process.env.SLACK_WEBHOOK_URL;
  });

  describe('getKafkaConsumerLag', () => {
    it('calculates total lag when consumer has committed offsets', async () => {
      // Kafka topic partitions offsets
      mockFetchTopicOffsets.mockResolvedValue([
        { partition: 0, high: '100', low: '0' },
        { partition: 1, high: '150', low: '0' },
      ]);

      // Consumer group committed offsets
      mockFetchOffsets.mockResolvedValue([
        {
          topic: 'TELEMETRY_RECEIVED',
          partitions: [
            { partition: 0, offset: '90' }, // Lag = 10
            { partition: 1, offset: '130' }, // Lag = 20
          ],
        },
      ]);

      const lag = await getKafkaConsumerLag('grouping-service-group', 'TELEMETRY_RECEIVED');
      expect(lag).toBe(30);
      expect(mockFetchTopicOffsets).toHaveBeenCalledWith('TELEMETRY_RECEIVED');
      expect(mockFetchOffsets).toHaveBeenCalledWith({
        groupId: 'grouping-service-group',
        topics: ['TELEMETRY_RECEIVED'],
      });
    });

    it('calculates total lag as high watermark when consumer has not committed offsets (-1)', async () => {
      mockFetchTopicOffsets.mockResolvedValue([
        { partition: 0, high: '100', low: '0' },
      ]);

      mockFetchOffsets.mockResolvedValue([
        {
          topic: 'TELEMETRY_RECEIVED',
          partitions: [
            { partition: 0, offset: '-1' }, // Uncommitted offset
          ],
        },
      ]);

      const lag = await getKafkaConsumerLag('grouping-service-group', 'TELEMETRY_RECEIVED');
      expect(lag).toBe(100);
    });

    it('returns 0 if the topic is not found in consumer offsets', async () => {
      mockFetchTopicOffsets.mockResolvedValue([
        { partition: 0, high: '100', low: '0' },
      ]);
      mockFetchOffsets.mockResolvedValue([]); // No matching topics

      const lag = await getKafkaConsumerLag('grouping-service-group', 'TELEMETRY_RECEIVED');
      expect(lag).toBe(0);
    });

    it('gracefully handles errors and returns 0', async () => {
      mockFetchTopicOffsets.mockRejectedValue(new Error('Kafka Connection Timeout'));
      const lag = await getKafkaConsumerLag('grouping-service-group', 'TELEMETRY_RECEIVED');
      expect(lag).toBe(0);
    });
  });

  describe('getBullMQQueueMetrics', () => {
    it('retrieves wait, active, delayed, and failed job counts', async () => {
      const mockCounts = { waiting: 5, active: 2, delayed: 0, failed: 1 };
      mockGetJobCounts.mockResolvedValue(mockCounts);

      // Create a dummy queue
      const dummyQueue = {
        getJobCounts: mockGetJobCounts,
      } as unknown as Queue;

      const metrics = await getBullMQQueueMetrics(dummyQueue);
      expect(metrics).toEqual(mockCounts);
      expect(mockGetJobCounts).toHaveBeenCalledWith('waiting', 'active', 'delayed', 'failed');
    });

    it('returns null if getting job counts fails', async () => {
      mockGetJobCounts.mockRejectedValue(new Error('Redis Connection Error'));
      const dummyQueue = {
        getJobCounts: mockGetJobCounts,
      } as unknown as Queue;

      const metrics = await getBullMQQueueMetrics(dummyQueue);
      expect(metrics).toBeNull();
    });
  });

  describe('MonitorAlertCooldown', () => {
    it('allows initial alert and throttles subsequent triggers within cooldown window', () => {
      const cooldown = new MonitorAlertCooldown(1000); // 1 sec cooldown for test
      const key = 'test_alert_key';

      expect(cooldown.shouldFire(key)).toBe(true);
      expect(cooldown.shouldFire(key)).toBe(false);
    });

    it('allows firing again after clearing cooldown state', () => {
      const cooldown = new MonitorAlertCooldown(1000);
      const key = 'test_alert_key';

      expect(cooldown.shouldFire(key)).toBe(true);
      cooldown.clear();
      expect(cooldown.shouldFire(key)).toBe(true);
    });
  });

  describe('sendMonitorAlert', () => {
    it('dispatches JSON payload to MONITOR_WEBHOOK_URL and adds job to Queue', async () => {
      process.env.MONITOR_WEBHOOK_URL = 'https://n8n.internal/webhook/alert';

      const mockDispatcher: HttpDispatcher = {
        postJson: vi.fn().mockResolvedValue({ status: 200 })
      };

      const mockAdd = vi.fn().mockResolvedValue({});
      const mockQueue = { add: mockAdd } as unknown as Queue;

      const payload = {
        alertType: 'KAFKA_LAG_HIGH' as const,
        severity: 'WARNING' as const,
        message: 'High consumer lag on topic TELEMETRY_RECEIVED',
        metricDetails: { currentLag: 6000, threshold: 5000 },
        timestamp: '2026-08-21T12:00:00.000Z'
      };

      const result = await sendMonitorAlert(payload, mockDispatcher, mockQueue);

      expect(result.dispatchedWebhook).toBe(true);
      expect(result.enqueuedJob).toBe(true);
      expect(mockDispatcher.postJson).toHaveBeenCalledWith(
        'https://n8n.internal/webhook/alert',
        payload
      );
      expect(mockAdd).toHaveBeenCalledWith('monitor-alert', payload, { removeOnComplete: true });
    });

    it('formats Slack-compatible payload when SLACK_WEBHOOK_URL is set', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T000/B000/XXXX';

      const mockDispatcher: HttpDispatcher = {
        postJson: vi.fn().mockResolvedValue({ status: 200 })
      };

      const payload = {
        alertType: 'NOTIFICATION_QUEUE_BACKLOG' as const,
        severity: 'CRITICAL' as const,
        message: 'Notification Queue backlog reached 6000 waiting jobs',
        metricDetails: { queueName: 'notification-queue', waiting: 6000 },
        timestamp: '2026-08-21T12:00:00.000Z'
      };

      const result = await sendMonitorAlert(payload, mockDispatcher, null as unknown as Queue);

      expect(result.dispatchedWebhook).toBe(true);
      expect(mockDispatcher.postJson).toHaveBeenCalledWith(
        'https://hooks.slack.com/services/T000/B000/XXXX',
        expect.objectContaining({
          text: expect.stringContaining('🚨 *[MONITOR SYSTEM ALERT - CRITICAL]*'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              color: '#FF0000',
              title: 'NOTIFICATION_QUEUE_BACKLOG'
            })
          ])
        })
      );
    });
  });

  describe('performMonitorPollCycle (Unified Single Notification)', () => {
    it('dispatches EXACTLY ONE consolidated notification when multiple metrics breach threshold in a single tick', async () => {
      mockFetchTopicOffsets.mockResolvedValue([{ partition: 0, high: '6000', low: '0' }]);
      mockFetchOffsets.mockResolvedValue([
        { topic: 'TELEMETRY_RECEIVED', partitions: [{ partition: 0, offset: '0' }] }
      ]);
      mockGetJobCounts.mockResolvedValue({ waiting: 2000, active: 10, delayed: 0, failed: 0 });

      const mockDispatcher: HttpDispatcher = {
        postJson: vi.fn().mockResolvedValue({ status: 200 })
      };
      process.env.MONITOR_WEBHOOK_URL = 'https://webhook.site/alert';

      const cooldown = new MonitorAlertCooldown(100000);
      const mockQueue = {
        name: 'notification-queue',
        getJobCounts: mockGetJobCounts,
        add: vi.fn().mockResolvedValue({})
      } as unknown as Queue;

      const res = await performMonitorPollCycle(
        'grouping-service-group',
        'TELEMETRY_RECEIVED',
        5000,
        mockQueue,
        1000,
        cooldown,
        mockDispatcher
      );

      expect(res.breachesCount).toBe(2);
      // Verify exactly ONE HTTP webhook dispatch occurred
      expect(mockDispatcher.postJson).toHaveBeenCalledTimes(1);
      expect(mockDispatcher.postJson).toHaveBeenCalledWith(
        'https://webhook.site/alert',
        expect.objectContaining({
          alertType: 'SYSTEM_HEALTH_BREACH',
          severity: 'WARNING',
          breaches: expect.arrayContaining([
            expect.objectContaining({ alertType: 'KAFKA_LAG_HIGH' }),
            expect.objectContaining({ alertType: 'NOTIFICATION_QUEUE_BACKLOG' })
          ])
        })
      );
    });

    it('sends zero notifications when all metrics are healthy', async () => {
      mockFetchTopicOffsets.mockResolvedValue([{ partition: 0, high: '100', low: '0' }]);
      mockFetchOffsets.mockResolvedValue([
        { topic: 'TELEMETRY_RECEIVED', partitions: [{ partition: 0, offset: '90' }] }
      ]);
      mockGetJobCounts.mockResolvedValue({ waiting: 5, active: 1, delayed: 0, failed: 0 });

      const mockDispatcher: HttpDispatcher = {
        postJson: vi.fn().mockResolvedValue({ status: 200 })
      };
      process.env.MONITOR_WEBHOOK_URL = 'https://webhook.site/alert';

      const cooldown = new MonitorAlertCooldown(100000);
      const mockQueue = {
        name: 'notification-queue',
        getJobCounts: mockGetJobCounts,
        add: vi.fn().mockResolvedValue({})
      } as unknown as Queue;

      const res = await performMonitorPollCycle(
        'grouping-service-group',
        'TELEMETRY_RECEIVED',
        5000,
        mockQueue,
        1000,
        cooldown,
        mockDispatcher
      );

      expect(res.breachesCount).toBe(0);
      expect(mockDispatcher.postJson).not.toHaveBeenCalled();
    });
  });

  describe('checkAndAlertConsumerLag & checkAndAlertQueueMetrics', () => {
    it('fires alert when Kafka lag exceeds threshold and respects cooldown', async () => {
      mockFetchTopicOffsets.mockResolvedValue([{ partition: 0, high: '6000', low: '0' }]);
      mockFetchOffsets.mockResolvedValue([
        { topic: 'TELEMETRY_RECEIVED', partitions: [{ partition: 0, offset: '0' }] }
      ]);

      const mockDispatcher: HttpDispatcher = {
        postJson: vi.fn().mockResolvedValue({ status: 200 })
      };
      process.env.MONITOR_WEBHOOK_URL = 'https://webhook.site/alert';

      const cooldown = new MonitorAlertCooldown(100000);
      const mockQueue = { add: vi.fn().mockResolvedValue({}) } as unknown as Queue;

      // 1st check - should fire
      const lag1 = await checkAndAlertConsumerLag('grouping-service-group', 'TELEMETRY_RECEIVED', 5000, cooldown, mockDispatcher, mockQueue);
      expect(lag1).toBe(6000);
      expect(mockDispatcher.postJson).toHaveBeenCalledTimes(1);

      // 2nd check - should suppress due to cooldown
      const lag2 = await checkAndAlertConsumerLag('grouping-service-group', 'TELEMETRY_RECEIVED', 5000, cooldown, mockDispatcher, mockQueue);
      expect(lag2).toBe(6000);
      expect(mockDispatcher.postJson).toHaveBeenCalledTimes(1);
    });

    it('fires alert when Queue depth exceeds threshold', async () => {
      mockGetJobCounts.mockResolvedValue({ waiting: 2000, active: 10, delayed: 0, failed: 0 });

      const mockDispatcher: HttpDispatcher = {
        postJson: vi.fn().mockResolvedValue({ status: 200 })
      };
      process.env.MONITOR_WEBHOOK_URL = 'https://webhook.site/alert';

      const cooldown = new MonitorAlertCooldown(100000);
      const dummyQueue = {
        name: 'notification-queue',
        getJobCounts: mockGetJobCounts,
        add: vi.fn().mockResolvedValue({})
      } as unknown as Queue;

      const metrics = await checkAndAlertQueueMetrics(dummyQueue, 1000, cooldown, mockDispatcher);
      expect(metrics?.waiting).toBe(2000);
      expect(mockDispatcher.postJson).toHaveBeenCalledWith(
        'https://webhook.site/alert',
        expect.objectContaining({ alertType: 'NOTIFICATION_QUEUE_BACKLOG' })
      );
    });
  });
});


