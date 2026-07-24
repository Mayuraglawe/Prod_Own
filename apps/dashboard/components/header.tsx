'use client';

import React, { useState } from 'react';
import { Search, Mail, Bell } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search Task / Errors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-12 py-2.5 bg-white border border-[#E2E8E4] rounded-full text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0B4F3A]/20 transition-all shadow-sm"
        />
        <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold text-[#687870] bg-[#F3F5F4] border border-[#E2E8E4] rounded-md">
          ⌘F
        </kbd>
      </div>

      {/* Right Header Actions & User Avatar */}
      <div className="flex items-center gap-3 justify-end">
        <button className="w-10 h-10 rounded-full bg-white border border-[#E2E8E4] flex items-center justify-center text-[#687870] hover:text-[#0B4F3A] hover:bg-[#E6F7F0] transition-all shadow-sm">
          <Mail className="w-4 h-4" />
        </button>
        <button className="relative w-10 h-10 rounded-full bg-white border border-[#E2E8E4] flex items-center justify-center text-[#687870] hover:text-[#0B4F3A] hover:bg-[#E6F7F0] transition-all shadow-sm">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* User Profile */}
        <Link 
          href="/profile"
          className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src={user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
            alt={user?.name || "User Avatar"}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#0B4F3A]/20"
          />
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-[#13221C] leading-tight">{user?.name || "Member"}</span>
            <span className="block text-[11px] text-[#687870]">{user?.email || "No email available"}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
