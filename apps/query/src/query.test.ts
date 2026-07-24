import { describe, it, expect } from 'vitest';
import { QueryService } from './index.js';

describe('QueryService', () => {
  it('returns CQRS dashboard summary with issue counts and time-series metrics', async () => {
    const service = new QueryService();
    const summary = await service.getDashboardSummary('tenant-1', 'proj-1');

    expect(summary.totalIssues).toBe(2);
    expect(summary.totalOccurrences).toBe(160);
    expect(summary.timeSeries24h.length).toBe(4);
  });

  it('filters issues based on search query', async () => {
    const service = new QueryService();
    const summary = await service.getDashboardSummary('tenant-1', 'proj-1', 'Database');

    expect(summary.totalIssues).toBe(1);
    expect(summary.issues[0]!.issueId).toBe('iss_102');
  });
});
