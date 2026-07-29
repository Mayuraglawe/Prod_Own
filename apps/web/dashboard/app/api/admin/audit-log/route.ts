import { NextResponse } from 'next/server';
import { prisma } from '@litetrace/db';
import { requireSuperAdmin } from '../../../../lib/role-guard';

/**
 * GET /api/admin/audit-log
 *
 * Returns the full platform-wide audit trail, newest first.
 * Optionally filter by tenantId, actorId, or action.
 *
 * Query params:
 *   ?tenantId=xxx   — filter by affected tenant
 *   ?actorId=xxx    — filter by who performed the action
 *   ?action=xxx     — filter by action type (e.g. "tenant.suspend")
 *   ?limit=50       — max rows (default 50, max 200)
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function GET(req: Request) {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') ?? undefined;
  const actorId  = searchParams.get('actorId')  ?? undefined;
  const action   = searchParams.get('action')   ?? undefined;
  const limit    = Math.min(Number(searchParams.get('limit') ?? 50), 200);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbClient = prisma as any;

    if (typeof dbClient.auditLog?.findMany !== 'function') {
      return NextResponse.json(
        { error: 'AuditLog model not yet migrated. Run the pending SQL migration first.' },
        { status: 503 },
      );
    }

    const logs = await dbClient.auditLog.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        ...(actorId  ? { actorId  } : {}),
        ...(action   ? { action   } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
        tenant: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ logs, count: logs.length }, { status: 200 });
  } catch (err) {
    console.error('[Admin Audit Log] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
