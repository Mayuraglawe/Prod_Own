import { IEventBus, EventTopic, BaseEvent, IssueGroupedPayload } from '@litetrace/events';

export interface CooldownStore {
  isCoolingDown(issueId: string, cooldownSeconds: number): boolean;
  setCooldown(issueId: string): void;
}

export class InMemoryCooldownStore implements CooldownStore {
  private cooldowns = new Map<string, number>();

  public isCoolingDown(issueId: string, cooldownSeconds: number): boolean {
    const lastAlertTime = this.cooldowns.get(issueId);
    if (!lastAlertTime) return false;
    return Date.now() - lastAlertTime < cooldownSeconds * 1000;
  }

  public setCooldown(issueId: string): void {
    this.cooldowns.set(issueId, Date.now());
  }
}

export class AlertingService {
  constructor(
    private readonly eventBus: IEventBus,
    private readonly cooldownStore: CooldownStore = new InMemoryCooldownStore(),
    private readonly cooldownSeconds = 300 // 5 min cooldown window
  ) {}

  public async handleIssueGrouped(event: BaseEvent<IssueGroupedPayload>): Promise<void> {
    const { issueId, isNew, occurrenceCount, title } = event.payload;

    // Condition: Alert if new issue OR if occurrence burst crosses threshold (e.g. 5, 10, 50, 100)
    const isBurstThreshold = occurrenceCount > 1 && occurrenceCount % 5 === 0;
    const shouldAlert = isNew || isBurstThreshold;

    if (!shouldAlert) {
      return;
    }

    // Check Redis cooldown state to prevent alert spamming
    if (this.cooldownStore.isCoolingDown(issueId, this.cooldownSeconds)) {
      return;
    }

    this.cooldownStore.setCooldown(issueId);

    await this.eventBus.publish(
      EventTopic.ALERT_TRIGGERED,
      {
        alertId: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ruleName: isNew ? 'New Error Detected' : 'Error Burst Storm',
        issueId,
        projectKey: event.projectId,
        issueTitle: title,
        occurrenceBurstCount: occurrenceCount,
        channels: ['slack', 'webhook'],
        message: `🚨 [${isNew ? 'NEW ERROR' : 'BURST ALERT'}] ${title} (Occurrences: ${occurrenceCount})`,
      },
      {
        tenantId: event.tenantId,
        projectId: event.projectId,
      }
    );
  }
}
