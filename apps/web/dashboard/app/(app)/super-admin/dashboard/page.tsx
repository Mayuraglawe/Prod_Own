import React from 'react';
import { SuperAdminOverview } from '../../../../components/super-admin-overview';

export const metadata = {
  title: 'Super Admin - Platform Overview | LiteTrace',
  description: 'Global overview of platform health, usage, and metrics.',
};

export default async function SuperAdminOverviewPage() { // Not a super admin

  return <SuperAdminOverview />;
}

