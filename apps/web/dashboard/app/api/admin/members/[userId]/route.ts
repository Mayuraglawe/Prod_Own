import { NextResponse } from 'next/server';
import { prisma } from '@litetrace/db';
import { requireSuperAdmin, normaliseRole, type UserRole } from '../../../../../lib/role-guard';
import { writeAuditLog } from '../../../../../lib/audit-log';

type RouteContext = { params: Promise<{ userId: string }> };

async function getActorId(): Promise<string | null> {
  const { auth } = await import('../../../../../auth');
  const session = await auth();
  if (!session?.user?.email) return null;
  const u = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return u?.id ?? null;
}

/**
 * GET /api/admin/members/[userId]
 *
 * Fetch all workspace memberships for a given user.
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function GET(_req: Request, { params }: RouteContext) {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  const { userId } = await params;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbClient = prisma as any;
    const memberships = typeof dbClient.workspaceMember?.findMany === 'function'
      ? await dbClient.workspaceMember.findMany({
          where: { userId },
          include: { tenant: { select: { id: true, name: true, slug: true } } },
          orderBy: { createdAt: 'asc' },
        })
      : [];

    return NextResponse.json({ userId, memberships }, { status: 200 });
  } catch (err) {
    console.error('[Admin Members] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/members/[userId]
 *
 * Elevate or demote a user's role within a specific workspace.
 * Body: { tenantId: string; role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' }
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function PATCH(req: Request, { params }: RouteContext) {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  const { userId } = await params;
  const actorId = await getActorId();

  try {
    const body = await req.json();
    const tenantId = String(body.tenantId || '').trim();
    const newRole  = normaliseRole(String(body.role || 'ADMIN')) as UserRole;
    const newStatus = body.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING';

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbClient = prisma as any;
    if (typeof dbClient.workspaceMember?.upsert !== 'function') {
      return NextResponse.json({ error: 'WorkspaceMember model not available' }, { status: 500 });
    }

    // Capture old role for audit log
    const existing = await dbClient.workspaceMember.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
      select: { role: true },
    });
    const previousRole = existing ? normaliseRole(existing.role) : 'ADMIN';

    const membership = await dbClient.workspaceMember.upsert({
      where: { userId_tenantId: { userId, tenantId } },
      update: { role: newRole, status: newStatus },
      create: { userId, tenantId, role: newRole, status: newStatus },
      select: { id: true, userId: true, tenantId: true, role: true, status: true },
    });

    if (actorId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });
      await writeAuditLog({
        actorId,
        action: 'member.role_changed',
        detail: `Role of ${targetUser?.email ?? userId} changed from ${previousRole} → ${newRole} in tenant ${tenantId}`,
        tenantId,
        payload: { userId, previousRole, newRole },
      });
    }

    return NextResponse.json({ membership }, { status: 200 });
  } catch (err) {
    console.error('[Admin Members] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/members/[userId]
 *
 * Remove a user from a specific workspace entirely.
 * Body: { tenantId: string }
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function DELETE(req: Request, { params }: RouteContext) {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  const { userId } = await params;
  const actorId = await getActorId();

  try {
    const body = await req.json();
    const tenantId = String(body.tenantId || '').trim();

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbClient = prisma as any;
    if (typeof dbClient.workspaceMember?.delete !== 'function') {
      return NextResponse.json({ error: 'WorkspaceMember model not available' }, { status: 500 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    await dbClient.workspaceMember.delete({
      where: { userId_tenantId: { userId, tenantId } },
    });

    if (actorId) {
      await writeAuditLog({
        actorId,
        action: 'member.removed',
        detail: `User ${targetUser?.email ?? userId} removed from workspace ${tenantId}`,
        tenantId,
        payload: { userId, userEmail: targetUser?.email },
      });
    }

    return NextResponse.json(
      { message: `User ${userId} removed from workspace ${tenantId}.` },
      { status: 200 },
    );
  } catch (err) {
    console.error('[Admin Members] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
