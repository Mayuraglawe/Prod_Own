import React from 'react';
import { SuperAdminAuditLog } from '../../../../components/super-admin-audit-log';

export const metadata = {
  title: 'Super Admin - Audit Log | LiteTrace',
  description: 'View platform-wide audit trails.',
};

export default async function SuperAdminAuditPage() {
  return <SuperAdminAuditLog />;
}

