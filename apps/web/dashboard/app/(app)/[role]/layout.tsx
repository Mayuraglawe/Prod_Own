import { redirect } from 'next/navigation';
import { auth } from '../../../auth';

/**
 * Role-scoped layout guard.
 *
 * Reads role and tenantId directly from the JWT session token — which is
 * already populated by auth.config.ts on login — so we make ZERO database
 * calls here. This prevents Prisma connection-pool exhaustion (P2024) that
 * occurred when this layout queried the DB on every page load in addition
 * to the (app)/layout.tsx queries.
 *
 * The middleware (middleware.ts) handles the coarse-grained unauthenticated
 * redirect. This layout does the fine-grained role-isolation guard.
 */
export default async function RoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const session = await auth();

  // 1. Enforce Authentication (middleware is the first line, this is belt-and-suspenders)
  if (!session?.user?.email) {
    redirect('/login');
  }

  // 2. Resolve actual role from JWT token (zero DB queries)
  const tokenUser = session.user as { role?: string; tenantId?: string | null };
  const rawRole = tokenUser.role?.toUpperCase().trim() ?? '';

  let actualRole = 'employee';
  if (rawRole === 'CANDIDATE') {
    actualRole = 'candidate';
  } else if (rawRole === 'SUPER_ADMIN' || rawRole === 'SUPERADMIN') {
    actualRole = 'superadmin';
  } else if (rawRole === 'ADMIN' || rawRole === 'OWNER') {
    actualRole = 'admin';
  }

  // 3. Role isolation: prevent a user accessing another role's pages.
  const resolvedParams = await params;
  const requestedRole = resolvedParams.role.toLowerCase();

  if (requestedRole !== actualRole) {
    redirect(`/${actualRole}/dashboard`);
  }

  return <>{children}</>;
}
