import React from 'react';
import { SuperAdminAuditLog } from '../../../../components/super-admin-audit-log';
import { requireSuperAdmin } from '../../../../lib/role-guard';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Super Admin - Audit Log | LiteTrace',
  description: 'View platform-wide audit trails.',
};

export default async function SuperAdminAuditPage() {
  const guard = await requireSuperAdmin();
  if (guard) redirect('/dashboard');

  return <SuperAdminAuditLog />;
}
