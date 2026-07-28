import React from 'react';
import { requireSuperAdmin } from '../../../../lib/role-guard';
import { redirect } from 'next/navigation';
import { CreditCard } from 'lucide-react';

export const metadata = {
  title: 'Super Admin - Billing & Plan Control | LiteTrace',
  description: 'Manage subscription states, credits, and custom plan limits.',
};

export default async function SuperAdminBillingPage() {
  const guard = await requireSuperAdmin();
  if (guard) redirect('/dashboard');

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 bg-white border border-[#E2E8E4] rounded-2xl shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-[#E6F7F0] text-[#0B4F3A] rounded-2xl flex items-center justify-center shadow-sm">
        <CreditCard className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-extrabold text-[#13221C]">Billing & Plan Control</h1>
      <p className="text-[#687870] max-w-md mx-auto font-medium leading-relaxed">
        This platform control capability is planned post-MVP. It will include subscription state overrides, credit issuance, MRR tracking, and custom event quota setups.
      </p>
    </div>
  );
}
