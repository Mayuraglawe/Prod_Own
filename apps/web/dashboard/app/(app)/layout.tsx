import React from 'react';
import { NavigationShell } from '../../components/navigation-shell';
import { auth } from '../../auth';
import { authUserService } from '@litetrace/core';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn('[AppLayout] Auth session fetch failed (likely cold start timeout):', err);
  }
  
  let user = undefined;
  let isSuperAdminUser = false;

  if (session?.user?.email) {
    try {
      const dbUser = await authUserService.getCurrentUser(session.user.email);
      if (dbUser) {
        user = dbUser;
        isSuperAdminUser = await authUserService.isSuperAdmin(user);
      }
    } catch (err) {
      console.warn('[AppLayout] Database fetch failed (likely cold start timeout):', err);
    }
  }

  return (
    <NavigationShell user={user} isSuperAdminOverride={isSuperAdminUser}>
      {children}
    </NavigationShell>
  );
}
