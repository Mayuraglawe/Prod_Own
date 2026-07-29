'use server';

import { prisma } from '@litetrace/db';
import { auth } from '../../auth';
import { redirect } from 'next/navigation';

/**
 * Server action: creates a new workspace (Tenant) for the authenticated user
 * and assigns them to it.
 *
 * Called from the /onboarding page form. Redirects to /dashboard on success.
 */
export async function createWorkspace(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const name = String(formData.get('name') ?? '').trim();
  if (!name || name.length < 2) {
    // Server actions can't return validation errors directly to a plain form —
    // the onboarding page uses useFormState to capture this thrown error.
    throw new Error('Workspace name must be at least 2 characters.');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/login');
  }

  // If the user already has a tenant, skip creation and redirect
  if (user.tenantId) {
    redirect('/dashboard');
  }

  // Build a URL-safe slug from the workspace name, suffixed with user ID fragment
  // to avoid slug collisions between tenants with the same name.
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { slug, name },
    });
    await tx.user.update({
      where: { id: user.id },
      data: { tenantId: tenant.id },
    });
  });

  redirect('/dashboard');
}
