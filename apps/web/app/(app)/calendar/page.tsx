'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'Meeting' | 'Deployment' | 'Maintenance';
  date: string;
}

const MOCK_CALENDAR: CalendarEvent[] = [
  { id: 'cal-1', title: 'Meeting with Arc Company', time: '02:00 pm - 04:00 pm', type: 'Meeting', date: 'Today' },
  { id: 'cal-2', title: 'PostgreSQL RLS Policy Audit', time: '10:00 am - 11:30 am', type: 'Maintenance', date: 'Tomorrow' },
  { id: 'cal-3', title: 'Deploy Ingest API v1.4.0', time: '05:00 pm - 06:00 pm', type: 'Deployment', date: 'Feb 24, 2026' }
];

export default function CalendarPage() {
  return (
    <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#13221C]">Calendar & Maintenance Schedule</h3>
          <p className="text-xs text-[#687870]">Incident response slots, team meetings, and database maintenance windows</p>
        </div>
        <button className="flex items-center gap-1 px-4 py-2 bg-[#0B4F3A] text-white rounded-full font-bold text-xs">
          <Plus className="w-3.5 h-3.5" /> Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_CALENDAR.map((evt) => (
          <div key={evt.id} className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0B4F3A] font-bold text-[10px]">
                {evt.type}
              </span>
              <span className="text-xs font-semibold text-[#687870]">{evt.date}</span>
            </div>
            <h4 className="text-sm font-bold text-[#13221C]">{evt.title}</h4>
            <p className="text-xs text-[#687870]">{evt.time}</p>
            <button className="w-full py-2 bg-[#0B4F3A] text-white font-bold text-xs rounded-full">
              Join Meeting
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
