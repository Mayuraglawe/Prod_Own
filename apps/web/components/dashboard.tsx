'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Activity,
  CreditCard,
  Settings,
  Terminal,
  Zap,
  RefreshCw,
  Search,
  Cpu,
  Globe,
  Server,
  Key,
  AlertCircle
} from 'lucide-react';

// Define TS Types for our dashboard state
interface ErrorEvent {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'error' | 'warning';
  tenantId: string;
  source: string;
  count: number;
  lastSeen: string;
  stackTrace: string;
  metadata: {
    ip: string;
    browser: string;
    os: string;
    url: string;
  };
}

interface WorkerJob {
  id: string;
  name: string;
  status: 'active' | 'waiting' | 'failed' | 'completed';
  progress: number;
  durationMs: number;
  timestamp: string;
}

// Initial Mock Data to ensure the dashboard is fully loaded and beautiful out-of-the-box
const INITIAL_ERRORS: ErrorEvent[] = [
  {
    id: 'err-1',
    title: 'DatabaseTimeoutException',
    message: 'Connection pool exhausted while trying to acquire connection from PostgreSQL host.',
    severity: 'critical',
    tenantId: 'tenant-12',
    source: 'api-server',
    count: 243,
    lastSeen: '2 minutes ago',
    stackTrace: `DatabaseTimeoutException: Connection pool exhausted (limit 20 reached)
  at Pool.acquire (packages/db/src/pool.ts:42:15)
  at async PrismaClient._request (node_modules/.pnpm/@prisma+client/runtime/library.js:283:11)
  at async Object.findUnique (apps/api/src/routes/ingest.ts:18:24)
  at async handler (apps/api/src/server.ts:32:12)`,
    metadata: { ip: '192.168.1.101', browser: 'Chrome 124.0', os: 'Linux (Ubuntu)', url: '/api/v1/ingest' }
  },
  {
    id: 'err-2',
    title: 'TypeError: Cannot read properties of undefined (reading "email")',
    message: 'Attempted to read user email properties on a null session reference during auth callback.',
    severity: 'error',
    tenantId: 'tenant-03',
    source: 'web-dashboard',
    count: 87,
    lastSeen: '15 minutes ago',
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'email')
  at Object.callback (apps/web/app/api/auth/route.ts:54:32)
  at async next-auth-handler (node_modules/next-auth/core/index.js:142:9)
  at async Page (apps/web/app/page.tsx:28:18)`,
    metadata: { ip: '47.241.88.2', browser: 'Safari 17.4', os: 'macOS Sonoma', url: '/api/auth/callback' }
  },
  {
    id: 'err-3',
    title: 'RazorpaySignatureVerificationFailed',
    message: 'Webhook signature validation failed. Received hash does not match computed HMAC.',
    severity: 'critical',
    tenantId: 'tenant-08',
    source: 'billing-webhook',
    count: 14,
    lastSeen: '1 hour ago',
    stackTrace: `RazorpaySignatureVerificationFailed: Signature mismatch on request payload
  at verifySignature (apps/api/src/routes/payments.ts:24:19)
  at async handler (apps/api/src/routes/payments.ts:42:9)
  at async Fastify.listen (node_modules/fastify/lib/server.js:183:5)`,
    metadata: { ip: '103.210.12.98', browser: 'Razorpay-Webhook-Bot/1.0', os: 'Cloud', url: '/api/v1/payments/razorpay' }
  },
  {
    id: 'err-4',
    title: 'Warning: Inefficient database index lookup',
    message: 'Index scan returned more than 5000 rows. Query execution exceeded 120ms threshold.',
    severity: 'warning',
    tenantId: 'tenant-12',
    source: 'api-server',
    count: 1102,
    lastSeen: '3 hours ago',
    stackTrace: `Warning: slow query detected
  at InstrumentedPrisma.query (packages/observability/src/otel.ts:68:12)
  at async fetchUserMetrics (apps/api/src/routes/analytics.ts:14:24)
  at async handler (apps/api/src/routes/analytics.ts:38:5)`,
    metadata: { ip: '127.0.0.1', browser: 'Internal', os: 'Linux', url: '/api/v1/analytics/metrics' }
  }
];

const INITIAL_JOBS: WorkerJob[] = [
  { id: 'job-104', name: 'process-fingerprint:err-1', status: 'completed', progress: 100, durationMs: 14, timestamp: '10s ago' },
  { id: 'job-105', name: 'trigger-slack-webhook:err-1', status: 'completed', progress: 100, durationMs: 124, timestamp: '8s ago' },
  { id: 'job-106', name: 'process-fingerprint:err-2', status: 'active', progress: 68, durationMs: 45, timestamp: 'Just now' },
  { id: 'job-107', name: 'sync-razorpay-ledger', status: 'waiting', progress: 0, durationMs: 0, timestamp: 'Queued' },
  { id: 'job-108', name: 'process-fingerprint:err-3', status: 'failed', progress: 40, durationMs: 82, timestamp: '1 hour ago' }
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'apm' | 'billing' | 'settings'>('overview');
  const [errors, setErrors] = useState<ErrorEvent[]>(INITIAL_ERRORS);
  const [jobs, setJobs] = useState<WorkerJob[]>(INITIAL_JOBS);
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(INITIAL_ERRORS[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'error' | 'warning'>('all');
  const [currentTenant, setCurrentTenant] = useState('tenant-12');
  const [slackUrl, setSlackUrl] = useState('https://hooks.slack.com/services/YOUR-SLACK-WEBHOOK-URL');
  const [n8nUrl, setN8nUrl] = useState('https://n8n.mycompany.com/webhook/alert-receiver');
  const [apiKey, setApiKey] = useState('prodown_live_a1b2c3d4e5f6g7h8i9j0');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Ingest simulator options
  const [simType, setSimType] = useState<'NullPointer' | 'NetworkReset' | 'OutOfMemory'>('NullPointer');

  // BullMQ Worker simulation runner
  useEffect(() => {
    const timer = setInterval(() => {
      setJobs((prevJobs) => {
        return prevJobs.map((job) => {
          if (job.status === 'active') {
            const nextProgress = job.progress + Math.floor(Math.random() * 15) + 5;
            if (nextProgress >= 100) {
              return { ...job, status: 'completed', progress: 100, durationMs: job.durationMs + 20 };
            }
            return { ...job, progress: nextProgress, durationMs: job.durationMs + 10 };
          }
          if (job.status === 'waiting' && Math.random() > 0.7) {
            return { ...job, status: 'active', progress: 10 };
          }
          return job;
        });
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Filter errors
  const filteredErrors = useMemo(() => {
    return errors.filter((err) => {
      const matchesSearch =
        err.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        err.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        err.source.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || err.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [errors, searchQuery, severityFilter]);

  // Simulate Trigger Event
  const triggerSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newErrId = `err-${Date.now()}`;
      let newEvent: ErrorEvent;

      if (simType === 'NullPointer') {
        newEvent = {
          id: newErrId,
          title: 'NullPointerException: Cannot read property "userId" of null',
          message: 'An unhandled NullPointer error occurred in session verification logic.',
          severity: 'error',
          tenantId: currentTenant,
          source: 'api-server',
          count: 1,
          lastSeen: 'Just now',
          stackTrace: `NullPointerException: Cannot read property "userId" of null
  at verifySession (apps/api/src/routes/ingest.ts:124:42)
  at async Object.handler (apps/api/src/routes/ingest.ts:87:19)`,
          metadata: { ip: '99.124.8.41', browser: 'Firefox 125.0', os: 'Windows 11', url: '/api/v1/user/profile' }
        };
      } else if (simType === 'NetworkReset') {
        newEvent = {
          id: newErrId,
          title: 'ECONNRESET: Connection reset by peer',
          message: 'Upstream microservice closed TCP port 8080 unexpectedly.',
          severity: 'critical',
          tenantId: currentTenant,
          source: 'worker-node',
          count: 1,
          lastSeen: 'Just now',
          stackTrace: `Error: ECONNRESET: Connection reset by peer
  at TCP.onStreamRead (node:internal/stream_base_commons:217:20)
  at async dispatchJob (apps/worker/src/worker.ts:114:15)`,
          metadata: { ip: '10.0.4.12', browser: 'Internal HttpClient', os: 'Linux (Kubernetes)', url: '/internal/dispatch' }
        };
      } else {
        newEvent = {
          id: newErrId,
          title: 'OutOfMemoryError: Heap limit exceeded',
          message: 'Javascript heap out of memory while buffering large log payload.',
          severity: 'critical',
          tenantId: currentTenant,
          source: 'worker-node',
          count: 1,
          lastSeen: 'Just now',
          stackTrace: `FatalError: JavaScript heap out of memory
  at Array.push (<anonymous>)
  at parseChunk (apps/worker/src/scrubber.ts:245:19)
  at async handleJob (apps/worker/src/worker.ts:42:9)`,
          metadata: { ip: '10.0.8.2', browser: 'Docker Daemon', os: 'Alpine Linux', url: '/api/v1/worker/buffer' }
        };
      }

      setErrors((prev) => {
        // If error with same title exists, just bump count, else add new
        const existingIdx = prev.findIndex((e) => e.title === newEvent.title);
        if (existingIdx !== -1) {
          const updated = [...prev];
          const exist = updated[existingIdx];
          if (exist) {
            updated[existingIdx] = {
              ...exist,
              count: exist.count + 1,
              lastSeen: 'Just now'
            };
          }
          return updated;
        }
        return [newEvent, ...prev];
      });

      // Add a corresponding BullMQ job
      const newJobId = `job-${Math.floor(Math.random() * 1000)}`;
      const newJob: WorkerJob = {
        id: newJobId,
        name: `process-fingerprint:${newEvent.title.split(':')[0]}`,
        status: 'active',
        progress: 10,
        durationMs: 12,
        timestamp: 'Just now'
      };
      setJobs((prev) => [newJob, ...prev]);

      setIsSimulating(false);
      setActiveTab('inbox');
      setSelectedError(newEvent);
    }, 800);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-100 bg-[#070913]">
      {/* Sidebar Panel */}
      <aside className="w-64 shrink-0 border-r border-white/5 bg-slate-950/70 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-lg shadow-cyan-400/20">
              PO
            </div>
            <div>
              <div className="font-bold text-base leading-tight tracking-tight text-white">Prod Own</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">APM Dashboard</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={18} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'inbox'
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Inbox size={18} />
              Error Inbox
              {errors.length > 0 && (
                <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {errors.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('apm')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'apm'
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Activity size={18} />
              APM Metrics
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'billing'
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <CreditCard size={18} />
              Billing Webhooks
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Settings size={18} />
              Integrations
            </button>
          </nav>
        </div>

        {/* Tenant Selector & System Status Footer */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workspace</span>
            <select
              value={currentTenant}
              onChange={(e) => {
                const el = e.target as HTMLSelectElement;
                setCurrentTenant(el.value);
              }}
              title="Select Workspace"
              className="bg-slate-900 border border-white/10 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="tenant-12">Acme Tech (tenant-12)</option>
              <option value="tenant-03">Beta Corp (tenant-03)</option>
              <option value="tenant-08">Gamma Ltd (tenant-08)</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Ingest Engine Active
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950/20 backdrop-blur-3xl">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-slate-950/30">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white capitalize">{activeTab}</h1>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Control Plane</span>
          </div>
          {/* Quick Stats Banner */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Errors 24h</span>
              <span className="text-sm font-black text-rose-500">344</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Latency</span>
              <span className="text-sm font-black text-emerald-400">142ms</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">System load</span>
              <span className="text-sm font-black text-cyan-400">89.2k events</span>
            </div>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* 1. OVERVIEW VIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Alert Notification */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 text-sm">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-rose-500" />
                  <span><strong>Critical Incident detected:</strong> Database connection timeout spike. 243 events logged.</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('inbox');
                    setSelectedError(errors[0] || null);
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/40 rounded-lg text-rose-100 transition-colors"
                >
                  View Trace
                </button>
              </div>

              {/* Performance Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Events Processed</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">+18%</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-white">1,482,883</div>
                    <div className="text-xs text-slate-400 mt-1">Tenant ingest volumes</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fingerprints Generated</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold">+2.4%</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-white">431</div>
                    <div className="text-xs text-slate-400 mt-1">Unique error groupings</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Queue Success Rate</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">Stable</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-white">99.88%</div>
                    <div className="text-xs text-slate-400 mt-1">BullMQ worker processes</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Ingest Latency</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">-4.5%</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-white">8.4ms</div>
                    <div className="text-xs text-slate-400 mt-1">Fastify route response time</div>
                  </div>
                </div>
              </div>

              {/* Main Charts & Job Queues */}
              <div className="grid gap-8 lg:grid-cols-3">
                {/* SVG Live chart */}
                <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Ingest Load Trends</h3>
                    <p className="text-xs text-slate-400">Throughput (events/sec) and Error group logs.</p>
                  </div>
                  {/* SVG Line Chart */}
                  <div className="h-64 mt-6 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <defs>
                        <linearGradient id="qps-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="error-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="5" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="5" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="5" />

                      {/* QPS Line - Smooth Interpolation */}
                      <path
                        d="M0,130 C50,110 80,160 120,90 C160,20 220,120 280,100 C340,80 380,40 420,110 C460,180 480,120 500,100"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="3"
                      />
                      {/* QPS Shading */}
                      <path
                        d="M0,130 C50,110 80,160 120,90 C160,20 220,120 280,100 C340,80 380,40 420,110 C460,180 480,120 500,100 L500,200 L0,200 Z"
                        fill="url(#qps-gradient)"
                      />

                      {/* Errors Line */}
                      <path
                        d="M0,180 C50,170 80,185 120,160 C160,140 220,175 280,150 C340,110 380,160 420,170 C460,130 480,180 500,175"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                    </svg>
                    {/* Y-Axis Labels */}
                    <div className="absolute left-2 top-2 text-[9px] uppercase tracking-wider text-slate-500 font-bold">120 QPS</div>
                    <div className="absolute left-2 top-[80px] text-[9px] uppercase tracking-wider text-slate-500 font-bold">60 QPS</div>
                    <div className="absolute left-2 bottom-2 text-[9px] uppercase tracking-wider text-slate-500 font-bold">0 QPS</div>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>18:00</span>
                    <span>22:00</span>
                    <span>02:00</span>
                    <span>06:00</span>
                    <span>10:00</span>
                    <span>14:00 (Now)</span>
                  </div>
                </div>

                {/* Queue Health BullMQ display */}
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">BullMQ Worker Monitor</h3>
                    <p className="text-xs text-slate-400">Background processing job statuses.</p>
                  </div>

                  <div className="space-y-4 my-6">
                    {/* Active */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span className="text-slate-300 font-medium">Active Jobs</span>
                      </div>
                      <span className="font-black text-white">
                        {jobs.filter((j) => j.status === 'active').length}
                      </span>
                    </div>
                    {/* Waiting */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span className="text-slate-300 font-medium">Waiting / Queued</span>
                      </div>
                      <span className="font-black text-white">
                        {jobs.filter((j) => j.status === 'waiting').length}
                      </span>
                    </div>
                    {/* Failed */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="text-slate-300 font-medium">Failed</span>
                      </div>
                      <span className="font-black text-rose-500">
                        {jobs.filter((j) => j.status === 'failed').length}
                      </span>
                    </div>
                    {/* Completed */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-300 font-medium">Completed</span>
                      </div>
                      <span className="font-black text-white">
                        {jobs.filter((j) => j.status === 'completed').length}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setJobs(INITIAL_JOBS);
                    }}
                    className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={12} />
                    Reset Queue Metrics
                  </button>
                </div>
              </div>

              {/* Active Jobs Stream */}
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-white text-base">Active Worker Job Stream</h3>
                    <p className="text-xs text-slate-400">BullMQ worker processes executing in real-time.</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 border border-white/5 px-3 py-1 rounded-full">
                    Polling Active
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-bold">
                        <th className="pb-3 pr-4">Job ID</th>
                        <th className="pb-3 pr-4">Task Name</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Execution Progress</th>
                        <th className="pb-3 pr-4 text-right">Duration</th>
                        <th className="pb-3 text-right">Queued At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 font-bold text-cyan-400">{job.id}</td>
                          <td className="py-3.5 text-slate-100">{job.name}</td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                job.status === 'active' ? 'bg-cyan-500/20 text-cyan-300' :
                                job.status === 'waiting' ? 'bg-amber-500/20 text-amber-300' :
                                job.status === 'failed' ? 'bg-rose-500/20 text-rose-300' :
                                'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3.5 pr-8">
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  job.status === 'failed' ? 'bg-rose-500' : 'bg-cyan-400'
                                }`}
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3.5 text-right font-sans">{job.durationMs > 0 ? `${job.durationMs}ms` : '-'}</td>
                          <td className="py-3.5 text-right font-sans text-slate-500">{job.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. ERROR INBOX TAB */}
          {activeTab === 'inbox' && (
            <div className="h-[calc(100vh-12rem)] flex gap-8 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Left Pane: Error List */}
              <div className="w-1/3 flex flex-col gap-4 min-w-[320px]">
                {/* Search / Filters */}
                <div className="flex flex-col gap-3 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search error signatures..."
                      value={searchQuery}
                      onChange={(e) => {
                        const el = e.target as HTMLInputElement;
                        setSearchQuery(el.value);
                      }}
                      title="Search error signatures"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-cyan-400 transition-colors text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', 'critical', 'error', 'warning'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setSeverityFilter(sev as typeof severityFilter)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${
                          severityFilter === sev
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Lists container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {filteredErrors.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-8 font-medium">
                      No matching errors found.
                    </div>
                  ) : (
                    filteredErrors.map((err) => (
                      <div
                        key={err.id}
                        onClick={() => setSelectedError(err)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedError?.id === err.id
                            ? 'bg-slate-900 border-cyan-400/50 shadow-md shadow-cyan-400/5'
                            : 'border-white/5 bg-slate-950/40 hover:bg-slate-950/60'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              err.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                              err.severity === 'error' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}
                          >
                            {err.severity}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{err.lastSeen}</span>
                        </div>
                        <h4 className="font-bold text-slate-100 text-xs mt-2 truncate">{err.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{err.message}</p>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5 text-[10px] font-bold text-slate-500">
                          <span className="uppercase tracking-wider">{err.source}</span>
                          <span>Events: <strong className="text-slate-300 font-black">{err.count}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Pane: Detailed Error Trace */}
              <div className="flex-1 flex flex-col border border-white/5 bg-slate-950/40 rounded-2xl overflow-hidden min-w-0">
                {selectedError ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-start gap-4 shrink-0 bg-slate-950/20">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded ${
                              selectedError.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                              selectedError.severity === 'error' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}
                          >
                            {selectedError.severity}
                          </span>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Source: {selectedError.source}
                          </span>
                        </div>
                        <h2 className="text-lg font-black text-white tracking-tight">{selectedError.title}</h2>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{selectedError.message}</p>
                      </div>
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setErrors((prev) => prev.filter((e) => e.id !== selectedError.id));
                            setSelectedError(null);
                          }}
                          className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-sm"
                        >
                          Resolve Issue
                        </button>
                        <button
                          onClick={() => {
                            // Simulate queue process fingerprint again
                            const newJobId = `job-${Math.floor(Math.random() * 1000)}`;
                            const reprocessJob: WorkerJob = {
                              id: newJobId,
                              name: `reprocess-fingerprint:${selectedError.id}`,
                              status: 'active',
                              progress: 10,
                              durationMs: 15,
                              timestamp: 'Just now'
                            };
                            setJobs((prev) => [reprocessJob, ...prev]);
                             window.alert(`Triggered BullMQ job ${newJobId} to recalculate error fingerprint.`);
                          }}
                          className="px-4 py-2 border border-white/10 hover:border-white/20 bg-slate-900 text-xs font-bold rounded-lg text-slate-300 hover:text-white transition-colors"
                        >
                          Re-process Fingerprint
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Stack Trace */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stack Trace</h3>
                        <pre className="p-4 rounded-xl bg-slate-900 border border-white/5 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed shadow-inner">
                          {selectedError.stackTrace}
                        </pre>
                      </div>

                      {/* Metadata Details Grid */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Context Metadata</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
                            <Globe className="text-cyan-400 shrink-0" size={18} />
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Client IP</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{selectedError.metadata.ip}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
                            <Server className="text-cyan-400 shrink-0" size={18} />
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Request URL</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{selectedError.metadata.url}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
                            <Cpu className="text-cyan-400 shrink-0" size={18} />
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Operating System</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{selectedError.metadata.os}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
                            <Globe className="text-cyan-400 shrink-0" size={18} />
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Web Browser</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{selectedError.metadata.browser}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                    <Inbox size={32} className="opacity-40" />
                    Select an error to inspect its stack trace and metadata context.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. APM ANALYTICS TAB */}
          {activeTab === 'apm' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* API Route Performance */}
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6">
                <div>
                  <h3 className="font-bold text-white text-base">API route performance analyzer</h3>
                  <p className="text-xs text-slate-400">Routes monitored in production via OpenTelemetry SDK hooks.</p>
                </div>
                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-bold">
                        <th className="pb-3 pr-4">Endpoint</th>
                        <th className="pb-3 pr-4">Method</th>
                        <th className="pb-3 pr-4">Calls 24h</th>
                        <th className="pb-3 pr-4">Average latency</th>
                        <th className="pb-3 pr-4">P99 latency</th>
                        <th className="pb-3 text-right">Error Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-slate-100 font-bold">/api/v1/ingest</td>
                        <td className="py-3.5 text-emerald-400 font-sans font-black">POST</td>
                        <td className="py-3.5 font-sans">1,241,093</td>
                        <td className="py-3.5 font-sans text-cyan-400">8.4ms</td>
                        <td className="py-3.5 font-sans">124ms</td>
                        <td className="py-3.5 text-right font-sans text-rose-500 font-bold">0.03%</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-slate-100 font-bold">/api/v1/payments/webhook</td>
                        <td className="py-3.5 text-emerald-400 font-sans font-black">POST</td>
                        <td className="py-3.5 font-sans">14,242</td>
                        <td className="py-3.5 font-sans text-cyan-400">42ms</td>
                        <td className="py-3.5 font-sans">280ms</td>
                        <td className="py-3.5 text-right font-sans text-rose-500 font-bold">2.41%</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-slate-100 font-bold">/api/v1/auth/session</td>
                        <td className="py-3.5 text-cyan-400 font-sans font-black">GET</td>
                        <td className="py-3.5 font-sans">872,990</td>
                        <td className="py-3.5 font-sans text-cyan-400">12ms</td>
                        <td className="py-3.5 font-sans">90ms</td>
                        <td className="py-3.5 text-right font-sans text-emerald-400 font-bold">0.00%</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-slate-100 font-bold">/api/v1/tenant/users</td>
                        <td className="py-3.5 text-cyan-400 font-sans font-black">GET</td>
                        <td className="py-3.5 font-sans">12,042</td>
                        <td className="py-3.5 font-sans text-cyan-400">114ms</td>
                        <td className="py-3.5 font-sans">520ms</td>
                        <td className="py-3.5 text-right font-sans text-emerald-400 font-bold">0.00%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Database & Caching layer APM */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Postgres Query Performance */}
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6">
                  <div>
                    <h3 className="font-bold text-white text-base">Prisma Database Query Speeds</h3>
                    <p className="text-xs text-slate-400">Database performance metrics.</p>
                  </div>
                  <div className="space-y-4 mt-6">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400 truncate max-w-xs">SELECT * FROM "Tenant" WHERE id = $1</span>
                        <span className="text-cyan-400 font-bold font-sans">1.2ms (Avg)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full w-[12%]"></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400 truncate max-w-xs">INSERT INTO "FingerprintJob" ($1, $2, ...)</span>
                        <span className="text-cyan-400 font-bold font-sans">14.2ms (Avg)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full w-[45%]"></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400 truncate max-w-xs">SELECT COUNT(*) FROM "AlertEvent" WHERE tenantId = $1</span>
                        <span className="text-amber-500 font-bold font-sans">124.5ms (Avg)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[90%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redis Caching APM */}
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Redis In-Memory Caching</h3>
                    <p className="text-xs text-slate-400">Cache hit/miss analysis (last 24h).</p>
                  </div>
                  <div className="h-28 flex items-center justify-center my-4 relative">
                    {/* Fake Circular chart */}
                    <div className="w-24 h-24 rounded-full border-8 border-slate-900 border-t-cyan-400 border-r-cyan-400 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-black text-white">82%</div>
                        <div className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">Hit Rate</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs pt-4 border-t border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Hit: 431k</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-900"></span> Miss: 94k</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. BILLING WEBHOOKS TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Payment integrations */}
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6">
                <div>
                  <h3 className="font-bold text-white text-base">Razorpay Sync Ledger</h3>
                  <p className="text-xs text-slate-400">Sync logs of billing webhook operations received on the API endpoint.</p>
                </div>
                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-bold">
                        <th className="pb-3 pr-4">Event ID</th>
                        <th className="pb-3 pr-4">Webhook Event</th>
                        <th className="pb-3 pr-4">Amount</th>
                        <th className="pb-3 pr-4">Customer Email</th>
                        <th className="pb-3 pr-4">Sync Status</th>
                        <th className="pb-3 text-right">Received At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-cyan-400 font-bold">pay_log_93814</td>
                        <td className="py-3.5 text-slate-100 font-sans font-bold">payment.captured</td>
                        <td className="py-3.5 text-emerald-400 font-sans font-bold">INR 499.00</td>
                        <td className="py-3.5 font-sans font-medium text-slate-300">billing@acme.com</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300">
                            Synced
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-sans text-slate-500">12 hours ago</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-cyan-400 font-bold">pay_log_93612</td>
                        <td className="py-3.5 text-slate-100 font-sans font-bold">subscription.activated</td>
                        <td className="py-3.5 text-emerald-400 font-sans font-bold">INR 3,999.00</td>
                        <td className="py-3.5 font-sans font-medium text-slate-300">ceo@beta.com</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300">
                            Synced
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-sans text-slate-500">1 day ago</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-cyan-400 font-bold">pay_log_92931</td>
                        <td className="py-3.5 text-slate-100 font-sans font-bold">payment.failed</td>
                        <td className="py-3.5 text-emerald-400 font-sans font-bold">INR 499.00</td>
                        <td className="py-3.5 font-sans font-medium text-slate-300">finance@gamma.in</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 animate-pulse">
                            Failed Validation
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-sans text-slate-500">4 days ago</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. SETTINGS & INTEGRATIONS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
              {/* API Keys Configuration */}
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-white text-base">API Authentication Keys</h3>
                  <p className="text-xs text-slate-400">Ingest payloads must present this key in the Authorization header to authenticate requests.</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-3 font-mono text-xs flex items-center justify-between text-slate-200">
                    <span>{showApiKey ? apiKey : '••••••••••••••••••••••••••••••••••••••••'}</span>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      {showApiKey ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const newKey = `prodown_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
                      setApiKey(newKey);
                      setShowApiKey(true);
                       window.alert('A new API key has been generated and hashed at rest. Copy it now, it will not be shown again.');
                    }}
                    className="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Key size={14} />
                    Regenerate Key
                  </button>
                </div>
              </div>

              {/* Alert webhooks */}
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-white text-base">Alert Webhooks</h3>
                  <p className="text-xs text-slate-400">Configure plain HTTP alerts sent when critical errors are matched by BullMQ.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">Slack Webhook URL</label>
                    <input
                      type="text"
                      value={slackUrl}
                      onChange={(e) => {
                        const el = e.target as HTMLInputElement;
                        setSlackUrl(el.value);
                      }}
                      title="Slack Webhook URL"
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase">n8n Workflow Webhook URL</label>
                    <input
                      type="text"
                      value={n8nUrl}
                      onChange={(e) => {
                        const el = e.target as HTMLInputElement;
                        setN8nUrl(el.value);
                      }}
                      title="n8n Webhook URL"
                      placeholder="https://n8n.mycompany.com/webhook/..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button
                    onClick={() => {
                       window.alert('Webhook configurations saved successfully to environment config.');
                    }}
                    className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all"
                  >
                    Save Integrations
                  </button>
                </div>
              </div>

              {/* Ingest Simulator */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Terminal className="text-cyan-400" size={24} />
                  <div>
                    <h3 className="font-bold text-white text-base">Local Ingest Payload Simulator</h3>
                    <p className="text-xs text-slate-400">Trigger simulated API calls to test the error validation and fingerprinting engine.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={() => setSimType('NullPointer')}
                      className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                        simType === 'NullPointer'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      NullPointer Exception
                    </button>
                    <button
                      onClick={() => setSimType('NetworkReset')}
                      className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                        simType === 'NetworkReset'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      ECONNRESET Reset
                    </button>
                    <button
                      onClick={() => setSimType('OutOfMemory')}
                      className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                        simType === 'OutOfMemory'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      OutOfMemory Limit
                    </button>
                  </div>
                  <button
                    disabled={isSimulating}
                    onClick={triggerSimulation}
                    className="px-6 py-4 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-md shadow-cyan-400/10 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Zap size={14} className="fill-current" />
                    {isSimulating ? 'Simulating Ingest...' : 'Send Payload'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
