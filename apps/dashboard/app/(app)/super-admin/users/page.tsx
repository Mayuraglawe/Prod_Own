import React from 'react';
import { requireSuperAdmin } from '../../../../lib/role-guard';
import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'Super Admin - User & Access Management | LiteTrace',
  description: 'Global user search, session management, and role assignments.',
};

export default async function SuperAdminUsersPage() {
  const guard = await requireSuperAdmin();
  if (guard) redirect('/dashboard');

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 bg-white border border-[#E2E8E4] rounded-2xl shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-[#E6F7F0] text-[#0B4F3A] rounded-2xl flex items-center justify-center shadow-sm">
        <Users className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-extrabold text-[#13221C]">User & Access Management</h1>
      <p className="text-[#687870] max-w-md mx-auto font-medium leading-relaxed">
        This platform control capability is planned post-MVP. It will include global user search, password resets, platform-wide bans, and super admin role bootstrapping.
      </p>
    </div>
  );
}
