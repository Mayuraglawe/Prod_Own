export interface IssueReadRepository {
  listIssues(tenantId: string, projectId: string, search?: string): Promise<Array<{
    issueId: string;
    title: string;
    level: string;
    occurrenceCount: number;
    lastSeen: string;
  }>>;

  getMetricsTimeSeries(tenantId: string, projectId: string, range: '24h' | '7d' | '30d'): Promise<Array<{ timestamp: string; count: number }>>;
}

export class InMemoryIssueReadRepository implements IssueReadRepository {
  public async listIssues(tenantId: string, projectId: string, search?: string) {
    void tenantId;
    void projectId;
    const mockData = [
      {
        issueId: 'iss_101',
        title: 'TypeError: Cannot read properties of null (reading "map")',
        level: 'error',
        occurrenceCount: 142,
        lastSeen: new Date().toISOString(),
      },
      {
        issueId: 'iss_102',
        title: 'Database connection pool exhausted',
        level: 'fatal',
        occurrenceCount: 18,
        lastSeen: new Date().toISOString(),
      },
    ];

    if (!search) return mockData;
    return mockData.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));
  }

  public async getMetricsTimeSeries(tenantId: string, projectId: string, range: '24h' | '7d' | '30d') {
    void tenantId;
    void projectId;
    void range;
    return [
      { timestamp: '2026-07-24T12:00:00Z', count: 45 },
      { timestamp: '2026-07-24T13:00:00Z', count: 89 },
      { timestamp: '2026-07-24T14:00:00Z', count: 120 },
      { timestamp: '2026-07-24T15:00:00Z', count: 32 },
    ];
  }
}

export class QueryService {
  constructor(private readonly readRepo: IssueReadRepository = new InMemoryIssueReadRepository()) {}

  public async getDashboardSummary(tenantId: string, projectId: string, search?: string) {
    const issues = await this.readRepo.listIssues(tenantId, projectId, search);
    const metrics = await this.readRepo.getMetricsTimeSeries(tenantId, projectId, '24h');

    const totalOccurrences = issues.reduce((acc, curr) => acc + curr.occurrenceCount, 0);

    return {
      tenantId,
      projectId,
      totalIssues: issues.length,
      totalOccurrences,
      issues,
      timeSeries24h: metrics,
    };
  }
}
