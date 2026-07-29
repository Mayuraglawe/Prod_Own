'use client';

import React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  BarChart2,
  Users,
  HelpCircle,
  Server,
  Cpu,
  Webhook,
  ShieldCheck,
  Building2,
  FolderGit2,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  Settings
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isSuperAdmin?: boolean;
}

export function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  isSuperAdmin = false,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isSuperAdminView = pathname?.startsWith('/super-admin');
  const isSuperAdminUser = isSuperAdmin || isSuperAdminView;

  const activeClass = "bg-[#0B4F3A] text-white shadow-sm";
  const inactiveClass = "text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]";

  const content = (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* Logo Branding & Collapse Toggle */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-90 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#0B4F3A] flex items-center justify-center text-white shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#20C997]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-xl font-bold tracking-tight text-[#13221C] truncate block">LiteTrace</span>
                <span className="block text-[10px] uppercase tracking-widest font-semibold text-[#687870]">
                  {isSuperAdminUser ? 'Platform Control' : 'Operations'}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex w-7 h-7 rounded-full bg-white border-[#E2E8E4] text-[#687870] hover:text-[#0B4F3A] hover:bg-[#E6F7F0] border items-center justify-center transition-all"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 rounded-full bg-gray-200/60 text-[#13221C] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSuperAdminUser ? (
          /* Super Admin View Navigation - ONLY the 8 pages from the design mockup */
          <div className="space-y-1.5">
            <nav className="space-y-1">
              <Link
                href={'/super-admin/dashboard' as Route}
                onClick={onCloseMobile}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/super-admin/dashboard') ? activeClass : inactiveClass}`}
                title="Dashboard"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Dashboard</span>}
                </div>
                {!isCollapsed && isActive('/super-admin/dashboard') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </Link>

              <Link
                href={'/super-admin/orgs' as Route}
                onClick={onCloseMobile}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/super-admin/orgs') ? activeClass : inactiveClass}`}
                title="Organizations"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Building2 className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Organizations</span>}
                </div>
                {!isCollapsed && isActive('/super-admin/orgs') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </Link>

              <Link
                href={'/super-admin/users' as Route}
                onClick={onCloseMobile}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/super-admin/users') ? activeClass : inactiveClass}`}
                title="Users (Global)"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Users className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Users (Global)</span>}
                </div>
                {!isCollapsed && isActive('/super-admin/users') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </Link>

              <Link
                href={'/super-admin/billing' as Route}
                onClick={onCloseMobile}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/super-admin/billing') ? activeClass : inactiveClass}`}
                title="Billing & Revenue"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Billing & Revenue</span>}
                </div>
                {!isCollapsed && isActive('/super-admin/billing') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </Link>

              <Link
                href={'/super-admin/health' as Route}
                onClick={onCloseMobile}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/super-admin/health') ? activeClass : inactiveClass}`}
                title="Platform Ops"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Settings className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Platform Ops</span>}
                </div>
                {!isCollapsed && isActive('/super-admin/health') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </Link>

              <Link
                href={'/super-admin/files' as Route}
                onClick={onCloseMobile}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/super-admin/files') ? activeClass : inactiveClass}`}
                title="Files & System Documentation"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FolderGit2 className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Files Vault</span>}
                </div>
                {!isCollapsed && isActive('/super-admin/files') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </Link>

              <Link
                href={'/super-admin/data' as Route}
                onClick={onCloseMobile}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/super-admin/data') ? activeClass : inactiveClass}`}
                title="Data & Compliance"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Database className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Data & Compliance</span>}
                </div>
                {!isCollapsed && isActive('/super-admin/data') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </Link>

              <Link
                href={'/super-admin/config' as Route}
                onClick={onCloseMobile}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/super-admin/config') ? activeClass : inactiveClass}`}
                title="Configuration"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Settings className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Configuration</span>}
                </div>
                {!isCollapsed && isActive('/super-admin/config') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </Link>

              <Link
                href={'/super-admin/audit' as Route}
                onClick={onCloseMobile}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/super-admin/audit') ? activeClass : inactiveClass}`}
                title="Security & Audit"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Security & Audit</span>}
                </div>
                {!isCollapsed && isActive('/super-admin/audit') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </Link>
            </nav>
          </div>
        ) : (
          /* Normal Workspace view navigation */
          <>
            {/* Navigation Section: MENU */}
            <div className="space-y-1.5">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">Menu</p>
              )}
              <nav className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/dashboard') ? activeClass : inactiveClass}`}
                  title="Dashboard"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Dashboard</span>}
                  </div>
                  {!isCollapsed && isActive('/dashboard') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
                </Link>

                <Link
                  href="/tasks"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/tasks') ? activeClass : inactiveClass}`}
                  title="Issues & Errors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckSquare className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Issues &amp; Errors</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E6F7F0] text-[#0B4F3A]">12+</span>
                  )}
                </Link>

                <Link
                  href="/calendar"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/calendar') ? activeClass : inactiveClass}`}
                  title="Calendar"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CalendarIcon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Calendar</span>}
                  </div>
                </Link>

                <Link
                  href="/analytics"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/analytics') ? activeClass : inactiveClass}`}
                  title="Analytics"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BarChart2 className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Analytics</span>}
                  </div>
                </Link>
              </nav>
            </div>

            {/* Navigation Section: INFRASTRUCTURE */}
            <div className="space-y-1.5">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">Infrastructure</p>
              )}
              <nav className="space-y-1">
                <Link
                  href="/sources"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/sources') ? activeClass : inactiveClass}`}
                  title="Projects & SDK Keys"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Server className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Projects &amp; SDK Keys</span>}
                  </div>
                </Link>

                <Link
                  href="/workers"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/workers') ? activeClass : inactiveClass}`}
                  title="Queue Workers"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Cpu className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Queue Workers</span>}
                  </div>
                </Link>

                <Link
                  href="/settings"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/settings') ? activeClass : inactiveClass}`}
                  title="Alert Rules & Integrations"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Webhook className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Alert Rules &amp; Integrations</span>}
                  </div>
                </Link>
              </nav>
            </div>

            {/* Navigation Section: GENERAL */}
            <div className="space-y-1.5">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">General</p>
              )}
              <nav className="space-y-1">
                <Link
                  href="/workspace"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/workspace') || isActive('/team') ? activeClass : inactiveClass}`}
                  title="Workspace & Team"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Building2 className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Workspace &amp; Team</span>}
                  </div>
                  {!isCollapsed && (isActive('/workspace') || isActive('/team')) && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
                </Link>

                <Link
                  href="/profile"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/profile') ? activeClass : inactiveClass}`}
                  title="Profile Settings"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Users className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Profile Settings</span>}
                  </div>
                </Link>

                <Link
                  href="/help"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/help') ? activeClass : inactiveClass}`}
                  title="Help & Docs"
                >
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Help & Docs</span>}
                </Link>
              </nav>
            </div>

            {/* Platform Control Link (Only for Super Admins to transition into the Super Admin section) */}
            {isSuperAdmin && (
              <div className="space-y-1.5 pt-4 border-t border-[#E2E8E4]/60">
                {!isCollapsed && (
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">Admin Access</p>
                )}
                <nav className="space-y-1">
                  <Link
                    href={'/super-admin/dashboard' as Route}
                    onClick={onCloseMobile}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all text-indigo-600 hover:bg-indigo-50`}
                    title="Platform Control Panel"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                      {!isCollapsed && <span className="truncate">Platform Control</span>}
                    </div>
                  </Link>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={`hidden lg:flex flex-col border-r bg-[#E6E6FA] border-[#E2E8E4] p-6 shrink-0 transition-all duration-300 sticky top-0 h-screen overflow-y-auto ${
          isCollapsed ? 'w-20 items-center' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer (Slide-in) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-[#E6E6FA] h-full p-6 shadow-2xl flex flex-col z-10 overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
