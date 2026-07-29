import React from 'react';
import { NavigationShell } from '../../components/navigation-shell';
import { auth } from '../../auth';
import { authUserService } from '@litetrace/core';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  let user = undefined;
  let isSuperAdminUser = false;

  if (session?.user?.email) {
    const dbUser = await authUserService.getCurrentUser(session.user.email);
    if (dbUser) {
      user = dbUser;
      isSuperAdminUser = await authUserService.isSuperAdmin(user);
    }
  }

  return (
    <NavigationShell user={user} isSuperAdminOverride={isSuperAdminUser}>
      {children}
    </NavigationShell>
  );
}
