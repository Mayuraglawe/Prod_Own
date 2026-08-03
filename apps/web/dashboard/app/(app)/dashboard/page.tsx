import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { tenantsRepository } from '../../../lib/repositories/tenants';
import { prisma } from '@litetrace/db';
import crypto from 'crypto';

/**
 * Role-dispatch page for authenticated users.
 *
 * This page runs once after login to redirect a user to their correct
 * role-scoped dashboard (e.g. /admin/dashboard, /employee/dashboard).
 *
 * Fast path: Read role from the JWT token — zero DB queries for users
 * who already have a tenantId set in their session.
 *
 * Slow path (new users only): If the JWT has no tenantId, fall back to
 * a DB lookup to auto-create their workspace, then refresh the session.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const tokenUser = session.user as {
    email: string;
    role?: string;
    tenantId?: string | null;
    id?: string;
  };

  // --- Fast path: token already has role and tenantId ---
  if (tokenUser.tenantId && tokenUser.role) {
    const rawRole = tokenUser.role.toUpperCase().trim();
    if (rawRole === 'CANDIDATE') {
      redirect('/candidate/dashboard' as Route);
    } else if (rawRole === 'SUPER_ADMIN' || rawRole === 'SUPERADMIN') {
      redirect('/superadmin/dashboard' as Route);
    } else if (rawRole === 'ADMIN' || rawRole === 'OWNER') {
      redirect('/admin/dashboard' as Route);
    } else {
      redirect('/employee/dashboard' as Route);
    }
  }

  // --- Slow path: new user without a workspace (first login) ---
  // Only reached when the JWT token doesn't have a tenantId yet.
  const user = await tenantsRepository.getUserByEmail(tokenUser.email);

  if (!user) {
    redirect('/login');
  }

  if (user.role?.toUpperCase() === 'CANDIDATE') {
    redirect('/candidate/dashboard' as Route);
  }

  // Auto-create a workspace for users with no tenant (e.g. first-time Google login).
  if (!user.tenantId) {
    const name = 'My Workspace';
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { slug, name } });
      await tx.user.update({ where: { id: user.id }, data: { tenantId: tenant.id } });
      await tx.workspaceMember.create({
        data: { userId: user.id, tenantId: tenant.id, role: 'SUPER_ADMIN' },
      });

      const projectName = `${name} Main Project`;
      const externalId = `${slug}-main`;
      const randomHex = crypto.randomBytes(16).toString('hex');
      const plainApiKey = `lt_live_${randomHex}`;
      const apiKeyHash = crypto.createHash('sha256').update(plainApiKey).digest('hex');
      const apiKeyPrefix = plainApiKey.substring(0, 15);

      await tx.source.create({
        data: {
          tenantId: tenant.id,
          name: projectName,
          externalId,
          apiKeyHash,
          apiKeyPrefix,
        },
      });
    });

    // Redirect back to /dashboard — on this second visit, the DB will have
    // the tenantId and the redirect above will use it.
    redirect('/dashboard');
  }

  // Determine role from workspace membership (only for slow path).
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id, tenantId: user.tenantId },
  });

  const role = membership?.role || user.role;

  if (role) {
    const roleStr = role.toUpperCase();
    if (roleStr === 'CANDIDATE') {
      redirect('/candidate/dashboard' as Route);
    } else if (roleStr.includes('SUPER')) {
      redirect('/superadmin/dashboard' as Route);
    } else if (roleStr.includes('ADMIN')) {
      redirect('/admin/dashboard' as Route);
    } else {
      redirect('/employee/dashboard' as Route);
    }
  }

  // Default fallback
  redirect('/employee/dashboard' as Route);
}
