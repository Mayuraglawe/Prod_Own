'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { MOCK_TEAM, type TeamMember } from '../../../lib/mock-data';

const STATUS_COLORS: Record<TeamMember['status'], string> = {
  'Completed':   'bg-emerald-50 text-emerald-700 border-emerald-200',
  'In Progress': 'bg-amber-50  text-amber-700  border-amber-200',
  'Pending':     'bg-[#F3F5F4] text-[#687870]  border-[#E2E8E4]',
};

/**
 * Team page — lists workspace members and their assigned tasks.
 * TODO: Replace MOCK_TEAM with a real server component fetching from the DB.
 */
export default function TeamPage() {
  return (
    <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#13221C]">Team Collaboration &amp; Roles</h3>
          <p className="text-xs text-[#687870]">Manage organization workspace members and assigned operational duties</p>
        </div>
        <button className="flex items-center gap-1 px-4 py-2 bg-[#0B4F3A] text-white rounded-full font-bold text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Member
        </button>
      </div>

      <div className="divide-y divide-[#E2E8E4]">
        {MOCK_TEAM.map((tm: TeamMember) => (
          <div key={tm.id} className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tm.avatar} alt={tm.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h4 className="text-sm font-bold text-[#13221C]">{tm.name}</h4>
                <p className="text-xs text-[#687870]">{tm.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#F3F5F4] text-[#0B4F3A] font-bold text-xs rounded-full border border-[#E2E8E4]">
                {tm.role}
              </span>
              <span className="text-xs text-[#687870] hidden md:inline">{tm.assignedTask}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${STATUS_COLORS[tm.status]}`}>
                {tm.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
