import { NextResponse } from 'next/server';
import { prisma } from '@litetrace/db';
import { requireSuperAdmin } from '../../../../lib/role-guard';

/**
 * GET /api/admin/tenants
 *
 * Returns all tenants on the platform including their suspension status.
 * Data is aggregated across all tenants — bypasses per-tenant RLS.
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenants = await (prisma.tenant as any).findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        planTier: true,
        customEventQuota: true,
        customRetentionDays: true,
        suspended: true,
        suspendedAt: true,
        suspendedReason: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sources: true,
            issues: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(({ members: true }) as any),
          },
        },
      },
    });

    return NextResponse.json({ tenants }, { status: 200 });
  } catch (err) {
    console.error('[Admin Tenants] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}
