'use client';

import React from 'react';
import { Plus } from 'lucide-react';

import { CalendarEvent, MOCK_CALENDAR } from '../../../lib/mock-data';

export default function CalendarPage() {
  return (
    <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#13221C]">Calendar & Maintenance Schedule</h3>
          <p className="text-xs text-[#687870]">Incident response slots, team meetings, and database maintenance windows</p>
        </div>
        <button className="flex items-center gap-1 px-4 py-2 bg-[#52b788] text-white rounded-full font-bold text-xs">
          <Plus className="w-3.5 h-3.5" /> Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_CALENDAR.map((evt: CalendarEvent) => (
          <div key={evt.id} className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#52b788] font-bold text-[10px]">
                {evt.type}
              </span>
              <span className="text-xs font-semibold text-[#687870]">{evt.date}</span>
            </div>
            <h4 className="text-sm font-bold text-[#13221C]">{evt.title}</h4>
            <p className="text-xs text-[#687870]">{evt.time}</p>
            <button className="w-full py-2 bg-[#52b788] text-white font-bold text-xs rounded-full">
              Join Meeting
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
