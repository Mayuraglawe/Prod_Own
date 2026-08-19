import { describe, it, expect, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// 1. Manually load root .env variables BEFORE importing prisma client
const envPath = path.resolve(__dirname, '../../../../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  }
}

describe('Prisma Database Integration Tests', () => {
  const testSlug = `integration-test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let tenantId: string | undefined;

  afterAll(async () => {
    // Strict cleanup: Delete the test tenant which cascades to users
    if (tenantId) {
      try {
        const { prisma } = await import('../index.js');
        await prisma.tenant.delete({
          where: { id: tenantId },
        });
      } catch (err) {
        console.error('Error cleaning up integration test tenant:', err);
      }
    }
  }, 10000); // 10s cleanup timeout

  it('can connect to the database and perform CRUD operations with cascading deletes', async () => {
    // Dynamically import prisma to ensure process.env.DATABASE_URL is set first
    const { prisma } = await import('../index.js');

    // 1. Create Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Integration Test Tenant',
        slug: testSlug,
        planTier: 'PRO',
      },
    });

    expect(tenant.id).toBeDefined();
    expect(tenant.slug).toBe(testSlug);
    tenantId = tenant.id;

    // 2. Create User linked to the Tenant
    const userEmail = `integration-user-${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'Integration Tester',
        tenantId: tenant.id,
        role: 'ADMIN',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.tenantId).toBe(tenant.id);

    // 3. Query the user and include the tenant relation
    const queriedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { tenant: true },
    });

    expect(queriedUser).not.toBeNull();
    expect(queriedUser?.tenant?.slug).toBe(testSlug);

    // 4. Verify cascade delete works when tenant is deleted
    await prisma.tenant.delete({
      where: { id: tenant.id },
    });
    // Set tenantId to undefined since we deleted it
    tenantId = undefined;

    // The user should no longer exist since they cascade delete
    const deletedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(deletedUser).toBeNull();
  }, 30000); // Increased timeout to 30s to allow cold-starting databases (e.g. Neon)
});
