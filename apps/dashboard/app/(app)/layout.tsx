import React from 'react';
import { NavigationShell } from '../../components/navigation-shell';
import { auth } from '../../auth';
import { prisma } from '@litetrace/db';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  let user = undefined;
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    user = dbUser || undefined;
  }

  return (
    <NavigationShell user={user}>
      {children}
    </NavigationShell>
  );
}
