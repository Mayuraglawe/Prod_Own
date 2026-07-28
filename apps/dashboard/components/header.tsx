'use client';

import React, { useState } from 'react';
import { Search, Bell, Menu, PanelLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WorkspaceSwitcher } from './workspace-switcher';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  onOpenMobileNav?: () => void;
  onToggleDesktopSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Header({
  user,
  onOpenMobileNav,
  onToggleDesktopSidebar,
  isSidebarCollapsed = false,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const isSuperAdmin = user?.role && ['SUPER_ADMIN', 'SUPERADMIN', 'OWNER'].includes(user.role.toUpperCase().trim());
  const isSuperAdminView = pathname?.startsWith('/super-admin');
  const isSuperAdminUser = isSuperAdmin || isSuperAdminView;

  // Breadcrumb / Title text based on route
  const getBreadcrumb = () => {
    if (pathname === '/super-admin/dashboard') return 'Dashboard';
    if (pathname?.startsWith('/super-admin/orgs')) return 'Organizations';
    if (pathname?.startsWith('/super-admin/users')) return 'Users';
    if (pathname?.startsWith('/super-admin/billing')) return 'Billing';
    if (pathname?.startsWith('/super-admin/health')) return 'Platform Ops';
    if (pathname?.startsWith('/super-admin/data')) return 'Data & Compliance';
    if (pathname?.startsWith('/super-admin/config')) return 'Configuration';
    if (pathname?.startsWith('/super-admin/audit')) return 'Security & Audit';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 w-full min-w-0 bg-[#F3F5F4]/90 border-[#E2E8E4]/60 backdrop-blur-md border-b py-3 mb-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Section: Breadcrumb Title & Mobile/Desktop toggles */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile Navigation Toggle Button */}
          {onOpenMobileNav && (
            <button
              onClick={onOpenMobileNav}
              className="lg:hidden p-2 rounded-xl border transition-all shadow-sm shrink-0 bg-white border-[#E2E8E4] text-[#13221C] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Sidebar Toggle Button */}
          {onToggleDesktopSidebar && (
            <button
              onClick={onToggleDesktopSidebar}
              className="hidden lg:flex p-2 rounded-xl border transition-all shadow-sm shrink-0 bg-white border-[#E2E8E4] text-[#13221C] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}

          {/* Page breadcrumb title - matches image layout */}
          {isSuperAdminView && (
            <span className="text-[#687870] text-sm font-medium mr-4 hidden md:inline-block">
              {getBreadcrumb()}
            </span>
          )}

          {/* Flexible Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder={isSuperAdminUser ? "Search for orgs/users..." : "Search Tasks / Errors..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 border rounded-full text-sm placeholder-[#9CA3AF] focus:outline-none transition-all shadow-sm bg-white border-[#E2E8E4] text-[#13221C] focus:ring-2 focus:ring-[#0B4F3A]/20"
            />
            <kbd className="hidden sm:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold border rounded-md text-[#687870] bg-[#F3F5F4] border-[#E2E8E4]">
              ⌘F
            </kbd>
          </div>
        </div>

        {/* Right Header Actions & User Profile */}
        <div className="flex items-center gap-2.5 justify-end shrink-0">
          {/* Hide workspace switcher in global super admin panel */}
          {!isSuperAdminUser && <WorkspaceSwitcher />}
          
          {isSuperAdminUser && (
            <button
              className="w-9 h-9 rounded-full bg-white border border-[#E2E8E4] flex items-center justify-center text-[#687870] hover:text-[#0B4F3A] hover:bg-[#E6F7F0] transition-all shadow-sm"
              title="Help & FAQ"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          <button
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8E4] flex items-center justify-center text-[#687870] hover:text-[#0B4F3A] hover:bg-[#E6F7F0] transition-all shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {/* User Profile Badge */}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 pl-1.5 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <img
              src={user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
              alt={user?.name || "User Avatar"}
              className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-[#0B4F3A]/20"
            />
            <div className="hidden md:block text-left">
              <span className="block text-xs font-bold leading-tight truncate max-w-[140px] text-[#13221C]">
                {user?.name || "Member"}
              </span>
              <span className="block text-[10px] truncate max-w-[140px] text-[#687870]">
                {isSuperAdminUser ? (user?.role || 'Super Admin') : (user?.email || "No email")}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
