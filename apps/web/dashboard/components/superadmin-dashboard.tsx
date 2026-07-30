'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Server, BarChart2,
  ShieldCheck, AlertTriangle, Activity, Zap, Database, Globe,
  RefreshCw, Settings, Eye, Ban, CheckCircle2, TrendingUp,
  TrendingDown, Circle, Layers, Bell, Lock, Unlock,
  ExternalLink, Terminal, Wifi
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const TENANTS = [
  { id: 'T-001', name: 'Acme Corp', slug: 'acme', plan: 'Pro', ingestRate: 12400, errorCount: 38, status: 'active', joined: 'Jan 12, 2024' },
  { id: 'T-002', name: 'Stark Industries', slug: 'stark', plan: 'Enterprise', ingestRate: 89200, errorCount: 7, status: 'active', joined: 'Feb 04, 2024' },
  { id: 'T-003', name: 'Wayne Enterprises', slug: 'wayne', plan: 'Pro', ingestRate: 3100, errorCount: 114, status: 'degraded', joined: 'Mar 19, 2024' },
  { id: 'T-004', name: 'Umbrella Labs', slug: 'umbrella', plan: 'Starter', ingestRate: 0, errorCount: 0, status: 'suspended', joined: 'Apr 01, 2024' },
  { id: 'T-005', name: 'Initech Systems', slug: 'initech', plan: 'Pro', ingestRate: 5700, errorCount: 22, status: 'active', joined: 'May 08, 2024' },
];

const SERVICES = [
  { name: 'apps/gateway', lang: 'Fastify', status: 'healthy', latency: '8ms', rpm: '14.2k' },
  { name: 'apps/ingestion', lang: 'Fastify', status: 'healthy', latency: '12ms', rpm: '11.8k' },
  { name: 'apps/processing', lang: 'BullMQ', status: 'healthy', latency: '34ms', rpm: '9.1k' },
  { name: 'apps/grouping', lang: 'BullMQ', status: 'healthy', latency: '51ms', rpm: '8.6k' },
  { name: 'apps/alerting', lang: 'BullMQ', status: 'degraded', latency: '210ms', rpm: '1.2k' },
  { name: 'apps/query', lang: 'Fastify', status: 'healthy', latency: '22ms', rpm: '6.4k' },
  { name: 'apps/notification', lang: 'BullMQ', status: 'healthy', latency: '88ms', rpm: '0.8k' },
];

const STORES = [
  { name: 'PostgreSQL', role: 'Tenants · Issues · Users', status: 'healthy', usage: 62, color: 'bg-sky-500' },
  { name: 'ClickHouse', role: 'Occurrences · Analytics', status: 'healthy', usage: 44, color: 'bg-yellow-500' },
  { name: 'Redis', role: 'Rate limits · Cooldowns', status: 'healthy', usage: 31, color: 'bg-rose-500' },
  { name: 'MinIO / S3', role: 'Raw blob storage', status: 'healthy', usage: 78, color: 'bg-purple-500' },
  { name: 'Kafka', role: 'Event streaming backbone', status: 'degraded', usage: 55, color: 'bg-yellow-500' },
];

const RECENT_EVENTS = [
  { time: '14:21', type: 'ingest', msg: 'Burst of 2,400 events from tenant stark in 60s — rate limiter engaged', level: 'warn' },
  { time: '14:18', type: 'auth', msg: 'API key po_live_9f3c rotated by admin@acme.com', level: 'info' },
  { time: '14:09', type: 'system', msg: 'apps/alerting latency spike — P95 crossed 200ms threshold', level: 'error' },
  { time: '13:57', type: 'tenant', msg: 'New tenant "Initech Systems" onboarded — RLS policy applied', level: 'info' },
  { time: '13:44', type: 'system', msg: 'Kafka consumer group lag for grouping-service grew to 1,204 msgs', level: 'warn' },
  { time: '13:31', type: 'auth', msg: 'Tenant umbrella suspended by Super Admin — billing overdue', level: 'error' },
];

const INGEST_BARS = [18, 34, 27, 52, 41, 68, 44, 72, 58, 85, 61, 91];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, accent, trend }: {
  label: string; value: string; sub: string; icon: React.ElementType;
  accent: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[130px] ${accent}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold opacity-80 leading-tight">{label}</span>
        <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-extrabold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-[11px] opacity-75 font-medium">
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {trend === 'neutral' && <Circle className="w-2 h-2 fill-current" />}
          <span>{sub}</span>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ svc }: { svc: typeof SERVICES[0] }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F0F2F1] last:border-0 group">
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full shrink-0 ${svc.status === 'healthy' ? 'bg-[#52b788]' : 'bg-yellow-500 animate-pulse'}`} />
        <div>
          <span className="text-xs font-bold text-[#13221C] font-mono">{svc.name}</span>
          <span className="ml-2 text-[10px] text-[#687870] font-semibold bg-[#F0F2F1] px-1.5 py-0.5 rounded">{svc.lang}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[11px] font-semibold text-[#687870]">
        <span className="hidden sm:inline font-mono">{svc.latency}</span>
        <span className="hidden md:inline">{svc.rpm} rpm</span>
        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${svc.status === 'healthy' ? 'bg-[#52b788]/10 text-[#2d6a4f]' : 'bg-yellow-50 text-yellow-700'}`}>
          {svc.status}
        </span>
      </div>
    </div>
  );
}

