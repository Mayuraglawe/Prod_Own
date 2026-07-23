'use client';

import React from 'react';
import Link from 'next/link';
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
  ShieldCheck
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  
  const activeClass = "bg-[#0B4F3A] text-white shadow-sm";
  const inactiveClass = "text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]";

  return (
    <aside className="w-64 border-r-2 border-gray-300 bg-[#E6E6FA] p-6 flex flex-col justify-between shrink-0 hidden lg:flex shadow-sm min-h-screen">
      <div className="space-y-8">
        {/* Logo Branding */}
        <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-90">
          <div className="w-10 h-10 rounded-full bg-[#0B4F3A] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-5 h-5 text-[#20C997]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#13221C]">Own Prod</span>
            <span className="block text-[10px] uppercase tracking-widest font-semibold text-[#687870]">Operations</span>
          </div>
        </Link>

        {/* Navigation Section: MENU */}
        <div className="space-y-2">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">Menu</p>
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/dashboard') ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              {isActive('/dashboard') && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
            </Link>

            <Link
              href="/tasks"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/tasks') ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4" />
                <span>Tasks / Errors</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E6F7F0] text-[#0B4F3A]">12+</span>
            </Link>

            <Link
              href="/calendar"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/calendar') ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar</span>
              </div>
            </Link>

            <Link
              href="/analytics"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/analytics') ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <BarChart2 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </Link>

            <Link
              href="/team"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/team') ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Team</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* Navigation Section: INFRASTRUCTURE */}
        <div className="space-y-2">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">Infrastructure</p>
          <nav className="space-y-1">
            <Link
              href="/sources"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/sources') ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4" />
                <span>Sources & SDKs</span>
              </div>
            </Link>

            <Link
              href="/workers"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/workers') ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4" />
                <span>BullMQ Workers</span>
              </div>
            </Link>

            <Link
              href="/settings"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/settings') ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <Webhook className="w-4 h-4" />
                <span>Alert Hooks & Billing</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* Navigation Section: GENERAL */}
        <div className="space-y-2">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">General</p>
          <nav className="space-y-1">
            <Link
              href="/profile"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/profile') ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Profile settings</span>
              </div>
            </Link>

            <Link
              href="/help"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/help') ? activeClass : inactiveClass}`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Docs</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
