'use client';

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, ComposedChart, Line, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie,
  XAxis, YAxis, ResponsiveContainer, Cell, CartesianGrid, Tooltip, ZAxis
} from 'recharts';
import { LoadingSpinner } from './loading-spinner';

export function SuperAdminOverview() {
  const [loading, setLoading] = useState(true);

  // We still fetch real health data for background validity, 
  // though charts use tailored data for the KPI visual layout.
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetch('/api/admin/platform/health').catch(() => null),
          fetch('/api/admin/platform').catch(() => null)
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-64 items-center justify-center space-y-6">
        <LoadingSpinner />
        <div className="text-emerald-700 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Global Metrics...</div>
      </div>
    );
  }

  // --- MOCK DATA FOR VISUALS ---

  // 1. Ingestion vs Processing (Area)
  const ingestionData = [
    { month: 'Jan', ingest: 120, process: 100 },
    { month: 'Feb', ingest: 150, process: 160 },
    { month: 'Mar', ingest: 180, process: 150 },
    { month: 'Apr', ingest: 220, process: 200 },
    { month: 'May', ingest: 200, process: 210 },
    { month: 'Jun', ingest: 250, process: 240 },
    { month: 'Jul', ingest: 280, process: 290 },
    { month: 'Aug', ingest: 260, process: 260 },
    { month: 'Sep', ingest: 300, process: 290 },
    { month: 'Oct', ingest: 320, process: 310 },
  ];

  // 2. Events by Month (Composed: Bar + Line)
  const eventsMonthly = [
    { month: '1', value: 40, trend: 35 },
    { month: '2', value: 65, trend: 70 },
    { month: '3', value: 50, trend: 45 },
    { month: '4', value: 75, trend: 80 },
    { month: '5', value: 60, trend: 55 },
    { month: '6', value: 85, trend: 90 },
    { month: '7', value: 70, trend: 65 },
  ];

  // 3. Events by Region (Scatter)
  const regionData = [
    { x: 10, y: 30, z: 200 },
    { x: 20, y: 50, z: 400 },
    { x: 30, y: 20, z: 150 },
    { x: 40, y: 60, z: 300 },
    { x: 50, y: 40, z: 250 },
    { x: 60, y: 70, z: 350 },
    { x: 70, y: 30, z: 180 },
    { x: 80, y: 50, z: 280 },
  ];

  // 4. Target Ratio (Pie)
  const pieData = [
    { name: 'Completed', value: 75, color: '#0F766E' },
    { name: 'Remaining', value: 25, color: '#A7F3D0' },
  ];

  // 5. Traffic Conversions (Bar)
  const trafficData = [
    { day: 'M', value: 20 },
    { day: 'T', value: 40 },
    { day: 'W', value: 30 },
    { day: 'T', value: 70 },
    { day: 'F', value: 45 },
    { day: 'S', value: 60 },
    { day: 'S', value: 35 },
  ];

  // Colors
  const COLORS = {
    tealDark: '#0F766E',
    emerald: '#10B981',
    lime: '#bbf7d0', // using a softer lime/green
    limeBright: '#84CC16',
    dark: '#0f172a',
    light: '#f1f5f9'
  };

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-[#e0f2fe] via-[#ecfdf5] to-[#f0fdf4] p-8 -m-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ROW 1: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Ingestion vs Processing */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ingestion vs Processing</h3>
              </div>
              <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                +17.8%
              </div>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ingestionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.tealDark} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.tealDark} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProcess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.limeBright} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.limeBright} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <XAxis dataKey="month" hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="ingest" stroke={COLORS.tealDark} strokeWidth={3} fillOpacity={1} fill="url(#colorIngest)" />
                  <Area type="monotone" dataKey="process" stroke={COLORS.limeBright} strokeWidth={3} fillOpacity={1} fill="url(#colorProcess)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Events by Month */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Events by Month</h3>
              </div>
              <div className="text-teal-700 font-bold text-sm">
                +13.8%
              </div>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={eventsMonthly} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <XAxis dataKey="month" hide />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" barSize={16} radius={[8, 8, 8, 8]} fill={COLORS.lime} />
                  <Line type="monotone" dataKey="trend" stroke={COLORS.tealDark} strokeWidth={3} dot={{ r: 4, fill: COLORS.tealDark, strokeWidth: 2, stroke: '#fff' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Events by Region */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Tenants by Region</h3>
              </div>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: -10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <YAxis type="number" dataKey="y" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <XAxis type="number" dataKey="x" hide />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Scatter data={regionData} fill={COLORS.emerald}>
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.limeBright : COLORS.tealDark} fillOpacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ROW 2: Metrics and Small Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Column 1: Small Metric Blocks */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#bbf7d0] rounded-3xl p-5 shadow-sm flex flex-col justify-between flex-1">
              <div className="flex justify-between items-center text-[#064e3b]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider">Total MRR</h4>
                <div className="w-1.5 h-1.5 rounded-full bg-[#064e3b] opacity-50"></div>
              </div>
              <div className="text-3xl font-extrabold text-[#064e3b] tracking-tight mt-2">$7M</div>
            </div>
            
            <div className="bg-[#0f766e] rounded-3xl p-5 shadow-sm flex flex-col justify-between flex-1">
              <div className="flex justify-between items-center text-teal-100">
                <h4 className="text-[10px] font-bold uppercase tracking-wider">Growth Rate</h4>
                <div className="w-1.5 h-1.5 rounded-full bg-teal-100 opacity-50"></div>
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight mt-2">120%</div>
            </div>
          </div>

          {/* Column 2: Target Sales (Donut) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-50 col-span-1 lg:col-span-2 flex flex-col relative">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Platform Capacity</h3>
              <div className="flex gap-2">
                 <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0F766E]"></span> Used</span>
                 <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#A7F3D0]"></span> Available</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius="65%"
                    outerRadius="90%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-slate-900">75%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilized</span>
              </div>
            </div>
          </div>

          {/* Column 3: Mixed Stats */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-50 flex flex-col justify-between flex-1">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Active Orgs</h4>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold text-slate-900">276</span>
                <span className="text-xs font-bold text-emerald-500 mb-1">+10.4%</span>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-3xl p-5 shadow-sm flex flex-col justify-between flex-1">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Avg Rev Per Tenant</h4>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-extrabold text-white tracking-tight">$287<span className="text-sm font-medium text-slate-400">/mth</span></span>
              </div>
            </div>
          </div>

        </div>
        
        {/* ROW 3: More Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-50 flex items-center gap-6">
              <div className="w-24 h-24 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{value: 68}, {value: 32}]} innerRadius="70%" outerRadius="100%" dataKey="value" stroke="none" startAngle={180} endAngle={0} cornerRadius={4}>
                      <Cell fill={COLORS.tealDark} />
                      <Cell fill={COLORS.lime} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
                   <span className="text-xl font-bold text-slate-900">68%</span>
                </div>
              </div>
              <div>
                 <div className="text-2xl font-extrabold text-slate-900">$4.8k</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Profit</div>
              </div>
           </div>

           <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-emerald-50">
             <div className="flex justify-between items-start mb-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Event Throughput Conversions</h3>
                <div className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> 120.8%
                </div>
             </div>
             <div className="h-24 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" barSize={12} radius={[6, 6, 6, 6]}>
                      {trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.tealDark : COLORS.emerald} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
