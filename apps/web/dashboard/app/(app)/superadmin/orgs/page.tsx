import React from 'react';
import { SuperAdminOrgs } from '../../../../components/superadmin-orgs';

export const metadata = {
  title: 'Super Admin - Tenant Management | LiteTrace',
  description: 'Manage platform tenants, plan limits, and suspensions.',
};

export default async function SuperAdminOrgsPage() { // Super admin guard check for server component

  return <SuperAdminOrgs />;
}

