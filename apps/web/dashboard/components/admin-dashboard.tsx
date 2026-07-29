'use client';

import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ArrowUpRight,
  Plus, Users, Bell, Key, FolderOpen,
  Activity, TrendingDown, Circle
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const WORKSPACE_PROJECTS = [
  { id: 'p-1', name: 'Frontend Web App', type: 'Next.js', errorCount: 14, status: 'active', lastSeen: '2m ago' },
  { id: 'p-2', name: 'Payment Microservice', type: 'Fastify', errorCount: 3, status: 'active', lastSeen: '8m ago' },
  { id: 'p-3', name: 'Mobile iOS App', type: 'React Native', errorCount: 27, status: 'degraded', lastSeen: '1m ago' },
  { id: 'p-4', name: 'Background Worker', type: 'BullMQ', errorCount: 0, status: 'active', lastSeen: '34m ago' },
];

const WORKSPACE_TEAM = [
  { id: 'u-1', name: 'Alexandra Deff', email: 'alexandra@acme.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', role: 'Admin', status: 'online' },
  { id: 'u-2', name: 'Edwin Aderike', email: 'edwin@acme.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', role: 'Employee', status: 'online' },
  { id: 'u-3', name: 'Isaac Oluwatemilorun', email: 'isaac@acme.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', role: 'Employee', status: 'away' },
];

const RECENT_ERRORS = [
  { id: 'e-1', title: 'TypeError: Cannot read properties of null', project: 'Frontend Web App', severity: 'critical', count: 124, time: '2m ago' },
  { id: 'e-2', title: 'PaymentIntent creation failed (Stripe)', project: 'Payment Microservice', severity: 'error', count: 8, time: '9m ago' },
  { id: 'e-3', title: 'EXC_BAD_ACCESS SIGSEGV (crash)', project: 'Mobile iOS App', severity: 'critical', count: 31, time: '1m ago' },
  { id: 'e-4', title: 'Unhandled promise rejection in job queue', project: 'Background Worker', severity: 'warning', count: 2, time: '41m ago' },
];

const ALERT_HOOKS = [
  { id: 'h-1', target: '#prod-alerts (Slack)', trigger: 'Critical errors', status: 'active' },
  { id: 'h-2', target: 'Custom Webhook', trigger: 'Any new issue', status: 'active' },
  { id: 'h-3', target: '#mobile-crashes (Slack)', trigger: 'iOS crash events', status: 'paused' },
];

const ERROR_BARS = [12, 8, 24, 16, 9, 31, 14, 27, 11, 18, 38, 22];

// ─── Sub-components ──────────────────────────────────────────────────────────

