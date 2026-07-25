import { NextResponse } from 'next/server';
import { prisma } from '@litetrace/db';
import { requireSuperAdmin, resolveCallerRole } from '../../../../../lib/role-guard';
import { writeAuditLog } from '../../../../../lib/audit-log';

type RouteContext = { params: Promise<{ tenantId: string }> };

/**
 * PATCH /api/admin/tenants/[tenantId]
 *
 * Multi-purpose update route for Super Admin tenant operations.
 * Body shape:
 *   { name?: string }                           → rename the tenant
 *   { suspended: true, reason?: string }        → suspend the tenant
 *   { suspended: false }                        → unsuspend the tenant
 *
 * Every operation is recorded in the AuditLog.
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function PATCH(req: Request, { params }: RouteContext) {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  const { tenantId } = await params;

  // Resolve caller for audit log
  const caller = await resolveCallerRole(tenantId).catch(() => null)
    ?? await (async () => {
      // resolveCallerRole may return null for SUPER_ADMIN who has no membership
      // in the target tenant. Fallback to finding them via session.
      const { auth } = await import('../../../../../auth');
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
      select: { id: true, name: true, suspended: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // ── Suspend / Unsuspend ──────────────────────────────────────────────────
    if (typeof body.suspended === 'boolean') {
      const isSuspending = body.suspended;
      const reason = typeof body.reason === 'string' ? body.reason.trim() : null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await (prisma.tenant as any).update({
        where: { id: tenantId },
        data: {
          suspended: isSuspending,
          suspendedAt: isSuspending ? new Date() : null,
          suspendedReason: isSuspending ? (reason ?? null) : null,
        },
        select: {
          id: true, name: true, slug: true, suspended: true,
          suspendedAt: true, suspendedReason: true,
        },
      });

      await writeAuditLog({
        actorId: caller.userId,
        action: isSuspending ? 'tenant.suspend' : 'tenant.unsuspend',
        detail: isSuspending
          ? `Tenant "${tenant.name}" suspended${reason ? `: ${reason}` : ''}`
          : `Tenant "${tenant.name}" unsuspended`,
        tenantId,
        payload: { reason: reason ?? undefined, tenantName: tenant.name },
      });

      return NextResponse.json({ tenant: updated }, { status: 200 });
    }

    // ── Rename ───────────────────────────────────────────────────────────────
    if (typeof body.name === 'string' && body.name.trim()) {
      const newName = body.name.trim();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await (prisma.tenant as any).update({
        where: { id: tenantId },
        data: { name: newName },
        select: { id: true, name: true, slug: true, updatedAt: true },
      });

      await writeAuditLog({
        actorId: caller.userId,
        action: 'tenant.updated',
        detail: `Tenant renamed from "${tenant.name}" to "${newName}"`,
        tenantId,
        payload: { previousName: tenant.name, newName },
      });

      return NextResponse.json({ tenant: updated }, { status: 200 });
    }

    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  } catch (err) {
    console.error('[Admin Tenants] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/tenants/[tenantId]
 *
 * Hard-deletes a tenant and all its cascade data (sources, issues, events,
 * members, alert configs, payment events). This is irreversible.
 * The AuditLog entry is written BEFORE deletion so the record survives.
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function DELETE(req: Request, { params }: RouteContext) {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  const { tenantId } = await params;

  const { auth } = await import('../../../../../auth');
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }
  const actor = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!actor) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Write audit log BEFORE deleting (AuditLog.tenantId will become NULL on cascade)
    await writeAuditLog({
      actorId: actor.id,
      action: 'tenant.delete',
      detail: `Tenant "${tenant.name}" (${tenantId}) permanently deleted`,
      tenantId,
      payload: { tenantName: tenant.name, tenantId },
    });

    await prisma.tenant.delete({ where: { id: tenantId } });

    return NextResponse.json(
      { message: `Tenant "${tenant.name}" permanently deleted.` },
      { status: 200 },
    );
  } catch (err) {
    console.error('[Admin Tenants] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}
