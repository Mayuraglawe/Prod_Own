'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';


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

  
  // Use the explicit override if provided, otherwise fallback to basic user.role check
  const isSuperAdmin = isSuperAdminOverride ?? (user?.role && ['SUPER_ADMIN', 'SUPERADMIN', 'OWNER'].includes(user.role.toUpperCase().trim()));


  return (
    <div className="flex h-screen bg-transparent text-[#13221C] font-sans antialiased overflow-hidden">
      {/* Flexible Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isSuperAdmin={!!isSuperAdmin}
        userRole={user?.role || undefined}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen border-l-2 border-dotted border-[#13221C]/20">
        <div className="shrink-0 w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 bg-transparent">
          <div className="max-w-7xl w-full mx-auto">
            {/* Sticky Responsive Header */}
            <Header
              user={user}
              onOpenMobileNav={() => setIsMobileOpen(true)}
              onToggleDesktopSidebar={() => setIsCollapsed(!isCollapsed)}
              isSidebarCollapsed={isCollapsed}
            />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
