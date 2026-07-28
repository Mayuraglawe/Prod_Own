import React from 'react';
import { SuperAdminOrgs } from '../../../../components/super-admin-orgs';
import { requireSuperAdmin } from '../../../../lib/role-guard';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Super Admin - Tenant Management | LiteTrace',
  description: 'Manage platform tenants, plan limits, and suspensions.',
};

export default async function SuperAdminOrgsPage() {
  const guard = await requireSuperAdmin();
  if (guard) redirect('/dashboard'); // Super admin guard check for server component

  return <SuperAdminOrgs />;
}
