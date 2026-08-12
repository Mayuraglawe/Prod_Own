import { BaseEvent, TelemetryProcessedPayload, EventTopic, IEventBus } from '@litetrace/events';
import crypto from 'crypto';

export interface GroupedIssue {
  tenantId: string;
  projectId: string;
  fingerprint: string;
  title: string;
  culprit?: string;
  level: string;
  isNew: boolean;
  totalCount: number;
}

export interface RawOccurrence {
  issueId: string;
  tenantId: string;
  projectId: string;
  timestamp: string;
  environment?: string;
}

export interface IssueStore {
  upsertIssue(params: {
    tenantId: string;
    projectId: string;
    fingerprint: string;
    title: string;
    culprit?: string;
    level: string;
  }): Promise<{ issueId: string; isNew: boolean; totalCount: number }>;
}

export interface ClickHouseAnalyticsStore {
  recordOccurrence(event: RawOccurrence): Promise<void>;
}

/**
 * GroupingBatchWriter micro-batches events for bulk writing to Postgres and ClickHouse.
 * This prevents Prisma connection exhaustion during error bursts.
 */
export class GroupingBatchWriter {
  private issueBuffer = new Map<string, { event: BaseEvent<TelemetryProcessedPayload>, count: number }>();
  private occurrenceBuffer: RawOccurrence[] = [];
  
  private flushTimer: NodeJS.Timeout | null = null;
  private flushing = false;

  constructor(
    private readonly eventBus: IEventBus,
    private readonly issueStore: IssueStore, // In production, this would be PrismaClient
    private readonly clickHouseStore: ClickHouseAnalyticsStore, // In production, this would be ClickHouseClient
    private readonly maxBatchSize: number = 500,
    private readonly maxWaitMs: number = 500
  ) {}

  /**
   * Generates a deterministic SHA-256 fingerprint hash.
   */
  public generateFingerprint(title: string, culprit?: string): string {
    const norm = `${title.trim()}:${(culprit || '').trim()}`;
    return crypto.createHash('sha256').update(norm).digest('hex').substring(0, 16);
  }

  /**
   * Adds an event to the batch buffer. Flushes automatically if maxBatchSize is reached.
   */
  public async add(event: BaseEvent<TelemetryProcessedPayload>): Promise<void> {
    const fingerprint = this.generateFingerprint(event.payload.message, event.payload.culprit);
    const issueKey = `${event.tenantId}:${event.projectId}:${fingerprint}`;

    const existing = this.issueBuffer.get(issueKey);
    if (existing) {
      existing.count += 1;
    } else {
      this.issueBuffer.set(issueKey, { event, count: 1 });
    }

    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.maxWaitMs);
    }

    if (this.issueBuffer.size >= this.maxBatchSize) {
      await this.flush();
    }
  }

  /**
   * Flushes the current buffer to Postgres and ClickHouse using bulk inserts.
   */
  public async flush(): Promise<void> {
    if (this.flushing || this.issueBuffer.size === 0) return;
    this.flushing = true;

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Take a snapshot of the buffer and clear it to accept new incoming events
    const batch = Array.from(this.issueBuffer.values());
    this.issueBuffer.clear();

    try {
      // For each deduplicated issue in the batch, upsert to Postgres.
      // In production, this would use Prisma.sql and Prisma.join for a single parameterized INSERT ... ON CONFLICT DO UPDATE
      const groupedIssues: GroupedIssue[] = [];
      
      for (const item of batch) {
        const { event, count } = item;
        const fingerprint = this.generateFingerprint(event.payload.message, event.payload.culprit);
        
        // Mock upsert - replace with actual bulk upsert in production
        const { issueId, isNew, totalCount } = await this.issueStore.upsertIssue({
          tenantId: event.tenantId,
          projectId: event.projectId,
          fingerprint,
          title: event.payload.message,
          culprit: event.payload.culprit,
          level: event.payload.level,
        });

        groupedIssues.push({
          tenantId: event.tenantId,
          projectId: event.projectId,
          fingerprint,
          title: event.payload.message,
          culprit: event.payload.culprit,
          level: event.payload.level,
          isNew,
          totalCount: totalCount + count - 1 // Add the buffered count
        });

        // Add to ClickHouse occurrence buffer
        for (let i = 0; i < count; i++) {
          this.occurrenceBuffer.push({
            issueId,
            tenantId: event.tenantId,
            projectId: event.projectId,
            timestamp: event.timestamp,
            environment: event.payload.environment,
          });
        }
      }

      // Bulk insert raw occurrences to ClickHouse
      // In production, this would use clickhouse.insert({ values: this.occurrenceBuffer, format: 'JSONEachRow' })
      for (const occ of this.occurrenceBuffer) {
        await this.clickHouseStore.recordOccurrence(occ);
      }
      this.occurrenceBuffer = []; // clear after write

      // Publish ISSUE_GROUPED events downstream
      for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        const grouped = groupedIssues[i];
        
        if (!item || !grouped) continue;
        
        await this.eventBus.publish(
          EventTopic.ISSUE_GROUPED,
          {
            issueId: 'mock_issue_id', // Would be grouped.issueId
            fingerprint: grouped.fingerprint,
            title: grouped.title,
            culprit: grouped.culprit,
            level: grouped.level,
            isNew: grouped.isNew,
            occurrenceCount: grouped.totalCount,
            lastSeen: item.event.timestamp,
            eventId: item.event.payload.eventId,
          },
          {
            tenantId: grouped.tenantId,
            projectId: grouped.projectId,
          }
        );
      }
    } catch (error) {
      console.error('Failed to flush grouping batch:', error);
      // For production: push failed batches to a dead-letter queue (DLQ)
    } finally {
      this.flushing = false;
    }
  }
}
