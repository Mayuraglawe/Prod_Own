import { prisma } from '@litetrace/db';

/**
 * Repository for Source queries.
 * All queries are scoped to tenantId — no cross-tenant reads are possible.
 */
export const sourcesRepository = {
  /**
   * Returns all sources for a tenant.
   */
  async findByTenant(tenantId: string) {
    return prisma.source.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        externalId: true,
        apiKeyPrefix: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Finds a source by its hashed API key.
   * Used by the ingest route for API key authentication.
   */
  async findByApiKeyHash(hash: string) {
    return prisma.source.findUnique({
      where: { apiKeyHash: hash },
      select: { id: true, tenantId: true },
    });
  },
};
