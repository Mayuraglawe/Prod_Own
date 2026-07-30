import React from 'react';
import { AdminDashboard } from '../../../../components/admin-dashboard';
import { EmployeeDashboard } from '../../../../components/employee-dashboard';

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = await params;
  const role = resolvedParams.role.charAt(0).toUpperCase() + resolvedParams.role.slice(1);
  return {
    title: `${role} Dashboard | LiteTrace`,
    description: 'Manage your workspace, view issues, and monitor health.',
  };
}

export default async function RoleDashboardPage({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = await params;
  const role = resolvedParams.role.toLowerCase();
  
  if (role === 'employee') {
    return <EmployeeDashboard />;
  }
  
  return <AdminDashboard />;
}
