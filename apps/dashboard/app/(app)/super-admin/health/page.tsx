import React from 'react';
import { SuperAdminHealth } from '../../../../components/super-admin-health';
import { requireSuperAdmin } from '../../../../lib/role-guard';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Super Admin - Platform Health | LiteTrace',
  description: 'Monitor platform ingestion and queue health.',
};

export default async function SuperAdminHealthPage() {
  const guard = await requireSuperAdmin();
  if (guard) redirect('/dashboard');

  return <SuperAdminHealth />;
}
