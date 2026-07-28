'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, AlertTriangle, ExternalLink, PowerOff, ShieldAlert,
  ChevronDown, Search
} from 'lucide-react';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, ResponsiveContainer, Cell
} from 'recharts';

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
    try {
      const [healthRes, platformRes, tenantsRes] = await Promise.all([
        fetch('/api/admin/platform/health'),
        fetch('/api/admin/platform'),
        fetch('/api/admin/tenants')
      ]);

      const healthData = await healthRes.json();
      const platformData = await platformRes.json();
      const tenantsData = await tenantsRes.json();

      if (healthData.health) setHealth(healthData.health);
      if (platformData.summary) setSummary(platformData.summary);
      if (tenantsData.tenants) {
        // Sort by event usage roughly (events usually correlate with _count.issues for now)
        const sorted = [...tenantsData.tenants].sort((a: Tenant, b: Tenant) => b._count.issues - a._count.issues);
        setTenants(sorted.slice(0, 5)); // Top 5
      }
    } catch (err) {
      console.error(err);
    } finally {
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
      <div className="flex h-64 items-center justify-center text-slate-400 font-mono text-sm">
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> INITIALIZING PLATFORM OVERVIEW...
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

  const poolUsage = 82; // Mock PG pool usage

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
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-slate-900 font-medium text-sm">Ingest Pipeline Health</h3>
              <p className="text-xs text-slate-500">Redis Streams lag (as status)</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5">
              OK <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pipelineHistory}>
                <Line type="monotone" dataKey="lag" stroke="#10B981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 px-2">
            <span>10:00</span>
            <span>13:30</span>
            <span>18:00</span>
            <span>18:30</span>
            <span>12:00</span>
          </div>
        </div>

        {/* Worker Queue */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-slate-900 font-medium text-sm">Worker Queues</h3>
              <p className="text-xs text-slate-500">BullMQ Processing State</p>
            </div>
          </div>
          <div className="h-40 w-full pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-slate-900 font-semibold text-sm">Active Organizations</h2>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-medium text-slate-400">Org Name</th>
                  <th className="p-4 font-medium text-slate-400">Plan</th>
                  <th className="p-4 font-medium text-slate-400">Current Usage %</th>
                  <th className="p-4 font-medium text-slate-400">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t, idx) => {
                  const usage = [60, 55, 30, 85, 20][idx] || 10;
                  const usageColor = usage > 80 ? 'bg-red-500' : usage > 50 ? 'bg-emerald-500' : 'bg-blue-500';
                  const usageBg = usage > 80 ? 'bg-red-50' : usage > 50 ? 'bg-emerald-50' : 'bg-blue-50';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-900">{t.name}</td>
                      <td className="p-4 text-slate-600">{t.planTier || 'Enterprise'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-xs w-8">{usage}%</span>
                          <div className={`w-24 h-1.5 rounded-full ${usageBg}`}>
                            <div className={`h-1.5 rounded-full ${usageColor}`} style={{ width: `${usage}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {t.suspended ? (
                             <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
                                <PowerOff className="w-3 h-3" /> Reactivate
                             </button>
                          ) : (
                             <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                                <PowerOff className="w-3 h-3 text-red-500" /> Suspend
                             </button>
                          )}
                          <button 
                            onClick={() => handleImpersonate(t.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-indigo-500" /> Impersonate
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
          <div className="p-5 flex-1 relative">
             <div className="absolute left-7 top-6 bottom-6 w-[2px] bg-slate-100"></div>

             <div className="space-y-6 relative">
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

function AlertItem({ type, message, time, severity }: any) {
  const Icon = type === 'security' ? ShieldAlert : AlertTriangle;
  const colors = severity === 'critical' ? 'text-red-600 bg-red-50 border-red-200' : 'text-amber-600 bg-amber-50 border-amber-200';
  const iconColor = severity === 'critical' ? 'text-red-500 bg-white border-red-100' : 'text-amber-500 bg-white border-amber-100';
  
  return (
    <div className="flex gap-4 relative z-10">
      <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${iconColor} shadow-sm`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className={`flex-1 p-3 rounded-lg border ${colors} shadow-sm`}>
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-slate-900">{message}</p>
          <span className="text-xs text-slate-500 font-mono mt-0.5">{time}</span>
        </div>
      </div>
    </div>
  );
}
