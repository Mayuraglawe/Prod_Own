import { NextResponse } from 'next/server';
import { auth } from '../auth';
import { prisma } from '@litetrace/db';
import { authUserService } from '@litetrace/core';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

/**
 * Normalise any role string stored in the DB to a canonical UserRole.
 */
export function normaliseRole(raw: string | null | undefined): UserRole {
  const upper = String(raw || '').toUpperCase().trim();
  if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN' || upper === 'OWNER') return 'SUPER_ADMIN';
  if (upper === 'ADMIN') return 'ADMIN';
  return 'EMPLOYEE';
}

/**
 * Resolves the role of the currently authenticated user within a given tenant.
 *
 * Lookup order:
 *   1. WorkspaceMember row (per-workspace RBAC join table)
 *   2. User.role column (platform-level fallback for legacy rows)
 *
 * Returns null if the session is missing or the user does not belong to the tenant.
 */
export async function resolveCallerRole(
  tenantId: string,
): Promise<{ userId: string; role: UserRole } | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await authUserService.getCurrentUser(session.user.email);
  if (!user) return null;

  // 1. Per-workspace membership role takes precedence
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbClient = prisma as any;
  if (typeof dbClient.workspaceMember?.findUnique === 'function') {
    const membership = await dbClient.workspaceMember.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId } },
      select: { role: true },
    });
    if (membership) {
      return { userId: user.id, role: normaliseRole(membership.role) };
    }
  }

  // 2. Fallback: User.role column (platform-wide)
  const role = normaliseRole(user.role);

  // Only allow if the user is attached to this tenant
  if (user.tenantId !== tenantId && role !== 'SUPER_ADMIN') return null;

  return { userId: user.id, role };
}

/**
 * Requires the caller to hold at least the specified minimum role inside a tenant.
 * Returns a 401/403 NextResponse on failure, or null on success (caller may proceed).
 *
 * Usage:
 *   const guard = await requireRole(tenantId, 'ADMIN');
 *   if (guard) return guard;
 */
export async function requireRole(
  tenantId: string,
  minimumRole: UserRole,
): Promise<{ response: NextResponse; userId?: string } | null> {
  const caller = await resolveCallerRole(tenantId);

  if (!caller) {
    return {
      response: NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }),
    };
  }

  const hierarchy: Record<UserRole, number> = {
    EMPLOYEE: 0,
    ADMIN: 1,
    SUPER_ADMIN: 2,
  };

  if (hierarchy[caller.role] < hierarchy[minimumRole]) {
    return {
      response: NextResponse.json(
        {
          error: 'Forbidden',
          detail: `This action requires at least ${minimumRole}. Your role: ${caller.role}`,
        },
        { status: 403 },
      ),
    };
  }

  return null; // Access granted
}

/**
 * Convenience: Guard that requires SUPER_ADMIN, ignoring tenant boundaries
 * (used for platform-level admin routes).
 *
 * Returns null (granted) or a NextResponse (denied).
 */
export async function requireSuperAdmin(): Promise<{
  response: NextResponse;
  userId?: string;
} | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return { response: NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }) };
  }

  const user = await authUserService.getCurrentUser(session.user.email);

  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }) };
  }

  const isSuperAdmin = await authUserService.isSuperAdmin(user);
  if (isSuperAdmin) return null;

  return {
    response: NextResponse.json(
      { error: 'Forbidden', detail: 'SUPER_ADMIN role required for this action' },
      { status: 403 },
    ),
  };
}
