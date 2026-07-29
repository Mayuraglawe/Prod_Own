import crypto from 'crypto';
import { IEventBus, EventTopic, BaseEvent, TelemetryProcessedPayload } from '@litetrace/events';

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
  recordOccurrence(event: {
    issueId: string;
    tenantId: string;
    projectId: string;
    timestamp: string;
    environment?: string;
  }): Promise<void>;
}

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

export interface OccurrenceEvent {
  issueId: string;
  tenantId: string;
  projectId: string;
  timestamp: string;
  environment?: string;
}

export class InMemoryClickHouseStore implements ClickHouseAnalyticsStore {
  public occurrences: OccurrenceEvent[] = [];
  public async recordOccurrence(event: OccurrenceEvent): Promise<void> {
    this.occurrences.push(event);
  }
}

export class GroupingService {
  constructor(
    private readonly eventBus: IEventBus,
    private readonly issueStore: IssueStore = new InMemoryIssueStore(),
    private readonly clickHouseStore: ClickHouseAnalyticsStore = new InMemoryClickHouseStore()
  ) {}

  public generateFingerprint(title: string, culprit?: string): string {
    const norm = `${title.trim()}:${(culprit || '').trim()}`;
    return crypto.createHash('sha256').update(norm).digest('hex').substring(0, 16);
  }

  public async handleTelemetryProcessed(event: BaseEvent<TelemetryProcessedPayload>): Promise<void> {
    const fingerprint = this.generateFingerprint(event.payload.message, event.payload.culprit);

    const { issueId, isNew, totalCount } = await this.issueStore.upsertIssue({
      tenantId: event.tenantId,
      projectId: event.projectId,
      fingerprint,
      title: event.payload.message,
      culprit: event.payload.culprit,
      level: event.payload.level,
    });

    await this.clickHouseStore.recordOccurrence({
      issueId,
      tenantId: event.tenantId,
      projectId: event.projectId,
      timestamp: event.timestamp,
      environment: event.payload.environment,
    });

    await this.eventBus.publish(
      EventTopic.ISSUE_GROUPED,
      {
        issueId,
        fingerprint,
        title: event.payload.message,
        culprit: event.payload.culprit,
        level: event.payload.level,
        isNew,
        occurrenceCount: totalCount,
        lastSeen: event.timestamp,
        eventId: event.payload.eventId,
      },
      {
        tenantId: event.tenantId,
        projectId: event.projectId,
      }
    );
  }
}
