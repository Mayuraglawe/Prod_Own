import { prisma } from '@prod-own/db';

/**
 * Explicit interface for tenantsRepository return shapes.
 * Avoids TS2742 "inferred type cannot be named" errors caused by
 * Prisma's generated client types traversing pnpm workspace symlinks.
 */
export interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: string;
  tenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository for Tenant and User queries used across the app shell.
 */
export const tenantsRepository: {
  getUserByEmail(email: string): Promise<UserRow | null>;
  findBySlug(slug: string): Promise<unknown>;
  create(data: { name: string; slug: string }): Promise<unknown>;
  assignUserToTenant(userId: string, tenantId: string): Promise<unknown>;
} = {
  /**
   * Finds a user by email. Returns null if not found.
   */
  async getUserByEmail(email: string): Promise<UserRow | null> {
    return prisma.user.findUnique({ where: { email } }) as Promise<UserRow | null>;
  },

  /**
   * Finds a tenant by its URL slug. Returns null if not found.
   */
  async findBySlug(slug: string): Promise<unknown> {
    return prisma.tenant.findUnique({ where: { slug } });
  },

  /**
   * Creates a new tenant.
   */
  async create(data: { name: string; slug: string }): Promise<unknown> {
    return prisma.tenant.create({ data });
  },

  /**
   * Assigns a user to a tenant.
   */
  async assignUserToTenant(userId: string, tenantId: string): Promise<unknown> {
    return prisma.user.update({
      where: { id: userId },
      data: { tenantId },
    });
  },
};
