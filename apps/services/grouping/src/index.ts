import crypto from 'crypto';
import { IEventBus, BaseEvent, TelemetryProcessedPayload } from '@litetrace/events';
import { GroupingBatchWriter, IssueStore, ClickHouseAnalyticsStore, RawOccurrence } from './groupingBatchWriter';

export class InMemoryIssueStore implements IssueStore {
  private issues = new Map<string, { issueId: string; count: number }>();

  public async upsertIssue(params: {
    tenantId: string;
    projectId: string;
    fingerprint: string;
    title: string;
    culprit?: string;
    level: string;
  }): Promise<{ issueId: string; isNew: boolean; totalCount: number }> {
    const key = `${params.tenantId}:${params.projectId}:${params.fingerprint}`;
    const existing = this.issues.get(key);

    if (existing) {
      existing.count += 1;
      return { issueId: existing.issueId, isNew: false, totalCount: existing.count };
    }

    const issueId = `iss_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.issues.set(key, { issueId, count: 1 });
    return { issueId, isNew: true, totalCount: 1 };
  }
}

export class InMemoryClickHouseStore implements ClickHouseAnalyticsStore {
  public occurrences: RawOccurrence[] = [];
  public async recordOccurrence(event: RawOccurrence): Promise<void> {
    this.occurrences.push(event);
  }
}

/**
 * The GroupingService is the core deduplication engine of LiteTrace.
 * 
 * Architecture Role:
 * It consumes processed telemetry events from the EventBus, applies a fingerprinting 
 * algorithm to identify identical issues, and upserts them into the Issue Store (Postgres). 
 * This prevents 10,000 identical raw errors from creating 10,000 separate issues on the dashboard.
 */
export class GroupingService {
  private batchWriter: GroupingBatchWriter;

  constructor(
    private readonly eventBus: IEventBus,
    private readonly issueStore: IssueStore = new InMemoryIssueStore(),
    private readonly clickHouseStore: ClickHouseAnalyticsStore = new InMemoryClickHouseStore()
  ) {
    this.batchWriter = new GroupingBatchWriter(this.eventBus, this.issueStore, this.clickHouseStore);
    
    // Ensure we flush on shutdown
    process.on('SIGTERM', () => this.batchWriter.flush());
    process.on('SIGINT', () => this.batchWriter.flush());
  }

  /**
   * Generates a deterministic SHA-256 fingerprint hash used to group identical errors.
   * 
   * @param title - The error message or title.
   * @param culprit - The module or function where the error originated.
   * @returns A 16-character hexadecimal hash representing the fingerprint.
   */
  public generateFingerprint(title: string, culprit?: string): string {
    const norm = `${title.trim()}:${(culprit || '').trim()}`;
    return crypto.createHash('sha256').update(norm).digest('hex').substring(0, 16);
  }

  /**
   * Handles an incoming parsed telemetry event by fingerprinting it, recording the occurrence,
   * and emitting an ISSUE_GROUPED event for downstream services (like alerting) to act upon.
   */
  public async handleTelemetryProcessed(event: BaseEvent<TelemetryProcessedPayload>): Promise<void> {
    // Add to micro-batching buffer instead of sequential db writes
    await this.batchWriter.add(event);
  }
}
