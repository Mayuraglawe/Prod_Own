import { NextResponse } from 'next/server';
import { prisma } from '@litetrace/db';
import { requireSuperAdmin } from '../../../../lib/role-guard';
import { writeAuditLog } from '../../../../lib/audit-log';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

// Secret should ideally come from env, but we use a hardcoded fallback for local MVP.
const IMPERSONATION_SECRET = new TextEncoder().encode(process.env.IMPERSONATION_SECRET || 'litetrace-impersonation-super-secret-key-2024');

/**
 * POST /api/admin/impersonate
 *
 * Generates an impersonation cookie for a specific tenantId.
 * Body shape: { tenantId: string }
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function POST(req: Request) {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  try {
    const { tenantId } = await req.json();
    if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });

    // Validate tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const { auth } = await import('../../../../auth');
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const actor = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!actor) return NextResponse.json({ error: 'Actor not found' }, { status: 401 });

    // Generate short-lived JWT (e.g., 2 hours)
    const token = await new SignJWT({ tenantId, actorId: actor.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(IMPERSONATION_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('litetrace_impersonation_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7200, // 2 hours
    });

    await writeAuditLog({
      actorId: actor.id,
      action: 'tenant.impersonate_start',
      detail: `Started impersonating "${tenant.name}"`,
      tenantId,
      payload: { tenantName: tenant.name },
    });

    return NextResponse.json({ message: 'Impersonation started', tenantId }, { status: 200 });
  } catch (err) {
    console.error('[Admin Impersonate] POST error:', err);
    return NextResponse.json({ error: 'Failed to start impersonation' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/impersonate
 *
 * Clears the impersonation cookie.
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function DELETE() {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  try {
    const cookieStore = await cookies();
    cookieStore.delete('litetrace_impersonation_token');

    // Optional: Could decode the token first to write an audit log for 'tenant.impersonate_stop',
    // but the start log is usually sufficient.

    return NextResponse.json({ message: 'Impersonation stopped' }, { status: 200 });
  } catch (err) {
    console.error('[Admin Impersonate] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to stop impersonation' }, { status: 500 });
  }
}
