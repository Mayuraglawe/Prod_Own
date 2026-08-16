import React from 'react';
import { requireSuperAdminServer } from '../../../lib/role-guard';
import { NavigationShell } from '../../../components/navigation-shell';
import { redirect } from 'next/navigation';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireSuperAdminServer();
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="superadmin-theme-wrapper border-t-4 border-red-600 min-h-screen bg-background">
      <NavigationShell isSuperAdminOverride={true} user={user}>
        <main className="p-8 w-full max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-red-700">
              Global Command Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Warning: Actions performed here bypass tenant isolation and affect all platform organizations.
            </p>
          </div>
          {children}
        </main>
      </NavigationShell>
    </div>
  );
}
