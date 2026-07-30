import React from 'react';
import { SuperAdminHealth } from '../../../../components/superadmin-health';

export const metadata = {
  title: 'Super Admin - Platform Health | LiteTrace',
  description: 'Monitor platform ingestion and queue health.',
};

export default async function SuperAdminHealthPage() {
  return <SuperAdminHealth />;
}

