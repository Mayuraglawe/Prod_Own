'use client';

import React, { useState } from 'react';
import { Plus, Server, Cpu, Play, Users, ArrowUpRight, BarChart2, Pause, Square } from 'lucide-react';

const MOCK_TEAM = [
  { id: 'tm-1', name: 'Alexandra Deff', email: 'alexandra@prodown.dev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', role: 'Super Admin', assignedTask: 'PostgreSQL RLS Migrations', status: 'Completed' },
  { id: 'tm-2', name: 'Edwin Aderike', email: 'edwin@prodown.dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', role: 'Admin', assignedTask: 'Fastify Helmet Security Rules', status: 'In Progress' },
  { id: 'tm-3', name: 'Isaac Oluwatemilorun', email: 'isaac@prodown.dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', role: 'Employee', assignedTask: 'BullMQ Fingerprint Deduplication', status: 'Pending' }
];

function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}


export function EmployeeDashboard() {
  const [isWorkerTracking, setIsWorkerTracking] = useState(true);
  const [uptimeSeconds, setUptimeSeconds] = useState(5048);
  return (
          <div className="space-y-6">
            {/* 4 TOP STAT CARDS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Projects (Dark Green Gradient Card) */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#52b788] via-[#40916c] to-[#2d6a4f] p-6 text-white shadow-md flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#d8f3dc]">Total Tasks</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold tracking-tight">18</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Assigned to Me</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Active Microservices */}
              <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#687870]">Active Microservices</span>
                  <div className="w-8 h-8 rounded-full border border-[#E2E8E4] flex items-center justify-center text-[#13221C]">
                    <Server className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold text-[#13221C] tracking-tight">9</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#687870]">
                    <span className="font-semibold text-[#52b788]">● 100% Online</span>
                    <span>Kubernetes Cluster</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Error Rate */}
              <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#687870]">My Error Backlog</span>
                  <div className="w-8 h-8 rounded-full border border-[#E2E8E4] flex items-center justify-center text-[#13221C]">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold text-[#13221C] tracking-tight">4</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#687870]">
                    <span className="font-semibold text-[#52b788]">↘ Decreased</span>
                    <span>last 24 hours</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Ingest Latency */}
              <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#687870]">Ingest Latency</span>
                  <div className="w-8 h-8 rounded-full border border-[#E2E8E4] flex items-center justify-center text-[#13221C]">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold text-[#13221C] tracking-tight">14ms</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#687870]">
                    <span className="px-2 py-0.5 rounded-full bg-[#52b788]/10 text-[#2d6a4f] font-bold border border-[#52b788]/30">P99 Optimal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE GRID (3 COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* PROJECT ANALYTICS BAR CHART (5 Cols) */}
              <div className="lg:col-span-5 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#13221C]">Project Analytics</h3>
                </div>

                {/* Pill-shaped Bar Chart */}
                <div className="flex items-end justify-between h-44 gap-2 pt-6 px-2">
                  {/* Sun (Hatched) */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-28"></div>
                    <span className="text-[11px] font-semibold text-[#687870]">S</span>
                  </div>
                  {/* Mon (Hatched) */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-36"></div>
                    <span className="text-[11px] font-semibold text-[#687870]">M</span>
                  </div>
                  {/* Tue (Active Mint Green with 34% Callout) */}
                  <div className="flex flex-col items-center gap-2 flex-1 relative">
                    <span className="absolute -top-6 px-1.5 py-0.5 bg-[#52b788] text-white text-[9px] font-extrabold rounded-md shadow-sm">
                      34%
                    </span>
                    <div className="w-full bg-[#52b788] rounded-full h-32"></div>
                    <span className="text-[11px] font-bold text-[#2d6a4f]">T</span>
                  </div>
                  {/* Wed (Dark Emerald Green) */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-[#2d6a4f] rounded-full h-40"></div>
                    <span className="text-[11px] font-semibold text-[#687870]">W</span>
                  </div>
                  {/* Thu (Hatched) */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-32"></div>
                    <span className="text-[11px] font-semibold text-[#687870]">T</span>
                  </div>
                  {/* Fri (Hatched) */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-24"></div>
                    <span className="text-[11px] font-semibold text-[#687870]">F</span>
                  </div>
                  {/* Sat (Hatched) */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-[#E2E8E4] bg-hatched-pattern rounded-full h-30"></div>
                    <span className="text-[11px] font-semibold text-[#687870]">S</span>
                  </div>
                </div>
              </div>

              {/* REMINDERS CARD (3 Cols) */}
              <div className="lg:col-span-3 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#13221C] mb-4">Reminders</h3>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-[#13221C] leading-snug">Meeting with Arc Company</h4>
                    <p className="text-xs text-[#687870]">Time : 02.00 pm - 04.00 pm</p>
                  </div>
                </div>

                <button
                  onClick={() => {}}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#52b788] hover:bg-[#40916c] text-white font-bold text-xs rounded-full shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Meeting</span>
                </button>
              </div>

              {/* PROJECT LIST CARD (4 Cols) */}
              <div className="lg:col-span-4 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#13221C]">Project</h3>
                  <button onClick={() => {}} className="flex items-center gap-1 text-xs font-bold text-[#52b788] hover:underline">
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                {/* List of Projects */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer" onClick={() => {}}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">⚡</div>
                      <div>
                        <h5 className="text-xs font-bold text-[#13221C]">Develop API Endpoints</h5>
                        <p className="text-[10px] text-[#687870]">Due date: Feb 24, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer" onClick={() => {}}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">🛡️</div>
                      <div>
                        <h5 className="text-xs font-bold text-[#13221C]">Onboarding Flow</h5>
                        <p className="text-[10px] text-[#687870]">Due date: Feb 26, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer" onClick={() => {}}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">✨</div>
                      <div>
                        <h5 className="text-xs font-bold text-[#13221C]">Build Dashboard</h5>
                        <p className="text-[10px] text-[#687870]">Due date: Mar 01, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer" onClick={() => {}}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">🔥</div>
                      <div>
                        <h5 className="text-xs font-bold text-[#13221C]">Optimize Page Load</h5>
                        <p className="text-[10px] text-[#687870]">Due date: Mar 05, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM GRID (3 COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* TEAM COLLABORATION (5 Cols) */}
              <div className="lg:col-span-5 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#13221C]">Team Collaboration</h3>
                  <button onClick={() => {}} className="flex items-center gap-1 px-3 py-1 bg-white border border-[#E2E8E4] text-[#13221C] font-bold text-[11px] rounded-full hover:bg-gray-50 transition-all">
                    <Plus className="w-3 h-3" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {MOCK_TEAM.map((tm) => (
                    <div key={tm.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={tm.avatar} alt={tm.name} className="w-9 h-9 rounded-full object-cover" />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-[#13221C] truncate">{tm.name}</h5>
                          <p className="text-[10px] text-[#687870] truncate">{tm.assignedTask}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0 border ${
                        tm.status === 'Completed' ? 'bg-[#52b788]/10 text-[#2d6a4f] border-[#52b788]/30' :
                        tm.status === 'In Progress' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {tm.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROJECT PROGRESS ARC GAUGE CHART (3 Cols) */}
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

                <div className="flex items-center justify-center gap-3 pt-2 text-[10px] text-[#687870]">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2d6a4f]"></span><span>Completed</span></div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#52b788]"></span><span>In Progress</span></div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#CBD5D0]"></span><span>Pending</span></div>
                </div>
              </div>

              {/* TIME TRACKER DARK CARD (4 Cols) */}
              <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#52b788] p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
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
                  <button onClick={() => setIsWorkerTracking(!isWorkerTracking)} className="w-10 h-10 rounded-full bg-white text-[#1b4332] flex items-center justify-center shadow-sm hover:scale-105 transition-all">
                    {isWorkerTracking ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <button onClick={() => { setIsWorkerTracking(false); setUptimeSeconds(0); }} className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all">
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </div>
  );
}
