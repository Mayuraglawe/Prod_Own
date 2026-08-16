import React from 'react';
import { SuperAdminOrgs } from '../../../../components/superadmin-orgs'; // assuming this is the export name

export const metadata = {
  title: 'Super Admin - Organizations | LiteTrace',
  description: 'Manage all platform organizations, billing tiers, and suspensions.',
};

export default function SuperAdminOrganizationsPage() {
  return <SuperAdminOrgs />;
}
