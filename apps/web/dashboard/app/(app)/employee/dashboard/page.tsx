import React from 'react';
import { EmployeeDashboard } from '../../../../components/employee-dashboard';

export const metadata = {
  title: 'Employee Dashboard | LiteTrace',
  description: 'View your tasks, recent errors, and workspace metrics.',
};

export default async function EmployeeDashboardPage() {
  return <EmployeeDashboard />;
}
