import { prisma } from '@litetrace/db';

/**
 * Automatically provisions a default workspace for a new user.
 */
export async function autoProvisionWorkspace(userId: string, email: string) {
  // Use a default name based on the email prefix
  const name = `${email.split('@')[0]}'s Workspace`;
  
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const slug = `${baseSlug}-${userId.slice(0, 6)}`;

  const tenantId = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { slug, name },
    });
    
    // Assign the user to this tenant as their active workspace
    await tx.user.update({
      where: { id: userId },
      data: { tenantId: tenant.id },
    });
    
    // Create the RBAC WorkspaceMember record giving them full permissions
    await tx.workspaceMember.create({
      data: {
        userId: userId,
        tenantId: tenant.id,
        role: 'SUPER_ADMIN'
      }
    });

    return tenant.id;
  });

  return tenantId;
}
