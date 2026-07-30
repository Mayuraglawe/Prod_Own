'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ExternalLink, PowerOff, ShieldAlert,
  ChevronDown, Search
} from 'lucide-react';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, ResponsiveContainer, Cell, CartesianGrid, Tooltip
} from 'recharts';
import { LoadingSpinner } from './loading-spinner';

type HealthData = {
  streamLag: number;
  queues: {
    fingerprints: { waiting: number; active: number; failed: number; delayed: number };
    alerts: { waiting: number; active: number; failed: number; delayed: number };
  };
};

type PlatformSummary = {
  totalTenants: number;
  totalUsers: number;
  totalSources: number;
  totalOpenIssues: number;
  totalEvents: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tenant = any; // Will match what's returned from /api/admin/tenants

export function SuperAdminOverview() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for DB cold starts

    try {
      const [healthRes, platformRes, tenantsRes] = await Promise.all([
        fetch('/api/admin/platform/health', { signal: controller.signal }),
        fetch('/api/admin/platform', { signal: controller.signal }),
        fetch('/api/admin/tenants', { signal: controller.signal })
      ]);
      clearTimeout(timeoutId);

      if (!healthRes.ok || !platformRes.ok || !tenantsRes.ok) {
        throw new Error('One or more API requests failed with non-2xx status');
      }

      const healthData = await healthRes.json();
      const platformData = await platformRes.json();
      const tenantsData = await tenantsRes.json();

      if (healthData.health) setHealth(healthData.health);
      if (platformData.summary) setSummary(platformData.summary);
      if (tenantsData.tenants) {
        // Sort by event usage roughly (events usually correlate with _count.issues for now)
        const sorted = [...tenantsData.tenants].sort((a: Tenant, b: Tenant) => (b._count?.issues || 0) - (a._count?.issues || 0));
        setTenants(sorted.slice(0, 5)); // Top 5
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('[Platform Overview] API requests timed out after 30 seconds (backend may be down).');
      } else {
        console.error('[Platform Overview] API fetch error:', err);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleImpersonate = async (tenantId: string) => {
    try {
      await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-64 items-center justify-center space-y-6">
        <LoadingSpinner />
        <div className="text-slate-400 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Platform Overview...</div>
      </div>
    );
  }

  // MOCK DATA for visual polish (MRR, Throughput, historical queue data)
  const sparklineData = Array.from({length: 20}, () => ({ value: 40 + Math.random() * 20 }));
  const sparklineData2 = Array.from({length: 20}, () => ({ value: 80 + Math.random() * 20 }));
  const sparklineData3 = Array.from({length: 20}, () => ({ value: 15 + Math.random() * 10 }));
  const sparklineData4 = Array.from({length: 20}, (_, i) => ({ value: 100 + i * 2 + Math.random() * 5 }));

  const pipelineHistory = Array.from({length: 60}, (_, i) => ({
    time: i,
    lag: Math.max(0, (health?.streamLag || 100) + (Math.random() - 0.5) * 50)
  }));

  const queueData = [
    { name: 'Pending', value: (health?.queues.fingerprints.waiting || 0) + (health?.queues.alerts.waiting || 0) },
    { name: 'Failed', value: (health?.queues.fingerprints.failed || 0) + (health?.queues.alerts.failed || 0) },
    { name: 'Retrying', value: (health?.queues.fingerprints.delayed || 0) + (health?.queues.alerts.delayed || 0) },
    { name: 'Processed', value: 8540 } // Mock processed count
  ];

  return (
    <div className="font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Global platform health, usage, and metrics.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for orgs/users" 
              className="bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors w-64 shadow-sm"
            />
          </div>
          <button className="bg-[#0B4F3A] hover:bg-[#0B4F3A]/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
            Impersonate Organization <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Organizations" 
          value={summary?.totalTenants.toLocaleString() || '0'} 
          trend="+5%" trendColor="text-emerald-600"
          chartData={sparklineData} chartColor="#10B981"
        />
        <StatCard 
          title="Active Platform Users" 
          value={summary?.totalUsers.toLocaleString() || '0'} 
          trend="+2%" trendColor="text-emerald-400"
          chartData={sparklineData2} chartColor="#F59E0B"
        />
        <StatCard 
          title="Global Event Throughput" 
          value="15.4K" suffix="Events/Sec"
          chartData={sparklineData3} chartColor="#3B82F6"
        />
        <StatCard 
          title="Platform MRR" 
          value="$1.2M" 
          chartData={sparklineData4} chartColor="#06B6D4"
        />
      </div>

      {/* MIDDLE SECTION - HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pipeline Health */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-slate-900 font-medium text-sm">Ingest Pipeline Health</h3>
              <p className="text-xs text-slate-500">Redis Streams lag (as status)</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5">
              OK <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
          <div className="flex-1 min-h-[160px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pipelineHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cccccc" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}
                  itemStyle={{ color: '#10B981' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <XAxis dataKey="time" hide={true} />
                <Line type="monotone" dataKey="lag" name="Lag (ms)" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#10B981' }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker Queue */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-slate-900 font-medium text-sm">Worker Queues</h3>
              <p className="text-xs text-slate-500">BullMQ Processing State</p>
            </div>
            <div className="flex gap-1.5 items-center bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold">
              LIVE <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
          <div className="flex-1 min-h-[160px] w-full pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cccccc" />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}
                  itemStyle={{ color: '#64748b' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={48} minPointSize={4}>
                  {queueData.map((entry, index) => {
                    const colors = ['#F59E0B', '#EF4444', '#F97316', '#10B981'];
                    return <Cell key={`cell-${index}`} fill={colors[index]} />;
                  })}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Organizations Table */}
        {/* Top Organizations Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-slate-900 font-semibold text-sm">Active Organizations</h2>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">View All Orgs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-800 uppercase tracking-wider bg-gradient-to-r from-[#cccccc] via-[#e5e5e5] to-white border-b border-slate-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Organization</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Usage</th>
                  <th className="px-6 py-4 font-semibold text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white">
                {tenants.map((t, idx) => {
                  const usage = [60, 55, 30, 85, 20][idx] || 10;
                  const usageColor = usage > 80 ? 'bg-red-500' : usage > 50 ? 'bg-amber-500' : 'bg-emerald-500';
                  const usageBg = usage > 80 ? 'bg-red-50' : usage > 50 ? 'bg-amber-50' : 'bg-emerald-50';
                  const avatarGradients = [
                    'from-blue-500 to-indigo-600',
                    'from-emerald-400 to-teal-600',
                    'from-orange-400 to-red-500',
                    'from-purple-500 to-pink-600',
                    'from-cyan-400 to-blue-500'
                  ];
                  const avatarGrad = avatarGradients[idx % avatarGradients.length];

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{t.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {t.id.slice(0,8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {t.planTier || 'Enterprise'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500 font-medium">Capacity</span>
                            <span className="font-bold text-slate-700">{usage}%</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full ${usageBg} overflow-hidden`}>
                            <div className={`h-full rounded-full ${usageColor} transition-all duration-500`} style={{ width: `${usage}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.suspended ? (
                             <button className="flex items-center justify-center w-8 h-8 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors" title="Reactivate">
                                <PowerOff className="w-4 h-4" />
                             </button>
                          ) : (
                             <button className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors" title="Suspend">
                                <PowerOff className="w-4 h-4" />
                             </button>
                          )}
                          <button 
                            onClick={() => handleImpersonate(t.id)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors"
                            title="Impersonate"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Anomalies */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-slate-900 font-medium text-sm">Platform Alerts & Anomalies</h3>
          </div>
          <div className="p-6 flex-1 relative">
             <div className="absolute left-[41px] top-10 bottom-10 w-[2px] bg-slate-100"></div>

             <div className="space-y-5 relative">
               <AlertItem 
                 type="danger" 
                 title="Org BetaCorp: Sudden event spike +500% detected" 
                 time="3 minutes ago" 
               />
               <AlertItem 
                 type="info" 
                 title="Org GammaInc: Plan upgraded to Enterprise" 
                 time="1 hour ago" 
               />
               <AlertItem 
                 type="warning" 
                 title="High consumer lag on litetrace:events stream" 
                 time="4 hours ago" 
               />
               <AlertItem 
                 type="info" 
                 title="Super Admin 'Alex' signed in from new IP" 
                 time="1 day ago" 
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, trend, trendColor, suffix, chartData, chartColor }: {
  title: string, value: string, trend?: string, trendColor?: string, suffix?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: any[], chartColor: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
        {suffix && <span className="text-slate-500 mb-1 text-sm">{suffix}</span>}
        {trend && <span className={`text-xs font-semibold mb-1.5 ${trendColor}`}>{trend}</span>}
      </div>
      <div className="h-10 w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
             <defs>
              <linearGradient id={`grad-${chartColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={chartColor} fillOpacity={1} fill={`url(#grad-${chartColor.replace('#', '')})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface AlertItemProps {
  type: 'security' | 'warning' | 'info' | 'danger';
  message?: string;
  title?: string;
  time: string;
  severity?: 'critical' | 'warning' | 'info';
}

function AlertItem({ type, message, title, time, severity }: AlertItemProps) {
  const Icon = type === 'security' || type === 'danger' ? ShieldAlert : AlertTriangle;
  
  const isDanger = severity === 'critical' || type === 'danger';
  const iconClass = isDanger 
    ? 'bg-red-50 text-red-600 border-red-100' 
    : 'bg-amber-50 text-amber-600 border-amber-100';
  
  const boxClass = isDanger 
    ? 'bg-white border-red-100 hover:border-red-200 hover:shadow-md hover:bg-red-50/30' 
    : 'bg-white border-amber-100 hover:border-amber-200 hover:shadow-md hover:bg-amber-50/30';
  
  return (
    <div className="flex gap-4 relative z-10 group cursor-default">
      <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${iconClass} shadow-sm transition-all duration-200 mt-0.5`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className={`flex-1 p-3.5 rounded-xl border ${boxClass} shadow-sm transition-all duration-200`}>
        <div className="flex justify-between items-start gap-4">
          <p className="text-sm font-medium text-slate-800 leading-snug">{message || title}</p>
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0 pt-0.5">{time}</span>
        </div>
      </div>
    </div>
  );
}
