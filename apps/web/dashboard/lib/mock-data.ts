/**
 * Consolidated mock data for all dashboard pages.
 *
 * This file is the single source of truth for UI development fixtures.
 * Import from here instead of defining duplicates in each page file.
 * Replace with real API/DB calls as features are built out.
 */

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface ErrorEvent {
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

export interface IngestSource {
  id: string;
  name: string;
  tenantId: string;
  type: 'Fastify' | 'Next.js' | 'BullMQ' | 'OTEL';
  eventsCount: number;
  status: 'active' | 'degraded' | 'offline';
  lastPing: string;
  apiKey: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Super Admin' | 'Admin' | 'Employee';
  assignedTask: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'Meeting' | 'Deployment' | 'Maintenance';
  date: string;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

export const MOCK_ERRORS: ErrorEvent[] = [
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
  at Pool.acquire (packages/db/src/client.ts)
  at async PrismaClient._request (apps/api/src/routes/ingest.ts)
  at async handler (apps/api/src/server.ts)`,
    status: 'unresolved',
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
  at callback (apps/dashboard/app/page.tsx)
  at async nextAuth (node_modules/next-auth/core/index.js)`,
    status: 'unresolved',
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
  at verify (apps/api/src/routes/payments.ts)
  at async handler (apps/api/src/routes/payments.ts)`,
    status: 'unresolved',
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
  at FingerprintProcessor (apps/worker/src/worker.ts)`,
    status: 'resolved',
  },
];

export const MOCK_SOURCES: IngestSource[] = [
  { id: 'src-1', name: 'api-server (Fastify Ingest)', tenantId: 'tenant-acme', type: 'Fastify', eventsCount: 14200, status: 'active', lastPing: 'Just now', apiKey: 'po_live_89f2a0b1c9' },
  { id: 'src-2', name: 'web-dashboard (Next.js)', tenantId: 'tenant-stark', type: 'Next.js', eventsCount: 4120, status: 'active', lastPing: '2m ago', apiKey: 'po_live_33e1d2c4f8' },
  { id: 'src-3', name: 'billing-webhook (Razorpay)', tenantId: 'tenant-stark', type: 'Fastify', eventsCount: 310, status: 'active', lastPing: '15m ago', apiKey: 'po_live_99a8b7c6d5' },
  { id: 'src-4', name: 'worker-process (BullMQ)', tenantId: 'tenant-wayne', type: 'BullMQ', eventsCount: 8940, status: 'active', lastPing: 'Just now', apiKey: 'po_live_11f2e3d4c5' },
  { id: 'src-5', name: 'otel-collector (OpenTelemetry)', tenantId: 'tenant-acme', type: 'OTEL', eventsCount: 1840, status: 'degraded', lastPing: '1h ago', apiKey: 'po_live_77c8b9a0e1' },
];

export const MOCK_TEAM: TeamMember[] = [
  { id: 'tm-1', name: 'Alexandra Deff', email: 'alexandra@prodown.dev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', role: 'Super Admin', assignedTask: 'PostgreSQL RLS Migrations', status: 'Completed' },
  { id: 'tm-2', name: 'Edwin Aderike', email: 'edwin@prodown.dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', role: 'Admin', assignedTask: 'Fastify Helmet Security Rules', status: 'In Progress' },
  { id: 'tm-3', name: 'Isaac Oluwatemilorun', email: 'isaac@prodown.dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', role: 'Employee', assignedTask: 'BullMQ Fingerprint Deduplication', status: 'Pending' },
  { id: 'tm-4', name: 'David Okhodi', email: 'david@prodown.dev', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80', role: 'Employee', assignedTask: 'Slack Alert Webhooks', status: 'In Progress' },
];

export const MOCK_CALENDAR: CalendarEvent[] = [
  { id: 'cal-1', title: 'Meeting with Arc Company', time: '02:00 pm - 04:00 pm', type: 'Meeting', date: 'Today' },
  { id: 'cal-2', title: 'PostgreSQL RLS Policy Audit', time: '10:00 am - 11:30 am', type: 'Maintenance', date: 'Tomorrow' },
  { id: 'cal-3', title: 'Deploy Ingest API v1.4.0', time: '05:00 pm - 06:00 pm', type: 'Deployment', date: 'Feb 24, 2026' },
];
