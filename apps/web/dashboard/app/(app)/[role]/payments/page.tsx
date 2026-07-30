import React from 'react';
import { AdminPayments } from '../../../../components/admin-payments';

export const metadata = {
  title: 'Billing & Payments | LiteTrace',
  description: 'Manage your workspace subscription, payment methods, and billing history.',
};

export default async function AdminPaymentsPage() {
  return <AdminPayments />;
}
