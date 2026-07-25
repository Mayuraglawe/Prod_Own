'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Database,
  Layers,
  Shield,
  Terminal,
  Activity,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  GitBranch,
  ArrowRight,
  Boxes,
  HardDrive,
} from 'lucide-react';

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'components' | 'resilience' | 'storage' | 'deploy' | 'governance'>('overview');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#52b788] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#52b788]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold text-xs rounded-full flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> SUPER_ADMIN GOVERNANCE
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold text-xs rounded-full">
                Developer Knowledge Transfer (KT) Guide
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Platform System Architecture &amp; Developer Guide
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-2xl">
              High-throughput event-driven error tracking &amp; sampled-APM microservices platform with CQRS read/write separation, Kafka streaming backbone, and polyglot persistence.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <Cpu className="w-8 h-8 text-emerald-300" />
            <div>
              <div className="text-xs font-semibold text-emerald-200">Architecture Status</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Microservices Online (7/7)
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-white/10 mt-6 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white text-[#52b788] shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> System Overview
          </button>

          <button
            onClick={() => setActiveTab('flow')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'flow'
                ? 'bg-white text-[#52b788] shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Data Flow Pipeline
          </button>

          <button
            onClick={() => setActiveTab('components')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'components'
                ? 'bg-white text-[#52b788] shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" /> Microservice Specs
          </button>

          <button
            onClick={() => setActiveTab('resilience')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'resilience'
                ? 'bg-white text-[#52b788] shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" /> Resilience &amp; DLQ
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'storage'
                ? 'bg-white text-[#52b788] shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" /> Polyglot Matrix
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'deploy'
                ? 'bg-white text-[#52b788] shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" /> Deployment Guide
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'governance'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'text-amber-300 hover:bg-amber-400/10'
            }`}
          >
            <Lock className="w-4 h-4" /> Super Admin Controls
          </button>
        </div>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#52b788] flex items-center justify-center font-bold">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#13221C]">CQRS Architecture</h3>
              <p className="text-xs text-[#687870] leading-relaxed">
                Ingestion write paths (`POST /api/v1/ingest`) and dashboard query read paths (`GET /api/v1/query`) are fully isolated into dedicated service boundaries to prevent read degradation under write spikes.
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#13221C]">Kafka Streaming Backbone</h3>
              <p className="text-xs text-[#687870] leading-relaxed">
                Services publish and consume decoupled events (`telemetry.received`, `telemetry.processed`, `issue.grouped`, `alert.triggered`), ensuring loose coupling and asynchronous processing.
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#13221C]">Polyglot Storage</h3>
              <p className="text-xs text-[#687870] leading-relaxed">
                PostgreSQL for domain issues &amp; workspace multi-tenancy, ClickHouse for high-throughput time-series analytics, S3 for raw blob storage, and Redis for alert cooldowns.
              </p>
            </div>
          </div>

          {/* Architecture Diagram Canvas */}
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#13221C]">High-Level Architectural Topology</h3>
                <p className="text-xs text-[#687870]">Interactive representation of client ingestion to notification dispatch.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                Event-Driven Architecture
              </span>
            </div>

            {/* Visual Node Diagram */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 overflow-x-auto space-y-6">
              <div className="flex items-center justify-between min-w-[700px]">
                {/* Gateway Layer */}
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 w-44 text-center space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Layer 1: Gateway</div>
                  <div className="text-sm font-extrabold text-white">apps/gateway</div>
                  <div className="text-[10px] text-slate-400">Auth &amp; Rate Limiter</div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-500 shrink-0" />

                {/* Ingestion Layer */}
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 w-44 text-center space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Layer 2: Ingestion</div>
                  <div className="text-sm font-extrabold text-white">apps/ingestion</div>
                  <div className="text-[10px] text-slate-400">Non-blocking 202 Accepted</div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-500 shrink-0" />

                {/* Event Bus Layer */}
                <div className="p-4 bg-emerald-950 rounded-xl border border-emerald-600/50 w-48 text-center space-y-2 shadow-lg shadow-emerald-900/40">
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Kafka Event Bus</div>
                  <div className="text-sm font-extrabold text-white">Event Streaming</div>
                  <div className="text-[10px] text-emerald-200/80">telemetry.received</div>
                </div>
              </div>

              {/* Processing Pipeline Nodes */}
              <div className="grid grid-cols-4 gap-4 min-w-[700px] pt-4 border-t border-slate-800">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-1">
                  <div className="text-[11px] font-bold text-emerald-300">apps/processing</div>
                  <div className="text-[10px] text-slate-400">PII Scrubbing &amp; S3 Blobs</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-1">
                  <div className="text-[11px] font-bold text-purple-300">apps/grouping</div>
                  <div className="text-[10px] text-slate-400">SHA256 Fingerprint &amp; DB</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-1">
                  <div className="text-[11px] font-bold text-amber-300">apps/alerting</div>
                  <div className="text-[10px] text-slate-400">Redis Cooldown &amp; Burst</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-1">
                  <div className="text-[11px] font-bold text-sky-300">apps/notification</div>
                  <div className="text-[10px] text-slate-400">Slack &amp; Webhooks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA FLOW PIPELINE */}
      {activeTab === 'flow' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#13221C]">Step-by-Step Telemetry Processing Pipeline</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#52b788] text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#13221C]">Client Telemetry Ingestion (`POST /api/v1/ingest/store`)</h4>
                  <p className="text-xs text-[#687870]">
                    SDKs submit raw exception payloads. API Gateway checks rate limits and proxies to the Ingestion service, which immediately emits `telemetry.received` to Kafka and responds with HTTP 202 Accepted.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#52b788] text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#13221C]">Sanitization &amp; PII Scrubbing (`apps/processing`)</h4>
                  <p className="text-xs text-[#687870]">
                    Consumer scrubs emails (`[SCRUBBED_EMAIL]`), auth tokens (`Bearer [SCRUBBED_TOKEN]`), and API secrets. Uploads the raw payload blob to S3 (`s3://litetrace-blobs/raw/&lt;tenantId&gt;/&lt;eventId&gt;.json`) and emits `telemetry.processed`.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#52b788] text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#13221C]">Fingerprinting &amp; Polyglot Persistence (`apps/grouping`)</h4>
                  <p className="text-xs text-[#687870]">
                    Generates a SHA256 fingerprint from stack trace titles and culprits. Upserts domain `Issue` records in PostgreSQL and inserts analytical event occurrences into ClickHouse. Emits `issue.grouped`.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#52b788] text-white flex items-center justify-center font-bold text-sm shrink-0">4</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#13221C]">Redis Cooldown &amp; Burst Evaluation (`apps/alerting`)</h4>
                  <p className="text-xs text-[#687870]">
                    Checks Redis key `cooldown:&lt;issueId&gt;` with a 300-second window. Suppresses alert storms unless an occurrence burst threshold (5, 10, 50, 100) is reached. Emits `alert.triggered`.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#52b788] text-white flex items-center justify-center font-bold text-sm shrink-0">5</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#13221C]">Notification Dispatch &amp; DLQ (`apps/notification`)</h4>
                  <p className="text-xs text-[#687870]">
                    Formats and dispatches Slack &amp; webhooks with exponential backoff retries. Exhausted failures route to Dead-Letter Queue (DLQ) for replay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MICROSERVICE SPECS */}
      {activeTab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">apps/gateway</span>
              <span className="text-xs text-[#687870]">Port 8000</span>
            </div>
            <h3 className="text-base font-bold text-[#13221C]">API Gateway Service</h3>
            <p className="text-xs text-[#687870] leading-relaxed">
              Enforces fixed-window sliding rate limits per API key, validates `authorization` and `x-api-key` headers, and dispatches CQRS routes (`POST /ingest` -&gt; Ingestion, `GET /query` -&gt; Query API).
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full">apps/ingestion</span>
              <span className="text-xs text-[#687870]">Write Path</span>
            </div>
            <h3 className="text-base font-bold text-[#13221C]">Ingestion Write Service</h3>
            <p className="text-xs text-[#687870] leading-relaxed">
              Ultra-lightweight write proxy designed for high throughput. Accepts incoming telemetry, performs structural verification, and emits `telemetry.received` immediately without blocking clients.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full">apps/processing</span>
              <span className="text-xs text-[#687870]">Sanitization &amp; Blobs</span>
            </div>
            <h3 className="text-base font-bold text-[#13221C]">Processing Service</h3>
            <p className="text-xs text-[#687870] leading-relaxed">
              Scrubs sensitive PII data (emails, auth tokens, passwords) using regular expression rules, normalizes stack trace call sites, and uploads raw event blobs to S3/MinIO storage.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full">apps/grouping</span>
              <span className="text-xs text-[#687870]">Fingerprinting</span>
            </div>
            <h3 className="text-base font-bold text-[#13221C]">Grouping &amp; Deduplication Service</h3>
            <p className="text-xs text-[#687870] leading-relaxed">
              Computes SHA256 error fingerprints. Performs atomic upserts into PostgreSQL for domain issue states and writes time-series metrics into ClickHouse for analytics search.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#52b788] bg-[#d8f3dc] px-3 py-1 rounded-full">apps/alerting</span>
              <span className="text-xs text-[#687870]">Rate Limiting &amp; Cooldown</span>
            </div>
            <h3 className="text-base font-bold text-[#13221C]">Alerting Service</h3>
            <p className="text-xs text-[#687870] leading-relaxed">
              Evaluates error burst rules and enforces Redis 300-second alert cooldown windows to eliminate repetitive notification spam for ongoing issues.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full">apps/query</span>
              <span className="text-xs text-[#687870]">Read Side</span>
            </div>
            <h3 className="text-base font-bold text-[#13221C]">Query / API Service</h3>
            <p className="text-xs text-[#687870] leading-relaxed">
              Serves dashboard UI reads from PostgreSQL read replicas and ClickHouse analytical tables, ensuring read query execution does not affect write ingestion speed.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: RESILIENCE & DLQ */}
      {activeTab === 'resilience' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#13221C]">Resilience &amp; Fault Tolerance Control Matrix</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <RefreshCw className="w-4 h-4" /> Exponential Backoff
                </div>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  Failed consumer events automatically retry with doubling backoff delays (`initialBackoffMs * 2^(attempt-1)`).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Shield className="w-4 h-4" /> Circuit Breaker Pattern
                </div>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  Isolates failing services when 5 consecutive errors occur (`CLOSED` -&gt; `OPEN` -&gt; `HALF_OPEN`), preventing cascading infrastructure failures.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" /> Dead-Letter Queue (DLQ)
                </div>
                <p className="text-xs text-rose-900/80 leading-relaxed">
                  Events failing max retry attempts route to `packages/events/src/dlq.ts` for developer inspection and manual replay.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: POLYGLOT STORAGE MATRIX */}
      {activeTab === 'storage' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#13221C]">Polyglot Persistence Matrix</h3>
            <p className="text-xs text-[#687870]">Specific database selection tailored to data access patterns and scaling requirements.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8E4] bg-[#FAFBFB]">
                    <th className="p-3 font-bold text-[#13221C]">Service</th>
                    <th className="p-3 font-bold text-[#13221C]">Primary Storage</th>
                    <th className="p-3 font-bold text-[#13221C]">Store Type</th>
                    <th className="p-3 font-bold text-[#13221C]">Data Content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E4]">
                  <tr>
                    <td className="p-3 font-semibold text-[#13221C]">Ingestion</td>
                    <td className="p-3 text-emerald-800 font-bold">Redis</td>
                    <td className="p-3 text-[#687870]">In-Memory Key-Value</td>
                    <td className="p-3 text-[#687870]">Rate limit counters &amp; API keys</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#13221C]">Processing</td>
                    <td className="p-3 text-amber-800 font-bold">S3 / MinIO</td>
                    <td className="p-3 text-[#687870]">Object Storage</td>
                    <td className="p-3 text-[#687870]">Raw stack trace payloads &amp; blobs</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#13221C]">Grouping</td>
                    <td className="p-3 text-sky-800 font-bold">PostgreSQL</td>
                    <td className="p-3 text-[#687870]">Relational DB</td>
                    <td className="p-3 text-[#687870]">Domain Issues, Fingerprints, Workspace Members</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#13221C]">Grouping / Query</td>
                    <td className="p-3 text-purple-800 font-bold">ClickHouse</td>
                    <td className="p-3 text-[#687870]">Time-Series OLAP</td>
                    <td className="p-3 text-[#687870]">High-volume telemetry events &amp; metric logs</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#13221C]">Alerting</td>
                    <td className="p-3 text-rose-800 font-bold">Redis</td>
                    <td className="p-3 text-[#687870]">In-Memory Key-Value</td>
                    <td className="p-3 text-[#687870]">Alert cooldown timestamps &amp; burst counters</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DEPLOYMENT GUIDE */}
      {activeTab === 'deploy' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#13221C]">Local &amp; Production Deployment Commands</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#13221C]">
                  <span>Local Docker Compose Multi-Container Stack</span>
                  <button
                    onClick={() => copyToClipboard('docker compose up --build', 'docker')}
                    className="text-[#52b788] hover:underline"
                  >
                    {copiedCmd === 'docker' ? 'Copied!' : 'Copy Command'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto">
                  docker compose up --build
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#13221C]">
                  <span>Kubernetes Production Deployment (Autoscaling HPA)</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'kubectl apply -f deploy/kubernetes/gateway-deployment.yaml\nkubectl apply -f deploy/kubernetes/microservices-deployments.yaml',
                        'k8s'
                      )
                    }
                    className="text-[#52b788] hover:underline"
                  >
                    {copiedCmd === 'k8s' ? 'Copied!' : 'Copy Command'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto">
                  kubectl apply -f deploy/kubernetes/gateway-deployment.yaml{'\n'}
                  kubectl apply -f deploy/kubernetes/microservices-deployments.yaml
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SUPER ADMIN GOVERNANCE */}
      {activeTab === 'governance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-amber-700/10 border border-amber-300 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-amber-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-lg">
                  <Shield className="w-5 h-5 text-amber-600" /> Super Admin System Governance
                </div>
                <p className="text-xs text-amber-800">
                  Global controls restricted exclusively to `SUPER_ADMIN` role accounts.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-600 text-white font-bold text-xs rounded-full shadow-sm">
                SUPER_ADMIN ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-amber-200 space-y-3 shadow-sm">
                <h4 className="text-sm font-bold text-[#13221C]">System Access &amp; Member Elevation</h4>
                <p className="text-xs text-[#687870]">
                  Elevate or demote workspace accounts between `SUPER_ADMIN`, `ADMIN`, and `EMPLOYEE` roles across tenants.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" /> All 3 roles active in database &amp; API
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-amber-200 space-y-3 shadow-sm">
                <h4 className="text-sm font-bold text-[#13221C]">Global API Ingestion Rate Limiting</h4>
                <p className="text-xs text-[#687870]">
                  Configure rate limit bounds (e.g. 100 req/min) enforced by `apps/gateway` across API keys.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fixed-window rate limiter active
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
