import React from 'react';
import { AdminDashboard } from '../../../../components/admin-dashboard';

export const metadata = {
  title: 'Admin Dashboard | LiteTrace',
  description: 'Manage your workspace, view issues, and monitor health.',
};

export default async function AdminDashboardPage() {
  return <AdminDashboard />;
}
