import { PrismaClient } from '@prisma/client';

/**
 * Global cache to prevent multiple instances of PrismaClient being created during hot-reloads in development.
 * This prevents PostgreSQL connection pool exhaustion (limit 20 reached).
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Exports a single, shared PrismaClient instance.
 * Resolves to the cached global instance if available, otherwise instantiates a new one.
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In non-production, cache the Prisma instance in globalThis to preserve connection across rebuilds
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

