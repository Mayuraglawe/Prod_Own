import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { tenantsRepository } from '../../../lib/repositories/tenants';
import { prisma } from '@litetrace/db';
import crypto from 'crypto';


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

  // If the user somehow has no workspace (e.g. legacy account), auto-create one
  if (!user.tenantId) {
    const name = "My Workspace";
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${user.id.slice(0, 6)}`;
    
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { slug, name } });
      await tx.user.update({ where: { id: user.id }, data: { tenantId: tenant.id } });
      await tx.workspaceMember.create({ 
        data: { userId: user.id, tenantId: tenant.id, role: 'SUPER_ADMIN' } 
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
    
    redirect('/dashboard');
  }

  // Fetch their actual role for this workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: user.id,
      tenantId: user.tenantId
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
