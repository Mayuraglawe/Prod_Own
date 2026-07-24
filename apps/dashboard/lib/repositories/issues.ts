import { prisma } from '@litetrace/db';

export interface IssueRow {
  id: string;
  title: string | null;
  status: 'OPEN' | 'RESOLVED' | 'IGNORED';
  eventCount: number;
  lastSeen: Date;
  firstSeen: Date;
  fingerprint: string;
  sourceId: string;
}

/**
 * Repository for Issue queries.
 * All queries are scoped to tenantId — no cross-tenant reads are possible.
 *
 * Explicit return types on every method prevent TS2742 errors caused by
 * Prisma's generated client types traversing pnpm symlinks.
 */
export const issuesRepository: {
  findByTenant(tenantId: string): Promise<IssueRow[]>;
  findById(id: string): Promise<unknown>;
  updateStatus(id: string, status: 'OPEN' | 'RESOLVED' | 'IGNORED'): Promise<unknown>;
} = {
  /**
   * Returns all issues for a tenant ordered by most recently seen.
   */
  async findByTenant(tenantId: string): Promise<IssueRow[]> {
    return prisma.issue.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        status: true,
        eventCount: true,
        lastSeen: true,
        firstSeen: true,
        fingerprint: true,
        sourceId: true,
      },
      orderBy: { lastSeen: 'desc' },
    }) as Promise<IssueRow[]>;
  },

  /**
   * Returns a single issue with its source and latest events.
   * Returns null if the issue does not exist.
   */
  async findById(id: string): Promise<unknown> {
    return prisma.issue.findUnique({
      where: { id },
      include: {
        source: true,
        events: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  },

  /**
   * Updates the status of an issue.
   */
  async updateStatus(id: string, status: 'OPEN' | 'RESOLVED' | 'IGNORED'): Promise<unknown> {
    return prisma.issue.update({
      where: { id },
      data: { status },
    });
  },
};
