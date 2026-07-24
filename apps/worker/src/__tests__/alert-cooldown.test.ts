import { describe, it, expect } from 'vitest';

/** Helper reflecting alert deduplication key calculation */
function getAlertDedupKey(issueId: string, channel: string, timestampMs = Date.now()): string {
  const hourBucket = Math.floor(timestampMs / (1000 * 60 * 60));
  return `dedup:alert:${issueId}:${channel}:${hourBucket}`;
}

describe('Alert Cooldown & Throttling', () => {
  it('generates identical deduplication key for multiple alerts within the same hour', () => {
    const issueId = 'issue_abc123';
    const channel = 'slack';

    const t1 = 1700000000000; // Time point A
    const t2 = t1 + 15 * 60 * 1000; // 15 mins later (same hour bucket)

    const key1 = getAlertDedupKey(issueId, channel, t1);
    const key2 = getAlertDedupKey(issueId, channel, t2);

    expect(key1).toBe(key2);
    expect(key1).toContain(`dedup:alert:${issueId}:${channel}:`);
  });

  it('generates separate deduplication keys when moving to the next hour bucket', () => {
    const issueId = 'issue_abc123';
    const channel = 'slack';

    const t1 = 1700000000000; // Base time
    const t2 = t1 + 65 * 60 * 1000; // 65 mins later (next hour bucket)

    const key1 = getAlertDedupKey(issueId, channel, t1);
    const key2 = getAlertDedupKey(issueId, channel, t2);

    expect(key1).not.toBe(key2);
  });

  it('differentiates keys between different channels', () => {
    const issueId = 'issue_abc123';
    const time = 1700000000000;

    const slackKey = getAlertDedupKey(issueId, 'slack', time);
    const webhookKey = getAlertDedupKey(issueId, 'n8n_webhook', time);

    expect(slackKey).not.toBe(webhookKey);
  });
});
