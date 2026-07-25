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

export default function HelpPage() {
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
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#13221C]">Documentation & Help Center</h3>
              <p className="text-xs text-[#687870]">Guides for SDK installation, RLS security, and fingerprint deduplication</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] space-y-2">
                <h4 className="text-sm font-bold text-[#13221C]">PostgreSQL RLS Architecture</h4>
                <p className="text-xs text-[#687870]">Learn how Row-Level Security policies isolate tenant multi-tenancy data in Postgres.</p>
                <a href="/PROJECT_GOVERNANCE_AND_DEVELOPMENT_GUIDELINES.md" className="inline-flex items-center gap-1 text-xs font-bold text-[#52b788]">
                  Read Guidelines <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] space-y-2">
                <h4 className="text-sm font-bold text-[#13221C]">Fastify Ingest Endpoint Specs</h4>
                <p className="text-xs text-[#687870]">POST /ingest specs for sending raw telemetry payloads to BullMQ queues.</p>
                <a href="/apps/api/AGENTS.md" className="inline-flex items-center gap-1 text-xs font-bold text-[#52b788]">
                  View API Specs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
    </>
  );
}
