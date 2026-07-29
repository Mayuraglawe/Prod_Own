import { NextResponse } from 'next/server';
import { prisma } from '@litetrace/db';
import { requireSuperAdmin } from '../../../../lib/role-guard';

/**
 * GET /api/admin/platform
 *
 * Returns a global health summary of the entire platform for the Super Admin
 * control panel. Data is aggregated across all tenants.
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  try {
    const [
      totalTenants,
      totalUsers,
      totalSources,
      totalOpenIssues,
      totalEvents,
      recentIssues,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.source.count(),
      prisma.issue.count({ where: { status: 'OPEN' } }),
      prisma.event.count(),
      prisma.issue.findMany({
        where: { status: 'OPEN' },
        orderBy: { lastSeen: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          eventCount: true,
          lastSeen: true,
          tenantId: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        summary: {
          totalTenants,
          totalUsers,
          totalSources,
          totalOpenIssues,
          totalEvents,
        },
        recentIssues,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[Admin Platform] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch platform summary' }, { status: 500 });
  }
}