function StoreRow({ store }: { store: typeof STORES[0] }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${store.status === 'healthy' ? 'bg-[#52b788]' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="font-bold text-[#13221C]">{store.name}</span>
        </div>
        <div className="flex items-center gap-3 text-[#687870]">
          <span className="hidden sm:inline text-[10px]">{store.role}</span>
          <span className="font-bold text-[#13221C]">{store.usage}%</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-[#F0F2F1] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${store.color} ${store.usage > 70 ? 'animate-pulse' : ''}`}
          style={{ width: `${store.usage}%` }}
        />
      </div>
    </div>
  );
}

function TenantRow({ tenant, onToggle }: { tenant: typeof TENANTS[0]; onToggle: (id: string) => void }) {
  const statusColors = {
    active: 'bg-[#52b788]/10 text-[#2d6a4f] border-[#52b788]/30',
    degraded: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    suspended: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <tr className="border-b border-[#F0F2F1] hover:bg-[#FAFBFB] transition-colors group">
      <td className="px-4 py-3">
        <div>
          <div className="text-xs font-bold text-[#13221C]">{tenant.name}</div>
          <div className="text-[10px] text-[#687870] font-mono">/{tenant.slug}</div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0F2F1] text-[#687870]">{tenant.plan}</span>
      </td>
      <td className="px-4 py-3 text-xs font-semibold text-[#13221C] font-mono hidden md:table-cell">
        {tenant.ingestRate.toLocaleString()}/hr
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className={`text-[10px] font-bold ${tenant.errorCount > 50 ? 'text-rose-600' : 'text-[#687870]'}`}>
          {tenant.errorCount} issues
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${statusColors[tenant.status as keyof typeof statusColors]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'active' ? 'bg-[#52b788]' : tenant.status === 'degraded' ? 'bg-yellow-500' : 'bg-rose-500'}`} />
          {tenant.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-lg hover:bg-[#52b788]/10 text-[#52b788] transition-colors" title="View Tenant">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggle(tenant.id)}
            className={`p-1.5 rounded-lg transition-colors ${tenant.status === 'suspended' ? 'hover:bg-[#52b788]/10 text-[#2d6a4f]' : 'hover:bg-rose-50 text-rose-600'}`}
            title={tenant.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
          >
            {tenant.status === 'suspended' ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

function EventLog({ event }: { event: typeof RECENT_EVENTS[0] }) {
  const colors = { info: 'text-sky-600 bg-sky-50', warn: 'text-yellow-600 bg-yellow-50', error: 'text-rose-600 bg-rose-50' };
  const icons = { info: CheckCircle2, warn: AlertTriangle, error: AlertTriangle };
  const Icon = icons[event.level as keyof typeof icons];

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#F0F2F1] last:border-0">
      <span className={`mt-0.5 p-1 rounded-lg shrink-0 ${colors[event.level as keyof typeof colors]}`}>
        <Icon className="w-3 h-3" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[#13221C] font-medium leading-relaxed">{event.msg}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono text-[#687870]">{event.time}</span>
          <span className="text-[10px] font-bold text-[#687870] uppercase">{event.type}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SuperAdminDashboard() {
  const [tenants, setTenants] = useState(TENANTS);
  const [uptimeSeconds, setUptimeSeconds] = useState(18432);

  useEffect(() => {
    const t = setInterval(() => setUptimeSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const toggleTenant = (id: string) => {
    setTenants(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'suspended' ? 'active' : 'suspended' } : t
    ));
  };

  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const degradedServices = SERVICES.filter(s => s.status === 'degraded').length;

  return (
    <div className="space-y-6">

      {/* ─── Header Banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#52b788] p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'radial-gradient(circle at 80% 50%, #52b788 0%, transparent 60%)'
        }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-[#d8f3dc]" />
              <span className="text-xs font-bold text-[#d8f3dc] uppercase tracking-widest">Super Admin Control Panel</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Platform Overview</h1>
            <p className="text-sm text-[#d8f3dc]/80 mt-1">Full visibility across all tenants, services, and infrastructure.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-extrabold font-mono">{fmt(uptimeSeconds)}</div>
              <div className="text-[10px] font-semibold text-[#d8f3dc] uppercase tracking-widest mt-0.5 flex items-center justify-center gap-1">
                <Wifi className="w-3 h-3" /> Live Uptime
              </div>
            </div>
            <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tenants"
          value={`${tenants.length}`}
          sub={`${activeTenants} active workspaces`}
          icon={Users}
          accent="bg-white border border-[#E2E8E4] text-[#13221C]"
          trend="up"
        />
        <StatCard
          label="Microservices Online"
          value={`${SERVICES.length - degradedServices}/${SERVICES.length}`}
          sub={degradedServices > 0 ? `${degradedServices} degraded` : 'All systems nominal'}
          icon={Server}
          accent="bg-white border border-[#E2E8E4] text-[#13221C]"
          trend={degradedServices > 0 ? 'down' : 'neutral'}
        />
        <StatCard
          label="Global Error Rate"
          value="0.04%"
          sub="↘ Decreased last 24h"
          icon={BarChart2}
          accent="bg-white border border-[#E2E8E4] text-[#13221C]"
          trend="down"
        />
        <StatCard
          label="Ingest Latency"
          value="14ms"
          sub="P99 Optimal across all"
          icon={Zap}
          accent="bg-white border border-[#E2E8E4] text-[#13221C]"
          trend="neutral"
        />
      </div>

      {/* ─── Middle Row: Ingest Chart + System Stores ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Ingest Volume Sparkline */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E2E8E4] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#13221C]">Global Ingest Volume</h3>
              <p className="text-[11px] text-[#687870] mt-0.5">Events/min across all tenants · last 12 intervals</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#52b788]/10 border border-[#52b788]/30">
              <Activity className="w-3 h-3 text-[#2d6a4f]" />
              <span className="text-[10px] font-bold text-[#2d6a4f]">Live</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {INGEST_BARS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all ${i === INGEST_BARS.length - 1 ? 'bg-[#52b788]' : 'bg-[#52b788]/20'}`}
                  style={{ height: `${(h / 100) * 128}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-semibold text-[#687870]">
            <span>-12m</span><span>-6m</span><span>now</span>
          </div>
        </div>

        {/* Data Store Health */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-[#E2E8E4] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#13221C]">Data Store Health</h3>
              <p className="text-[11px] text-[#687870] mt-0.5">Polyglot persistence layer</p>
            </div>
            <Database className="w-4 h-4 text-[#687870]" />
          </div>
          <div className="space-y-4">
            {STORES.map(store => <StoreRow key={store.name} store={store} />)}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3 rounded-2xl bg-gradient-to-b from-[#52b788] to-[#1b4332] p-6 shadow-sm text-white flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-[#d8f3dc]" />
            <h3 className="text-sm font-bold">Admin Actions</h3>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[
              { icon: Terminal, label: 'Run DB Migration', color: 'hover:bg-white/10' },
              { icon: RefreshCw, label: 'Flush Redis Cache', color: 'hover:bg-white/10' },
              { icon: Bell, label: 'Broadcast Alert', color: 'hover:bg-yellow-800/40' },
              { icon: Ban, label: 'Global Rate Limit', color: 'hover:bg-rose-800/40' },
              { icon: Layers, label: 'View Kafka Topics', color: 'hover:bg-white/10' },
              { icon: ExternalLink, label: 'Open Grafana', color: 'hover:bg-white/10' },
            ].map(({ icon: Icon, label, color }) => (
              <button key={label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 ${color} transition-colors text-left group`}>
                <Icon className="w-3.5 h-3.5 text-[#d8f3dc] shrink-0" />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Services Table + Event Log ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Microservice Health */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E2E8E4] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#13221C]">Microservice Health</h3>
              <p className="text-[11px] text-[#687870] mt-0.5">All 7 services · CQRS architecture</p>
            </div>
            {degradedServices > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-[10px] font-bold text-yellow-700">
                <AlertTriangle className="w-3 h-3" /> {degradedServices} Degraded
              </span>
            )}
          </div>
          <div>
            {SERVICES.map(svc => <ServiceRow key={svc.name} svc={svc} />)}
          </div>
        </div>

        {/* Platform Event Log */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E2E8E4] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#13221C]">Platform Event Log</h3>
              <p className="text-[11px] text-[#687870] mt-0.5">Auth, ingest, tenant, and system events</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#52b788] animate-pulse" />
              <span className="text-[10px] font-bold text-[#687870]">Streaming</span>
            </div>
          </div>
          <div>
            {RECENT_EVENTS.map((ev, i) => <EventLog key={i} event={ev} />)}
          </div>
        </div>
      </div>

      {/* ─── Tenant Management Table ────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-[#E2E8E4] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E4]">
          <div>
            <h3 className="text-sm font-bold text-[#13221C] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#52b788]" />
              Tenant Management
            </h3>
            <p className="text-[11px] text-[#687870] mt-0.5">Full control over all workspaces — suspend, view, or elevate access</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#687870]">{tenants.length} tenants</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#52b788] hover:bg-[#40916c] text-white text-xs font-bold rounded-lg transition-colors">
              <Users className="w-3.5 h-3.5" />
              <span>New Tenant</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F0F2F1] bg-[#FAFBFB]">
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#687870]">Workspace</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#687870] hidden sm:table-cell">Plan</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#687870] hidden md:table-cell">Ingest Rate</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#687870] hidden lg:table-cell">Issues</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#687870]">Status</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#687870] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => <TenantRow key={t.id} tenant={t} onToggle={toggleTenant} />)}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
