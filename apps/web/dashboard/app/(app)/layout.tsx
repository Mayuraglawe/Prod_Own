import React from 'react';
import { NavigationShell } from '../../components/navigation-shell';
import { auth } from '../../auth';

/**
 * App shell layout.
 *
 * Reads the user's display info and role from the JWT session token only.
 * Previously, this layout called authUserService.getCurrentUser() and
 * authUserService.isSuperAdmin() — both DB queries — on every single page
 * load. Combined with the [role]/layout.tsx doing the same, this caused
 * Prisma P2024 connection-pool timeouts (4 DB round-trips per render).
 *
 * The JWT token already contains `role` and `tenantId` (populated by
 * auth.config.ts on login), so no DB call is needed here at all.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn('[AppLayout] Auth session fetch failed:', err);
  }

  // Build a lightweight user object purely from the JWT token — zero DB queries.
  let user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | undefined = undefined;

  let isSuperAdminUser = false;

  if (session?.user) {
    const tokenUser = session.user as {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      tenantId?: string | null;
    };

    user = {
      name: tokenUser.name,
      email: tokenUser.email,
      image: tokenUser.image,
      role: tokenUser.role,
    };

    // Derive superadmin status from the token role — no DB needed.
    const rawRole = tokenUser.role?.toUpperCase().trim() ?? '';
    isSuperAdminUser = rawRole === 'SUPER_ADMIN' || rawRole === 'SUPERADMIN' || rawRole === 'OWNER';
  }

  return (
    <NavigationShell user={user} isSuperAdminOverride={isSuperAdminUser}>
      {children}
    </NavigationShell>
  );
}
