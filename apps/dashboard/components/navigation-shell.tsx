'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { usePathname } from 'next/navigation';

interface NavigationShellProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  isSuperAdminOverride?: boolean;
  children: React.ReactNode;
}

export function NavigationShell({ user, isSuperAdminOverride, children }: NavigationShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  
  // Use the explicit override if provided, otherwise fallback to basic user.role check
  const isSuperAdmin = isSuperAdminOverride ?? (user?.role && ['SUPER_ADMIN', 'SUPERADMIN', 'OWNER'].includes(user.role.toUpperCase().trim()));
  const isSuperAdminUser = isSuperAdmin || pathname?.startsWith('/super-admin');

  return (
    <div className="flex min-h-screen bg-[#F3F5F4] text-[#13221C] font-sans antialiased overflow-x-hidden">
      {/* Flexible Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isSuperAdmin={!!isSuperAdmin}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Sticky Responsive Header */}
          <Header
            user={user}
            onOpenMobileNav={() => setIsMobileOpen(true)}
            onToggleDesktopSidebar={() => setIsCollapsed(!isCollapsed)}
            isSidebarCollapsed={isCollapsed}
          />
          <main className="space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
