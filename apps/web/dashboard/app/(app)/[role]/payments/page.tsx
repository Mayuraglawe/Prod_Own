import React from 'react';
import { AdminPayments } from '../../../../components/admin-payments';

export const metadata = {
  title: 'Billing & Payments | LiteTrace',
  description: 'Manage your workspace subscription, payment methods, and billing history.',
};

import { auth } from '../../../../auth';
import { prisma } from '@litetrace/db';

export default async function AdminPaymentsPage() {
  const session = await auth();
  const tenantId = (session?.user as { tenantId?: string })?.tenantId || null;
  
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });

  const formattedPlans = plans.map((p: any) => ({
    ...p,
    features: p.features as string[],
  }));

  return <AdminPayments tenantId={tenantId} plans={formattedPlans} />;
}
