'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  BarChart2,
  Users,
  HelpCircle,
  Search,
  Mail,
  Bell,
  ArrowUpRight,
  Plus,
  Play,
  Pause,
  Square,
  Smartphone,
  Server,
  Cpu,
  Webhook,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

// Prod Own Domain Types
interface ErrorEvent {
  id: string;
  fingerprint: string;
  title: string;
  message: string;
  severity: 'critical' | 'error' | 'warning';
  tenantId: string;
  source: string;
  count: number;
  lastSeen: string;
  stackTrace: string;
  status: 'unresolved' | 'resolved' | 'ignored';
}

interface IngestSource {
  id: string;
  name: string;
  tenantId: string;
  type: 'Fastify' | 'Next.js' | 'BullMQ' | 'OTEL';
  eventsCount: number;
  status: 'active' | 'degraded' | 'offline';
  lastPing: string;
  apiKey: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Engineer' | 'Viewer';
  assignedTask: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'Meeting' | 'Deployment' | 'Maintenance';
  date: string;
}

const MOCK_ERRORS: ErrorEvent[] = [
  {
    id: 'err-101',
    fingerprint: 'fp_pg_timeout_pool',
    title: 'DatabaseTimeoutException: Connection Pool Exhausted',
    message: 'PostgreSQL connection pool max size (20) reached during ingest route query execution.',
    severity: 'critical',
    tenantId: 'tenant-acme',
    source: 'api-server',
    count: 243,
    lastSeen: '2m ago',
    stackTrace: `DatabaseTimeoutException: Connection pool exhausted (limit 20 reached)
  at Pool.acquire (packages/db/src/client.ts:15:22)
  at async PrismaClient._request (apps/api/src/routes/ingest.ts:33:5)
  at async handler (apps/api/src/server.ts:42:12)`,
    status: 'unresolved'
  },
  {
    id: 'err-102',
    fingerprint: 'fp_null_session_ref',
    title: 'TypeError: Cannot read properties of undefined (tenantId)',
    message: 'Attempted to access tenantId property on unauthenticated session payload.',
    severity: 'error',
    tenantId: 'tenant-stark',
    source: 'web-dashboard',
    count: 87,
    lastSeen: '14m ago',
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'tenantId')
  at callback (apps/web/app/page.tsx:42:18)
  at async nextAuth (node_modules/next-auth/core/index.js:142:9)`,
    status: 'unresolved'
  },
  {
    id: 'err-103',
    fingerprint: 'fp_razorpay_hmac_fail',
    title: 'RazorpaySignatureVerificationFailed',
    message: 'Webhook signature validation failed. Received hash does not match computed HMAC secret.',
    severity: 'critical',
    tenantId: 'tenant-stark',
    source: 'billing-webhook',
    count: 14,
    lastSeen: '1h ago',
    stackTrace: `RazorpaySignatureVerificationFailed: HMAC mismatch on request payload
  at verify (apps/api/src/routes/payments.ts:24:9)
  at async handler (apps/api/src/routes/payments.ts:42:15)`,
    status: 'unresolved'
  },
  {
    id: 'err-104',
    fingerprint: 'fp_slow_index_scan',
    title: 'QueryWarning: Slow Index Scan on FingerprintJob',
    message: 'Database scan returned >5000 rows. Query execution exceeded 120ms threshold.',
    severity: 'warning',
    tenantId: 'tenant-wayne',
    source: 'worker-process',
    count: 512,
    lastSeen: '3h ago',
    stackTrace: `QueryWarning: Slow Index Scan on FingerprintJob (142ms)
  at FingerprintProcessor (apps/worker/src/worker.ts:28:11)`,
    status: 'resolved'
  }
];

const MOCK_SOURCES: IngestSource[] = [
  { id: 'src-1', name: 'api-server (Fastify Ingest)', tenantId: 'tenant-acme', type: 'Fastify', eventsCount: 14200, status: 'active', lastPing: 'Just now', apiKey: 'po_live_89f2a0b1c9' },
  { id: 'src-2', name: 'web-dashboard (Next.js)', tenantId: 'tenant-stark', type: 'Next.js', eventsCount: 4120, status: 'active', lastPing: '2m ago', apiKey: 'po_live_33e1d2c4f8' },
  { id: 'src-3', name: 'billing-webhook (Razorpay)', tenantId: 'tenant-stark', type: 'Fastify', eventsCount: 310, status: 'active', lastPing: '15m ago', apiKey: 'po_live_99a8b7c6d5' },
  { id: 'src-4', name: 'worker-process (BullMQ)', tenantId: 'tenant-wayne', type: 'BullMQ', eventsCount: 8940, status: 'active', lastPing: 'Just now', apiKey: 'po_live_11f2e3d4c5' },
  { id: 'src-5', name: 'otel-collector (OpenTelemetry)', tenantId: 'tenant-acme', type: 'OTEL', eventsCount: 1840, status: 'degraded', lastPing: '1h ago', apiKey: 'po_live_77c8b9a0e1' }
];

const MOCK_TEAM: TeamMember[] = [
  { id: 'tm-1', name: 'Alexandra Deff', email: 'alexandra@prodown.dev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', role: 'Admin', assignedTask: 'PostgreSQL RLS Migrations', status: 'Completed' },
  { id: 'tm-2', name: 'Edwin Aderike', email: 'edwin@prodown.dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', role: 'Engineer', assignedTask: 'Fastify Helmet Security Rules', status: 'In Progress' },
  { id: 'tm-3', name: 'Isaac Oluwatemilorun', email: 'isaac@prodown.dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', role: 'Engineer', assignedTask: 'BullMQ Fingerprint Deduplication', status: 'Pending' },
  { id: 'tm-4', name: 'David Okhodi', email: 'david@prodown.dev', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80', role: 'Viewer', assignedTask: 'Slack & n8n Alert Webhooks', status: 'In Progress' }
];

const MOCK_CALENDAR: CalendarEvent[] = [
  { id: 'cal-1', title: 'Meeting with Arc Company', time: '02:00 pm - 04:00 pm', type: 'Meeting', date: 'Today' },
  { id: 'cal-2', title: 'PostgreSQL RLS Policy Audit', time: '10:00 am - 11:30 am', type: 'Maintenance', date: 'Tomorrow' },
  { id: 'cal-3', title: 'Deploy Ingest API v1.4.0', time: '05:00 pm - 06:00 pm', type: 'Deployment', date: 'Feb 24, 2026' }
];

export function Dashboard() {
  type NavigationTab = 'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'team' | 'sources' | 'workers' | 'settings' | 'help';
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  
  // Interactive UI state
  const [errorsList, setErrorsList] = useState<ErrorEvent[]>(MOCK_ERRORS);
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isWorkerTracking, setIsWorkerTracking] = useState(true);
  const [uptimeSeconds, setUptimeSeconds] = useState(5048); // 01:24:08
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Live Timer for BullMQ Uptime
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkerTracking) {
      interval = setInterval(() => {
        setUptimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkerTracking]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleResolveError = (id: string) => {
    setErrorsList(prev => prev.map(e => e.id === id ? { ...e, status: 'resolved' } : e));
    if (selectedError?.id === id) {
      setSelectedError(prev => prev ? { ...prev, status: 'resolved' } : null);
    }
  };

  const filteredErrors = errorsList.filter((err) => {
    const matchesSearch =
      err.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.tenantId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || err.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="flex min-h-screen bg-[#F3F5F4] text-[#13221C] font-sans antialiased">
      {/* 1. LEFT SIDEBAR NAVIGATION (Donezo Color Palette: Off-White #F3F5F4, Dark Emerald #0B4F3A Active) */}
      <aside className="w-64 border-r border-[#E2E8E4] bg-[#F3F5F4] p-6 flex flex-col justify-between shrink-0 hidden lg:flex">
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-full bg-[#0B4F3A] flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5 text-[#20C997]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#13221C]">Donezo</span>
              <span className="block text-[10px] uppercase tracking-widest font-semibold text-[#687870]">Prod Own Operations</span>
            </div>
          </div>

          {/* Navigation Section: MENU */}
          <div className="space-y-2">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">Menu</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-[#0B4F3A] text-white shadow-sm'
                    : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
                {activeTab === 'dashboard' && <span className="w-2 h-2 rounded-full bg-[#20C997]"></span>}
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-[#0B4F3A] text-white shadow-sm'
                    : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks / Errors</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#E6F7F0] text-[#0B4F3A]">12+</span>
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-[#0B4F3A] text-white shadow-sm'
                    : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Calendar</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-[#0B4F3A] text-white shadow-sm'
                    : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'team'
                    ? 'bg-[#0B4F3A] text-white shadow-sm'
                    : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Navigation Section: INFRASTRUCTURE */}
          <div className="space-y-2">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">Infrastructure</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('sources')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'sources'
                    ? 'bg-[#0B4F3A] text-white shadow-sm'
                    : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4" />
                  <span>Sources & SDKs</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('workers')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'workers'
                    ? 'bg-[#0B4F3A] text-white shadow-sm'
                    : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4" />
                  <span>BullMQ Workers</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#0B4F3A] text-white shadow-sm'
                    : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Webhook className="w-4 h-4" />
                  <span>Alert Hooks & Billing</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Navigation Section: GENERAL */}
          <div className="space-y-2">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">General</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'help'
                    ? 'bg-[#0B4F3A] text-white shadow-sm'
                    : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help & Docs</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Dark Emerald Promo Card (Donezo Theme Artwork) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#052A1F] via-[#094231] to-[#0B4F3A] p-5 text-white shadow-md">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#20C997]/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center mb-3 backdrop-blur-sm">
            <Smartphone className="w-4 h-4 text-[#20C997]" />
          </div>
          <h4 className="text-sm font-bold tracking-tight">Download our Mobile App</h4>
          <p className="text-[11px] text-gray-300 mt-1 mb-4 leading-snug">Get real-time push alerts for critical incidents.</p>
          <button className="w-full py-2 bg-[#20C997] hover:bg-[#1BB385] text-[#052A1F] font-bold text-xs rounded-full shadow-sm transition-all">
            Download
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        {/* TOP HEADER BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search Task / Errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 bg-white border border-[#E2E8E4] rounded-full text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0B4F3A]/20 transition-all shadow-sm"
            />
            <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold text-[#687870] bg-[#F3F5F4] border border-[#E2E8E4] rounded-md">
              ⌘F
            </kbd>
          </div>

          {/* Right Header Actions & User Avatar */}
          <div className="flex items-center gap-3 justify-end">
            <button className="w-10 h-10 rounded-full bg-white border border-[#E2E8E4] flex items-center justify-center text-[#687870] hover:text-[#0B4F3A] hover:bg-[#E6F7F0] transition-all shadow-sm">
              <Mail className="w-4 h-4" />
            </button>
            <button className="relative w-10 h-10 rounded-full bg-white border border-[#E2E8E4] flex items-center justify-center text-[#687870] hover:text-[#0B4F3A] hover:bg-[#E6F7F0] transition-all shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Totok Michael"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#0B4F3A]/20"
              />
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-[#13221C] leading-tight">Totok Michael</span>
                <span className="block text-[11px] text-[#687870]">11michael00@gmail.com</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE TITLE & HEADER ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#13221C] tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'tasks' && 'Tasks & Error Telemetry'}
              {activeTab === 'calendar' && 'Calendar & Maintenance Schedules'}
              {activeTab === 'analytics' && 'Ingestion Analytics & Performance'}
              {activeTab === 'team' && 'Team Collaboration'}
              {activeTab === 'sources' && 'Ingest Sources & SDKs'}
              {activeTab === 'workers' && 'BullMQ Background Workers'}
              {activeTab === 'settings' && 'Alert Hooks & Razorpay Payments'}
              {activeTab === 'help' && 'Documentation & Help Center'}
            </h1>
            <p className="text-xs lg:text-sm text-[#687870] mt-0.5">
              Plan, prioritize, and accomplish your tasks with ease
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0B4F3A] hover:bg-[#083E2D] text-white font-bold text-xs lg:text-sm rounded-full shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-[#E2E8E4] text-[#13221C] font-bold text-xs lg:text-sm rounded-full shadow-sm transition-all">
              <span>Import Data</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: DASHBOARD (PRIMARY DONEZO OVERVIEW UI SCREEN) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 4 TOP STAT CARDS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Projects (Dark Green Gradient Card) */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B4F3A] via-[#094231] to-[#052A1F] p-6 text-white shadow-md flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-100">Total Projects</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold tracking-tight">24</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#20C997]/20 text-[#20C997] text-[10px] font-bold">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Increased from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Ended Projects */}
              <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#687870]">Ended Projects</span>
                  <div className="w-8 h-8 rounded-full border border-[#E2E8E4] flex items-center justify-center text-[#13221C]">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold text-[#13221C] tracking-tight">10</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#687870]">
                    <span className="font-semibold text-emerald-600">↗ Increased</span>
                    <span>from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Running Projects */}
              <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#687870]">Running Projects</span>
                  <div className="w-8 h-8 rounded-full border border-[#E2E8E4] flex items-center justify-center text-[#13221C]">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold text-[#13221C] tracking-tight">12</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#687870]">
                    <span className="font-semibold text-emerald-600">↗ Increased</span>
                    <span>from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Pending Project */}
              <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#687870]">Pending Project</span>
                  <div className="w-8 h-8 rounded-full border border-[#E2E8E4] flex items-center justify-center text-[#13221C]">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-extrabold text-[#13221C] tracking-tight">2</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#687870]">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">On Discuss</span>
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
                    <span className="absolute -top-6 px-1.5 py-0.5 bg-[#20C997] text-[#052A1F] text-[9px] font-extrabold rounded-md shadow-sm">
                      34%
                    </span>
                    <div className="w-full bg-[#20C997] rounded-full h-32"></div>
                    <span className="text-[11px] font-bold text-[#0B4F3A]">T</span>
                  </div>
                  {/* Wed (Dark Emerald Green) */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-[#0B4F3A] rounded-full h-40"></div>
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
                  onClick={() => setActiveTab('calendar')}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#0B4F3A] hover:bg-[#083E2D] text-white font-bold text-xs rounded-full shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Meeting</span>
                </button>
              </div>

              {/* PROJECT LIST CARD (4 Cols) */}
              <div className="lg:col-span-4 rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#13221C]">Project</h3>
                  <button onClick={() => setActiveTab('tasks')} className="flex items-center gap-1 text-xs font-bold text-[#0B4F3A] hover:underline">
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                {/* List of Projects */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer" onClick={() => setActiveTab('tasks')}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">⚡</div>
                      <div>
                        <h5 className="text-xs font-bold text-[#13221C]">Develop API Endpoints</h5>
                        <p className="text-[10px] text-[#687870]">Due date: Feb 24, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer" onClick={() => setActiveTab('tasks')}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">🛡️</div>
                      <div>
                        <h5 className="text-xs font-bold text-[#13221C]">Onboarding Flow</h5>
                        <p className="text-[10px] text-[#687870]">Due date: Feb 26, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer" onClick={() => setActiveTab('tasks')}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">✨</div>
                      <div>
                        <h5 className="text-xs font-bold text-[#13221C]">Build Dashboard</h5>
                        <p className="text-[10px] text-[#687870]">Due date: Mar 01, 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer" onClick={() => setActiveTab('tasks')}>
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
                  <button onClick={() => setActiveTab('team')} className="flex items-center gap-1 px-3 py-1 bg-white border border-[#E2E8E4] text-[#13221C] font-bold text-[11px] rounded-full hover:bg-gray-50 transition-all">
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
                        tm.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
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
                    <path d="M 15 80 A 65 65 0 0 1 95 22" fill="none" stroke="#0B4F3A" strokeWidth="18" strokeLinecap="round" />
                  </svg>
                  <div className="text-center mt-[-2.5rem]">
                    <span className="text-3xl font-extrabold text-[#13221C] tracking-tight">41%</span>
                    <span className="block text-[11px] text-[#687870] font-semibold">Project Ended</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2 text-[10px] text-[#687870]">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0B4F3A]"></span><span>Completed</span></div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#20C997]"></span><span>In Progress</span></div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#CBD5D0]"></span><span>Pending</span></div>
                </div>
              </div>

              {/* TIME TRACKER DARK CARD (4 Cols) */}
              <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-[#052A1F] via-[#094231] to-[#0B4F3A] p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 bg-wave-dark pointer-events-none opacity-60"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-100">Time Tracker</span>
                </div>
                <div className="relative z-10 py-6 text-center">
                  <div className="text-4xl font-extrabold tracking-wider font-mono drop-shadow-sm">
                    {formatTimer(uptimeSeconds)}
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <button onClick={() => setIsWorkerTracking(!isWorkerTracking)} className="w-10 h-10 rounded-full bg-white text-[#052A1F] flex items-center justify-center shadow-sm hover:scale-105 transition-all">
                    {isWorkerTracking ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <button onClick={() => { setIsWorkerTracking(false); setUptimeSeconds(0); }} className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all">
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TASKS & ERRORS MANAGEMENT UI SCREEN */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#13221C]">Tasks & Error Telemetry Stream</h3>
                  <p className="text-xs text-[#687870]">Filter, inspect stack traces, and manage error fingerprints</p>
                </div>
                <div className="flex items-center gap-2">
                  {['all', 'critical', 'error', 'warning'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all border ${
                        severityFilter === sev
                          ? 'bg-[#0B4F3A] text-white border-[#0B4F3A]'
                          : 'bg-[#F3F5F4] text-[#687870] border-[#E2E8E4] hover:bg-[#E6F7F0]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error List */}
              <div className="space-y-3">
                {filteredErrors.map((err) => (
                  <div key={err.id} className="p-4 rounded-2xl border border-[#E2E8E4] hover:border-[#0B4F3A]/30 hover:shadow-sm transition-all space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mr-2 border ${
                          err.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          err.severity === 'error' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {err.severity}
                        </span>
                        <h4 className="inline text-sm font-bold text-[#13221C]">{err.title}</h4>
                        <p className="text-xs text-[#687870] mt-1">{err.message}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#13221C] block">{err.count} occurrences</span>
                        <span className="text-[10px] text-[#687870]">{err.lastSeen}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E2E8E4]">
                      <span className="font-mono text-[#0B4F3A] text-[11px] font-semibold">{err.tenantId} • {err.source}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedError(selectedError?.id === err.id ? null : err)}
                          className="px-3 py-1 bg-[#F3F5F4] hover:bg-[#E6F7F0] text-[#0B4F3A] font-bold text-xs rounded-full border border-[#E2E8E4]"
                        >
                          {selectedError?.id === err.id ? 'Hide Trace' : 'View Trace'}
                        </button>
                        {err.status === 'unresolved' ? (
                          <button
                            onClick={() => handleResolveError(err.id)}
                            className="px-3 py-1 bg-[#0B4F3A] hover:bg-[#083E2D] text-white font-bold text-xs rounded-full"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                            Resolved ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stack Trace Drawer */}
                    {selectedError?.id === err.id && (
                      <div className="mt-3 p-4 rounded-xl bg-[#052A1F] text-emerald-300 font-mono text-xs overflow-x-auto border border-[#0B4F3A]">
                        <p className="text-gray-400 text-[10px] mb-2 font-sans font-semibold">// Raw Ingested Stack Trace</p>
                        <pre>{err.stackTrace}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CALENDAR & SCHEDULES UI SCREEN */}
        {activeTab === 'calendar' && (
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
        )}

        {/* VIEW 4: ANALYTICS UI SCREEN */}
        {activeTab === 'analytics' && (
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#13221C]">Ingestion Analytics & Performance</h3>
              <p className="text-xs text-[#687870]">Real-time telemetry event throughput and latency breakdown</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-emerald-50/50">
                <span className="text-xs font-bold text-[#687870]">Avg Ingest Latency</span>
                <div className="text-2xl font-extrabold text-[#0B4F3A] mt-1">14.2 ms</div>
              </div>
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-emerald-50/50">
                <span className="text-xs font-bold text-[#687870]">Peak Throughput</span>
                <div className="text-2xl font-extrabold text-[#0B4F3A] mt-1">8,420 req/m</div>
              </div>
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-emerald-50/50">
                <span className="text-xs font-bold text-[#687870]">Scrubbed Secrets</span>
                <div className="text-2xl font-extrabold text-[#0B4F3A] mt-1">1,240 tokens</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: TEAM COLLABORATION UI SCREEN */}
        {activeTab === 'team' && (
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#13221C]">Team Collaboration & Roles</h3>
                <p className="text-xs text-[#687870]">Manage organization workspace members and assigned operational duties</p>
              </div>
              <button className="flex items-center gap-1 px-4 py-2 bg-[#0B4F3A] text-white rounded-full font-bold text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Member
              </button>
            </div>

            <div className="divide-y divide-[#E2E8E4]">
              {MOCK_TEAM.map((tm) => (
                <div key={tm.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: INGEST SOURCES & SDKS UI SCREEN */}
        {activeTab === 'sources' && (
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#13221C]">Ingest Sources & SDK Credentials</h3>
                <p className="text-xs text-[#687870]">Manage client API keys and HTTP telemetry endpoints</p>
              </div>
              <button className="flex items-center gap-1 px-4 py-2 bg-[#0B4F3A] text-white rounded-full font-bold text-xs">
                <Plus className="w-3.5 h-3.5" /> Register Source
              </button>
            </div>

            <div className="space-y-4">
              {MOCK_SOURCES.map((src) => (
                <div key={src.id} className="p-4 rounded-2xl border border-[#E2E8E4] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0B4F3A] font-bold text-[10px] border border-emerald-200">
                        {src.type}
                      </span>
                      <h4 className="text-sm font-bold text-[#13221C]">{src.name}</h4>
                    </div>
                    <p className="text-xs text-[#687870]">Tenant: {src.tenantId} • Events: {src.eventsCount.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="px-3 py-1 rounded-lg bg-[#F3F5F4] text-xs font-mono text-[#0B4F3A] border border-[#E2E8E4]">
                      {src.apiKey}
                    </code>
                    <button
                      onClick={() => handleCopy(src.id, src.apiKey)}
                      className="p-2 rounded-full bg-[#F3F5F4] hover:bg-[#E6F7F0] text-[#0B4F3A] transition-all"
                    >
                      {copiedKeyId === src.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 7: BULLMQ WORKERS UI SCREEN */}
        {activeTab === 'workers' && (
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#13221C]">BullMQ Background Workers</h3>
                <p className="text-xs text-[#687870]">Queue concurrency and worker process management</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs border border-emerald-200">
                Concurrency: 4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-gradient-to-br from-[#052A1F] to-[#0B4F3A] text-white">
                <span className="text-xs text-emerald-200 font-semibold">Queue: fingerprints</span>
                <div className="text-3xl font-extrabold mt-2 font-mono">{formatTimer(uptimeSeconds)}</div>
                <p className="text-xs text-gray-300 mt-2">Active jobs processing stack traces</p>
              </div>
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] flex flex-col justify-between">
                <div>
                  <span className="text-xs text-[#687870] font-bold">Redis Connection</span>
                  <h4 className="text-base font-bold text-[#13221C] mt-1">redis://localhost:6379</h4>
                </div>
                <button className="py-2 px-4 bg-[#0B4F3A] text-white rounded-full font-bold text-xs">
                  Restart Worker Process
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: ALERT HOOKS & BILLING UI SCREEN */}
        {activeTab === 'settings' && (
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#13221C]">Alert Hooks & Razorpay Billing</h3>
              <p className="text-xs text-[#687870]">Configure Slack webhooks, n8n integrations, and Razorpay subscription webhooks</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-[#E2E8E4] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#13221C]">Slack Webhook Integration</h4>
                  <p className="text-xs text-[#687870]">Dispatch critical error alerts directly to #incidents channel</p>
                </div>
                <button className="px-4 py-2 bg-[#0B4F3A] text-white font-bold text-xs rounded-full">
                  Test Slack Alert
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-[#E2E8E4] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#13221C]">n8n Workflow Webhook</h4>
                  <p className="text-xs text-[#687870]">Trigger custom n8n automation pipelines on error events</p>
                </div>
                <button className="px-4 py-2 bg-[#0B4F3A] text-white font-bold text-xs rounded-full">
                  Test n8n Alert
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-[#E2E8E4] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#13221C]">Razorpay Webhook Endpoint</h4>
                  <p className="text-xs text-[#687870]">Enqueued to BullMQ billing queue for async processing</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                  Active (202 Accepted)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 9: HELP & DOCUMENTATION UI SCREEN */}
        {activeTab === 'help' && (
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#13221C]">Documentation & Help Center</h3>
              <p className="text-xs text-[#687870]">Guides for SDK installation, RLS security, and fingerprint deduplication</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] space-y-2">
                <h4 className="text-sm font-bold text-[#13221C]">PostgreSQL RLS Architecture</h4>
                <p className="text-xs text-[#687870]">Learn how Row-Level Security policies isolate tenant multi-tenancy data in Postgres.</p>
                <a href="/PROJECT_GOVERNANCE_AND_DEVELOPMENT_GUIDELINES.md" className="inline-flex items-center gap-1 text-xs font-bold text-[#0B4F3A]">
                  Read Guidelines <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] space-y-2">
                <h4 className="text-sm font-bold text-[#13221C]">Fastify Ingest Endpoint Specs</h4>
                <p className="text-xs text-[#687870]">POST /ingest specs for sending raw telemetry payloads to BullMQ queues.</p>
                <a href="/apps/api/AGENTS.md" className="inline-flex items-center gap-1 text-xs font-bold text-[#0B4F3A]">
                  View API Specs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
