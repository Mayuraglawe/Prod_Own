import React from 'react';
import { AdminDashboard } from '../../../../components/admin-dashboard';
import { EmployeeDashboard } from '../../../../components/employee-dashboard';
import { SuperAdminDashboard } from '../../../../components/superadmin-dashboard';

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = await params;
  const role = resolvedParams.role.charAt(0).toUpperCase() + resolvedParams.role.slice(1);
  return {
    title: `${role} Dashboard | LiteTrace`,
    description: 'Manage your workspace, view issues, and monitor health.',
  };
}

/**
 * Renders the correct dashboard component based on the [role] URL segment.
 *
 * The [role] segment is authoritative because:
 *   - auth.config.ts resolves WorkspaceMember.role (most specific) into the JWT
 *   - middleware.ts enforces that the URL role matches the JWT role
 *   - [role]/layout.tsx re-validates and redirects if mismatch is detected
 *
 * By the time this page renders, the role URL is guaranteed to match the DB role.
 */
export default async function RoleDashboardPage({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = await params;
  const role = resolvedParams.role.toLowerCase();

  if (role === 'superadmin') {
    return <SuperAdminDashboard />;
  }

  if (role === 'employee' || role === 'candidate') {
    return <EmployeeDashboard />;
  }

  // 'admin' and any unknown roles fall back to AdminDashboard
  return <AdminDashboard />;
}
