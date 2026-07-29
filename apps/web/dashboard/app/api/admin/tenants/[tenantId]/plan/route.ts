import { NextResponse } from 'next/server';
import { prisma } from '@litetrace/db';
import { requireSuperAdmin, resolveCallerRole } from '../../../../../../lib/role-guard';
import { writeAuditLog } from '../../../../../../lib/audit-log';

type RouteContext = { params: Promise<{ tenantId: string }> };

/**
 * PATCH /api/admin/tenants/[tenantId]/plan
 *
 * Manual override for plan limits.
 * Body shape:
 *   { planTier?: string, customEventQuota?: number | null, customRetentionDays?: number | null }
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function PATCH(req: Request, { params }: RouteContext) {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  const { tenantId } = await params;

  const caller = await resolveCallerRole(tenantId).catch(() => null)
    ?? await (async () => {
      const { auth } = await import('../../../../../../auth');
      const session = await auth();
      if (!session?.user?.email) return null;
      const u = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      return u ? { userId: u.id, role: 'SUPER_ADMIN' as const } : null;
    })();

  if (!caller) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenant = await (prisma.tenant as any).findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, planTier: true, customEventQuota: true, customRetentionDays: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (body.planTier !== undefined) updateData.planTier = body.planTier;
    if (body.customEventQuota !== undefined) updateData.customEventQuota = body.customEventQuota;
    if (body.customRetentionDays !== undefined) updateData.customRetentionDays = body.customRetentionDays;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (prisma.tenant as any).update({
      where: { id: tenantId },
      data: updateData,
    });

    await writeAuditLog({
      actorId: caller.userId,
      action: 'tenant.plan_override',
      detail: `Plan overridden for "${tenant.name}"`,
      tenantId,
      payload: { previous: tenant, new: updateData },
    });

    return NextResponse.json({ tenant: updated }, { status: 200 });
  } catch (err) {
    console.error('[Admin Tenants Plan] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}
