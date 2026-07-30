'use client';

import React from 'react';
import { SuperAdminDashboard } from './superadmin-dashboard';
import { AdminDashboard } from './admin-dashboard';
import { EmployeeDashboard } from './employee-dashboard';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

interface DashboardProps {
  role?: UserRole;
}

export function Dashboard({ role = 'SUPER_ADMIN' }: DashboardProps) {
  // In a real application, the role would be fetched from a React Context (e.g. NextAuth session)
  // For the purpose of this prototype, we pass it via props or default to SUPER_ADMIN.
  
  if (role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }

  if (role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
}
