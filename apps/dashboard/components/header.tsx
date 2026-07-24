'use client';

import React, { useState } from 'react';
import { Search, Mail, Bell, Menu, PanelLeft } from 'lucide-react';
import Link from 'next/link';

import { WorkspaceSwitcher } from './workspace-switcher';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
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

  return (
    <header className="sticky top-0 z-30 w-full min-w-0 bg-[#F3F5F4]/90 backdrop-blur-md border-b border-[#E2E8E4]/60 py-3 mb-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Section: Mobile Menu Button & Desktop Sidebar Toggle & Search Input */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile Navigation Toggle Button */}
          {onOpenMobileNav && (
            <button
              onClick={onOpenMobileNav}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#E2E8E4] text-[#13221C] hover:bg-[#E6F7F0] hover:text-[#0B4F3A] transition-all shadow-sm shrink-0"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Sidebar Toggle Button */}
          {onToggleDesktopSidebar && (
            <button
              onClick={onToggleDesktopSidebar}
              className="hidden lg:flex p-2 rounded-xl bg-white border border-[#E2E8E4] text-[#13221C] hover:bg-[#E6F7F0] hover:text-[#0B4F3A] transition-all shadow-sm shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}

          {/* Flexible Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search Tasks / Errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 bg-white border border-[#E2E8E4] rounded-full text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0B4F3A]/20 transition-all shadow-sm"
            />
            <kbd className="hidden sm:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold text-[#687870] bg-[#F3F5F4] border border-[#E2E8E4] rounded-md">
              ⌘F
            </kbd>
          </div>
        </div>

        {/* Right Header Actions & User Profile */}
        <div className="flex items-center gap-2.5 justify-end shrink-0">
          <WorkspaceSwitcher />
          <button
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8E4] flex items-center justify-center text-[#687870] hover:text-[#0B4F3A] hover:bg-[#E6F7F0] transition-all shadow-sm"
            title="Messages"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            className="relative w-9 h-9 rounded-full bg-white border border-[#E2E8E4] flex items-center justify-center text-[#687870] hover:text-[#0B4F3A] hover:bg-[#E6F7F0] transition-all shadow-sm"
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
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0B4F3A]/20 shadow-sm"
            />
            <div className="hidden md:block text-left">
              <span className="block text-xs font-bold text-[#13221C] leading-tight truncate max-w-[140px]">
                {user?.name || "Member"}
              </span>
              <span className="block text-[10px] text-[#687870] truncate max-w-[140px]">
                {user?.email || "No email"}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
