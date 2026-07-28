import React from 'react';
import { SuperAdminOverview } from '../../../components/super-admin-overview';
import { requireSuperAdmin } from '../../../lib/role-guard';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Super Admin - Platform Overview | LiteTrace',
  description: 'Global overview of platform health, usage, and metrics.',
};

export default async function SuperAdminOverviewPage() {
  const guard = await requireSuperAdmin();
  if (guard) redirect('/dashboard'); // Not a super admin

  return <SuperAdminOverview />;
}
