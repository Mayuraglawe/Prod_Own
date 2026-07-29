import React from 'react';
import { requireSuperAdmin } from '../../../lib/role-guard';
import { redirect } from 'next/navigation';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const guard = await requireSuperAdmin();
  if (guard) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
