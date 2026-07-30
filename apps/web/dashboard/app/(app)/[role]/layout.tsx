import { redirect } from 'next/navigation';
import { auth } from '../../../auth';
import { tenantsRepository } from '../../../lib/repositories/tenants';
import { prisma } from '@litetrace/db';

export default async function RoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const session = await auth();

  // 1. Enforce Authentication
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await tenantsRepository.getUserByEmail(session.user.email);
  if (!user) {
    redirect('/login');
  }

  // 2. Enforce Role Isolation
  const resolvedParams = await params;
  const requestedRole = resolvedParams.role.toLowerCase();
  
  // Get the actual role from DB
  let actualRole = 'employee';
  
  if (user.tenantId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id, tenantId: user.tenantId }
    });
    const role = membership?.role || user.role;
    if (role) {
      const roleStr = role.toUpperCase();
      if (roleStr.includes('SUPER')) {
        actualRole = 'superadmin';
      } else if (roleStr.includes('ADMIN') || roleStr.includes('OWNER')) {
        actualRole = 'admin';
      }
    }
  } else {
    // No tenant yet (e.g. onboarding) - fallback to User default role
    if (user.role) {
      const roleStr = user.role.toUpperCase();
      if (roleStr.includes('ADMIN')) {
        actualRole = 'admin';
      }
    }
  }

  // 3. Security Guard: Prevent unauthorized role access
  if (requestedRole !== actualRole) {
    // If they are trying to access a role that isn't theirs, redirect to their assigned role path
    redirect(`/${actualRole}/${user.tenantId ? 'dashboard' : 'onboarding'}`);
  }

  return <>{children}</>;
}