function WorkspaceStatCard({ label, value, sub, icon: Icon, accent, trend }: {
  label: string; value: string; sub: string; icon: React.ElementType;
  accent: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[130px] ${accent}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold opacity-80 leading-tight">{label}</span>
        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-extrabold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-[11px] opacity-75 font-medium">
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {trend === 'neutral' && <Circle className="w-2 h-2 fill-current" />}
          {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
          <span>{sub}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [errors, setErrors] = useState(RECENT_ERRORS);
  const [showInvite, setShowInvite] = useState(false);

  const resolveError = (id: string) => setErrors(prev => prev.filter(e => e.id !== id));

  const totalErrors = WORKSPACE_PROJECTS.reduce((a, p) => a + p.errorCount, 0);
  const degradedProjects = WORKSPACE_PROJECTS.filter(p => p.status === 'degraded').length;

  return (
    <div className="space-y-6">

      {/* ─── Header Banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 80% 50%, #38BDF8 0%, transparent 60%)'
        }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-5 h-5 text-sky-300" />
              <span className="text-xs font-bold text-sky-300 uppercase tracking-widest">Workspace Admin</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Acme Corp — Workspace</h1>
            <p className="text-sm text-sky-100/70 mt-1">Monitor your projects, team, and error telemetry.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-extrabold">{totalErrors}</div>
              <div className="text-[10px] font-semibold text-sky-200 uppercase tracking-widest mt-0.5">Open Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <WorkspaceStatCard label="Active Projects" value={`${WORKSPACE_PROJECTS.length}`} sub={`${degradedProjects} need attention`} icon={FolderOpen} accent="bg-gradient-to-br from-sky-700 to-indigo-800 text-white" trend="neutral" />
        <WorkspaceStatCard label="Open Issues" value={`${totalErrors}`} sub="Across all projects" icon={AlertTriangle} accent={totalErrors > 30 ? 'bg-gradient-to-br from-rose-600 to-rose-700 text-white' : 'bg-white border border-[#E2E8E4] text-[#13221C]'} trend="up" />
        <WorkspaceStatCard label="Team Members" value={`${WORKSPACE_TEAM.length}`} sub={`${WORKSPACE_TEAM.filter(u => u.status === 'online').length} online now`} icon={Users} accent="bg-white border border-[#E2E8E4] text-[#13221C]" trend="neutral" />
        <WorkspaceStatCard label="Alert Hooks" value={`${ALERT_HOOKS.filter(h => h.status === 'active').length}/${ALERT_HOOKS.length}`} sub="Active webhooks" icon={Bell} accent="bg-white border border-[#E2E8E4] text-[#13221C]" trend="neutral" />
      </div>

      {/* ─── Error Chart + Projects ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Error Volume Chart */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E2E8E4] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#13221C]">Error Volume</h3>
              <p className="text-[11px] text-[#687870] mt-0.5">Issues ingested over the last 12 intervals</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
              <Activity className="w-3 h-3 text-rose-600" />
              <span className="text-[10px] font-bold text-rose-600">Monitoring</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {ERROR_BARS.map((h, i) => (
              <div key={i} className="flex-1">
                <div
                  className={`w-full rounded-t-lg ${i === ERROR_BARS.length - 1 ? 'bg-rose-500' : h > 20 ? 'bg-rose-100' : 'bg-[#52b788]/20'}`}
                  style={{ height: `${(h / 40) * 128}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-semibold text-[#687870]">
            <span>-12m</span><span>-6m</span><span>now</span>
          </div>
        </div>

        {/* Projects List */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E2E8E4] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#13221C]">My Projects</h3>
              <p className="text-[11px] text-[#687870] mt-0.5">SDK-connected applications in your workspace</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg transition-colors">
              <Key className="w-3.5 h-3.5" />
              <span>New SDK Key</span>
            </button>
          </div>
          <div className="space-y-2">
            {WORKSPACE_PROJECTS.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-[#F0F2F1] hover:border-[#E2E8E4] hover:bg-[#FAFBFB] transition-all">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.status === 'active' ? 'bg-[#52b788]' : 'bg-amber-500 animate-pulse'}`} />
                  <div>
                    <div className="text-xs font-bold text-[#13221C]">{p.name}</div>
                    <div className="text-[10px] text-[#687870]">{p.type} · last seen {p.lastSeen}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${p.errorCount > 10 ? 'text-rose-600' : 'text-[#687870]'}`}>
                    {p.errorCount} issues
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Active Errors + Team ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Error Feed */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-[#E2E8E4] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E4]">
            <div>
              <h3 className="text-sm font-bold text-[#13221C]">Active Error Feed</h3>
              <p className="text-[11px] text-[#687870] mt-0.5">Most recent unresolved issues in your workspace</p>
            </div>
            <span className="text-[10px] font-bold text-[#687870]">{errors.length} open</span>
          </div>
          <div className="divide-y divide-[#F0F2F1]">
            {errors.map(e => {
              const colors = { critical: 'bg-rose-50 text-rose-700 border-rose-200', error: 'bg-amber-50 text-amber-700 border-amber-200', warning: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
              return (
                <div key={e.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[#FAFBFB] transition-colors group">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${e.severity === 'critical' ? 'text-rose-500' : e.severity === 'error' ? 'text-amber-500' : 'text-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#13221C] truncate">{e.title}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[e.severity as keyof typeof colors]}`}>{e.severity}</span>
                      <span className="text-[10px] text-[#687870]">{e.project}</span>
                      <span className="text-[10px] text-[#687870]">× {e.count} occurrences</span>
                      <span className="text-[10px] text-[#687870]">{e.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => resolveError(e.id)}
                    className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#52b788]/10 text-[#52b788] transition-all"
                    title="Resolve"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {errors.length === 0 && (
              <div className="px-6 py-10 text-center text-[#687870]">
                <CheckCircle2 className="w-8 h-8 text-[#52b788] mx-auto mb-2" />
                <p className="text-sm font-semibold">All issues resolved!</p>
              </div>
            )}
          </div>
        </div>

        {/* Team + Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Team */}
          <div className="rounded-2xl bg-white border border-[#E2E8E4] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#13221C]">Team</h3>
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#52b788]/10 hover:bg-[#52b788]/20 text-[#2d6a4f] text-[11px] font-bold transition-colors"
              >
                <Plus className="w-3 h-3" /> Invite
              </button>
            </div>
            {showInvite && (
              <div className="mb-4 flex gap-2">
                <input className="flex-1 text-xs border border-[#E2E8E4] rounded-lg px-3 py-2 outline-none focus:border-sky-400" placeholder="email@acme.com" />
                <button className="px-3 py-2 bg-sky-700 text-white text-xs font-bold rounded-lg hover:bg-sky-800 transition-colors">Send</button>
              </div>
            )}
            <div className="space-y-3">
              {WORKSPACE_TEAM.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${u.status === 'online' ? 'bg-[#52b788]' : 'bg-amber-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#13221C] truncate">{u.name}</div>
                    <div className="text-[10px] text-[#687870]">{u.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Hooks */}
          <div className="rounded-2xl bg-white border border-[#E2E8E4] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#13221C]">Alert Hooks</h3>
              <Bell className="w-4 h-4 text-[#687870]" />
            </div>
            <div className="space-y-3">
              {ALERT_HOOKS.map(h => (
                <div key={h.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#13221C] truncate">{h.target}</div>
                    <div className="text-[10px] text-[#687870]">{h.trigger}</div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${h.status === 'active' ? 'bg-[#52b788]/10 text-[#2d6a4f]' : 'bg-[#F0F2F1] text-[#687870]'}`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full text-xs font-bold text-sky-700 hover:underline text-left">+ Add webhook</button>
          </div>
        </div>
      </div>

    </div>
  );
}
