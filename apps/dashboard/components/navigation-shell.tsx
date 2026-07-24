'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface NavigationShellProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  children: React.ReactNode;
}

export function NavigationShell({ user, children }: NavigationShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F3F5F4] text-[#13221C] font-sans antialiased overflow-x-hidden">
      {/* Flexible Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
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
