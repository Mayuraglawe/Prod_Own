import React from 'react';
import { NavigationShell } from '../../components/navigation-shell';
import { auth } from '../../auth';
import { prisma } from '@litetrace/db';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  let user = undefined;
  let isSuperAdminUser = false;

  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    user = dbUser || undefined;

    if (user) {
      if (['SUPER_ADMIN', 'SUPERADMIN', 'OWNER'].includes(String(user.role).toUpperCase().trim())) {
        isSuperAdminUser = true;
      } else {
        // Fallback to checking workspaceMember if user isn't globally super admin
        const dbClient = prisma as unknown as {
          workspaceMember?: {
            findFirst: (args: {
              where: { userId: string; role: string };
              select: { id: boolean };
            }) => Promise<{ id: string } | null>;
          };
        };
        if (typeof dbClient.workspaceMember?.findFirst === 'function') {
          const superMembership = await dbClient.workspaceMember.findFirst({
            where: { userId: user.id, role: 'SUPER_ADMIN' },
            select: { id: true },
          });
          if (superMembership) isSuperAdminUser = true;
        }
      }
    }
  }

  return (
    <NavigationShell user={user} isSuperAdminOverride={isSuperAdminUser}>
      {children}
    </NavigationShell>
  );
}
