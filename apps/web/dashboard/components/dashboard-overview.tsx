'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Play,
  Pause,
  Square,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export interface DashboardStats {
  totalIssues: number;
  totalEvents: number;
  resolvedIssues: number;
}

export interface IssueData {
  id: string;
  title: string | null;
  status: string;
  eventCount: number;
  lastSeen: Date;
}

export function DashboardOverview({ stats, activeIssues }: { stats: DashboardStats, activeIssues: IssueData[] }) {
  const [isWorkerTracking, setIsWorkerTracking] = useState(false);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  // Fetch DB tracker state on mount
  const fetchDbTrackerState = async () => {
    try {
      const res = await fetch('/api/tracker');
      if (res.ok) {
        const data = await res.json();
        setIsWorkerTracking(data.isRunning || false);
        setUptimeSeconds(data.elapsedSeconds || 0);
      }
    } catch (e) {
      console.error('Failed to fetch DB tracker state:', e);
    }
  };

  useEffect(() => {
    fetchDbTrackerState();
  }, []);

  // Live Timer when tracking is RUNNING
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkerTracking) {
      interval = setInterval(() => {
        setUptimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkerTracking]);

  // DB Sync Handlers for Play / Pause / Stop
  const handleToggleTracking = async () => {
    const nextState = !isWorkerTracking;
    setIsWorkerTracking(nextState);
    const action = nextState ? 'start' : 'pause';
    try {
      await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, elapsedSeconds: uptimeSeconds }),
      });
    } catch (e) {
      console.error('Failed to update tracker DB:', e);
    }
  };

  const handleStopTracking = async () => {
    setIsWorkerTracking(false);
    setUptimeSeconds(0);
    try {
      await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', elapsedSeconds: 0 }),
      });
    } catch (e) {
      console.error('Failed to stop tracker DB:', e);
    }
  };

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#13221C] tracking-tight">Dashboard</h1>
          <p className="text-xs lg:text-sm text-[#687870] mt-0.5">Plan, prioritize, and accomplish your tasks with ease</p>
        </div>
      </div>
      
      {/* 4 TOP STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#52b788] via-[#40916c] to-[#2d6a4f] p-6 text-white shadow-md flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#d8f3dc]">Total Issues</span>
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold tracking-tight">{stats.totalIssues}</div>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#52b788]/20 text-[#52b788] text-[10px] font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>Tracked by LiteTrace</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687870]">Total Events</span>
            <div className="w-8 h-8 rounded-full border border-[#E2E8E4] flex items-center justify-center text-[#13221C]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-[#13221C] tracking-tight">{stats.totalEvents}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#687870]">
              <span className="font-semibold text-[#6B7252]">Events Handled</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687870]">Resolved</span>
            <div className="w-8 h-8 rounded-full border border-[#E2E8E4] flex items-center justify-center text-[#13221C]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-[#13221C] tracking-tight">{stats.resolvedIssues}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#687870]">
              <span className="font-semibold text-[#6B7252]">Issues fixed</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687870]">Active Error Rate</span>
            <div className="w-8 h-8 rounded-full border border-[#E2E8E4] flex items-center justify-center text-[#13221C]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold text-[#13221C] tracking-tight">
              {stats.totalIssues > 0 ? Math.round((stats.totalIssues - stats.resolvedIssues) / stats.totalIssues * 100) : 0}%
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#687870]">
              <span className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-bold border border-yellow-200">Unresolved %</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE GRID (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#13221C]">Project Analytics</h3>
          </div>
          <div className="flex items-end justify-between h-44 gap-2 pt-6 px-2">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-28"></div>
              <span className="text-[11px] font-semibold text-[#687870]">S</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-36"></div>
              <span className="text-[11px] font-semibold text-[#687870]">M</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1 relative">
              <span className="absolute -top-6 px-1.5 py-0.5 bg-[#52b788] text-[#2d6a4f] text-[9px] font-extrabold rounded-md shadow-sm">34%</span>
              <div className="w-full bg-[#52b788] rounded-full h-32"></div>
              <span className="text-[11px] font-bold text-[#52b788]">T</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-[#52b788] rounded-full h-40"></div>
              <span className="text-[11px] font-semibold text-[#687870]">W</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-32"></div>
              <span className="text-[11px] font-semibold text-[#687870]">T</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-24"></div>
              <span className="text-[11px] font-semibold text-[#687870]">F</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-30"></div>
              <span className="text-[11px] font-semibold text-[#687870]">S</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#13221C] mb-4">Reminders</h3>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#13221C] leading-snug">Meeting with Arc Company</h4>
              <p className="text-xs text-[#687870]">Time : 02.00 pm - 04.00 pm</p>
            </div>
          </div>
          <Link href="/calendar" className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#52b788] hover:bg-[#8E9671] text-white font-bold text-xs rounded-full shadow-sm transition-all">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Meeting</span>
          </Link>
        </div>

        <div className="lg:col-span-4 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#13221C]">Project</h3>
            <Link href="/tasks" className="flex items-center gap-1 text-xs font-bold text-[#52b788] hover:underline">
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </Link>
          </div>
          <div className="space-y-3">
            <Link href="/tasks" className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">⚡</div>
                <div>
                  <h5 className="text-xs font-bold text-[#13221C]">Develop API Endpoints</h5>
                  <p className="text-[10px] text-[#687870]">Due date: Feb 24, 2024</p>
                </div>
              </div>
            </Link>
            <Link href="/tasks" className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">🛡️</div>
                <div>
                  <h5 className="text-xs font-bold text-[#13221C]">Onboarding Flow</h5>
                  <p className="text-[10px] text-[#687870]">Due date: Feb 26, 2024</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#13221C]">Active Issues</h3>
            <Link href="/dashboard" className="flex items-center gap-1 px-3 py-1 bg-white border border-[#E2E8E4] text-[#13221C] font-bold text-[11px] rounded-full hover:bg-gray-50 transition-all">
              <span>View All</span>
            </Link>
          </div>
          <div className="space-y-4">
            {activeIssues.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center">No active issues found! You are all caught up.</div>
            ) : (
              activeIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0">
                      ⚡
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-[#13221C] truncate">{issue.title || 'Unknown Error'}</h5>
                      <p className="text-[10px] text-[#687870] truncate">Last seen: {new Date(issue.lastSeen).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-[#13221C]">{issue.eventCount}</span>
                      <span className="text-[9px] text-[#687870]">Events</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                      issue.status === 'RESOLVED' ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#d8f3dc]' :
                      issue.status === 'OPEN' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-[#13221C]">Project Progress</h3>
          <div className="relative flex flex-col items-center justify-center py-4">
            <svg className="w-40 h-24" viewBox="0 0 160 90">
              <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke="#E2E8E4" strokeWidth="18" strokeLinecap="round" />
              <path d="M 15 80 A 65 65 0 0 1 95 22" fill="none" stroke="#52b788" strokeWidth="18" strokeLinecap="round" />
            </svg>
            <div className="text-center mt-[-2.5rem]">
              <span className="text-3xl font-extrabold text-[#13221C] tracking-tight">41%</span>
              <span className="block text-[11px] text-[#687870] font-semibold">Project Ended</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-[#2d6a4f] via-[#8E9671] to-[#52b788] p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-wave-dark pointer-events-none opacity-60"></div>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#d8f3dc]">Time Tracker</span>
          </div>
          <div className="relative z-10 py-6 text-center">
            <div className="text-4xl font-extrabold tracking-wider font-mono drop-shadow-sm">
              {formatTimer(uptimeSeconds)}
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-center gap-3">
            <button onClick={handleToggleTracking} className="w-10 h-10 rounded-full bg-white text-[#2d6a4f] flex items-center justify-center shadow-sm hover:scale-105 transition-all">
              {isWorkerTracking ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button onClick={handleStopTracking} className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all">
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
