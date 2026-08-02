import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { tenantsRepository } from '../../../lib/repositories/tenants';
import { prisma } from '@litetrace/db';


/**
 * Main dashboard view for authenticated users.
 *
 * If the user does not yet have a tenant assigned, they are redirected to
 * the onboarding flow to create their workspace. The hardcoded test-tenant
 * fallback has been intentionally removed — all tenants must be created
 * through the proper onboarding path.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await tenantsRepository.getUserByEmail(session.user.email);

  if (!user) {
    redirect('/login');
  }

  // New users without a workspace are now auto-provisioned during registration,
  // but if an existing user slipped through without a tenant, provision one now.
  let tenantId = user.tenantId;
  if (!tenantId) {
    const { autoProvisionWorkspace } = await import('../../../lib/services/workspace-provisioner');
    tenantId = await autoProvisionWorkspace(user.id, user.email!);
  }

  // Fetch their actual role for this workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: user.id,
      tenantId: tenantId!
    }
  });

  const role = membership?.role || user.role;

  if (role) {
    const roleStr = role.toUpperCase();
    if (roleStr.includes('SUPER')) {
      redirect('/superadmin/dashboard' as Route);
    } else if (roleStr.includes('ADMIN')) {
      redirect('/admin/dashboard' as Route);
    } else {
      redirect('/employee/dashboard' as Route);
    }
  }

  // Default fallback if role is somehow undefined
  redirect('/employee/dashboard' as Route);
}
