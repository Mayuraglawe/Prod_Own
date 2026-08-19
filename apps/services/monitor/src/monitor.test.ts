import { describe, it, expect, vi, beforeEach } from 'vitest';

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
import { getKafkaConsumerLag, getBullMQQueueMetrics } from './index';

describe('Monitor Sidecar Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      } as any;

      const metrics = await getBullMQQueueMetrics(dummyQueue);
      expect(metrics).toEqual(mockCounts);
      expect(mockGetJobCounts).toHaveBeenCalledWith('waiting', 'active', 'delayed', 'failed');
    });

    it('returns null if getting job counts fails', async () => {
      mockGetJobCounts.mockRejectedValue(new Error('Redis Connection Error'));
      const dummyQueue = {
        getJobCounts: mockGetJobCounts,
      } as any;

      const metrics = await getBullMQQueueMetrics(dummyQueue);
      expect(metrics).toBeNull();
    });
  });
});
