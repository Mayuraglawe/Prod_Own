'use client';

import React, { useState } from 'react';
import { Plus, Search, Server, Cpu, Webhook, ShieldCheck, Copy, Check, ExternalLink, Pause, Play, Square, Settings, LayoutDashboard, CheckSquare, Calendar as CalendarIcon, BarChart2, Users, HelpCircle, Mail, Bell, ArrowUpRight, Smartphone } from 'lucide-react';

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

export default function TasksPage() {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isWorkerTracking, setIsWorkerTracking] = useState(true);
  const [uptimeSeconds, setUptimeSeconds] = useState(5048);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [errorsList, setErrorsList] = useState<ErrorEvent[]>(MOCK_ERRORS);
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null);

  const handleResolveError = (id: string) => {
    setErrorsList(prev => prev.map(e => e.id === id ? { ...e, status: 'resolved' } : e));
    if (selectedError?.id === id) {
      setSelectedError(prev => prev ? { ...prev, status: 'resolved' } : null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredErrors = errorsList.filter((err) => {
    const matchesSearch = err.title.toLowerCase().includes(searchQuery.toLowerCase()) || err.message.toLowerCase().includes(searchQuery.toLowerCase()) || err.tenantId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || err.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <>
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
                          ? 'bg-[#52b788] text-white border-[#52b788]'
                          : 'bg-[#F3F5F4] text-[#687870] border-[#E2E8E4] hover:bg-[#d8f3dc]'
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
                  <div key={err.id} className="p-4 rounded-2xl border border-[#E2E8E4] hover:border-[#52b788]/30 hover:shadow-sm transition-all space-y-3">
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
                      <span className="font-mono text-[#52b788] text-[11px] font-semibold">{err.tenantId} • {err.source}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedError(selectedError?.id === err.id ? null : err)}
                          className="px-3 py-1 bg-[#F3F5F4] hover:bg-[#d8f3dc] text-[#52b788] font-bold text-xs rounded-full border border-[#E2E8E4]"
                        >
                          {selectedError?.id === err.id ? 'Hide Trace' : 'View Trace'}
                        </button>
                        {err.status === 'unresolved' ? (
                          <button
                            onClick={() => handleResolveError(err.id)}
                            className="px-3 py-1 bg-[#52b788] hover:bg-[#40916c] text-white font-bold text-xs rounded-full"
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
                      <div className="mt-3 p-4 rounded-xl bg-[#1b4332] text-emerald-300 font-mono text-xs overflow-x-auto border border-[#52b788]">
                        <p className="text-gray-400 text-[10px] mb-2 font-sans font-semibold">// Raw Ingested Stack Trace</p>
                        <pre>{err.stackTrace}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
    </>
  );
}
