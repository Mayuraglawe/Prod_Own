'use client';

import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import {
  FileText, Folder, FolderGit2, ShieldCheck, Search, Download,
  Copy, Eye, Check, ExternalLink, Sparkles, BookOpen, Layers,
  Terminal, ShieldAlert, AlertTriangle, CheckCircle2,
  X, Tag, ArrowRight, Info, Hash, Workflow
} from 'lucide-react';

// ────── Extended File Document Definition Interface ────────────────────────────

export interface SystemFileDoc {
  id: string;
  filename: string;
  path: string;
  category: 'General' | 'Architecture' | 'Governance' | 'Deployment' | 'Database';
  isFeaturedInGeneral: boolean;
  title: string;
  subtitle: string;
  description: string;
  size: string;
  lines: number;
  lastUpdated: string;
  tags: string[];
  securityLevel: 'Super Admin' | 'Architect' | 'Internal';
  summaryHighlights: string[];
  content: string;
}

// ────── Managed Super Admin Document Store ─────────────────────────────────────

export class SystemFileStore {
  static readonly FILES: SystemFileDoc[] = [
    {
      id: 'gen-001',
      filename: 'general_files_analysis.md',
      path: 'c:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\b926e82d-ec67-4140-8a3d-0a17439c7821\\general_files_analysis.md',
      category: 'General',
      isFeaturedInGeneral: true,
      title: 'General System Documentation & Comparative File Analysis',
      subtitle: 'Synthesis of Monolithic Audit & Microservices Target Architecture',
      description: 'Comprehensive comparative analysis uniting the initial single Next.js monolith audit with the target 7-microservice event-driven architecture. Contains architectural synergy matrices, side-by-side file representations, and evolutionary resolution roadmaps.',
      size: '12.4 KB',
      lines: 147,
      lastUpdated: '2026-07-25',
      tags: ['General', 'Comparative Analysis', 'Monolith vs Microservices', 'Synthesis'],
      securityLevel: 'Super Admin',
      summaryHighlights: [
        'Unites Monolith Audit and Microservices Target Architecture into a single source of truth.',
        'Comparative synergy matrix evaluating Ingestion, Processing, Grouping, Alerting, and Storage.',
        'Detailed line-by-line file representations for project_analysis.md and architecture_kt_documentation.md.',
        'Evolutionary resolution roadmap mapping initial code vulnerabilities to microservice features.'
      ],
      content: `# General System Documentation & Comparative File Analysis

This document provides a comprehensive analysis and formal representation of the two primary system documentation files in the project workspace:

1. [project_analysis.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/6bc3d84c-0914-4be9-9cc7-f26cc94a546c/project_analysis.md) — *Project Audit, Monolith Architecture Analysis & Codebase Health Report*
2. [architecture_kt_documentation.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/9683b40d-9d4f-4a55-9762-6a948c8e1241/architecture_kt_documentation.md) — *Microservices Architecture & Knowledge Transfer (KT) Guide*

---

## 1. General Overview & Architectural Context

The **Prod-Own** platform is a self-hosted, INR-priced error tracking and sampled APM platform designed for small-to-medium software engineering teams. It serves as a lightweight, cost-effective alternative to platforms like Sentry, capturing uncaught exceptions and telemetry errors, grouping them by fingerprint, and notifying engineers via webhooks (Slack).

### Architectural Synergy Between the Documents

| Dimension | [project_analysis.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/6bc3d84c-0914-4be9-9cc7-f26cc94a546c/project_analysis.md) | [architecture_kt_documentation.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/9683b40d-9d4f-4a55-9762-6a948c8e1241/architecture_kt_documentation.md) |
| :--- | :--- | :--- |
| **System Stage** | Initial Monolithic / Next.js-Centric Prototype Audit | Target Distributed Microservices & CQRS Platform |
| **Ingestion Pipeline** | HTTP POST → Redis Stream (\`litetrace:events\`) → In-app Worker | HTTP POST → API Gateway → Ingestion Service → Kafka (\`telemetry.received\`) |
| **Processing Strategy** | Monolithic background worker (\`workers/fingerprint.ts\`) | Decoupled Processing Service (\`apps/processing\`) + S3 Blob Store |
| **Grouping & Database** | MD5 hash on raw error string → Postgres | SHA256 normalized fingerprint → Postgres (Relational) + ClickHouse (OLAP) |
| **Alerting & Notification**| In-memory BullMQ queue (\`alerts\`) → \`workers/alerts.ts\` | Alerting Service (\`apps/alerting\`) + Notification Service (\`apps/notification\`) + DLQ |
| **Primary Focus** | Code quality audit, security flaws, refactoring priorities | Event-driven microservices, resilience, polyglot persistence, Kubernetes HPA |

---

## 2. File Representation 1: [project_analysis.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/6bc3d84c-0914-4be9-9cc7-f26cc94a546c/project_analysis.md)

### 2.1 Core Purpose & Summary
[project_analysis.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/6bc3d84c-0914-4be9-9cc7-f26cc94a546c/project_analysis.md) evaluates the initial monorepo codebase structure where background processing workers (\`fingerprint.ts\`, \`alerts.ts\`) and API routes (\`/api/ingest\`) were co-located inside the Next.js web dashboard (\`apps/web\`).

### 2.2 Monolithic Data Flow & Architecture
\`\`\`mermaid
graph TD
    SDK["@prod-own/sdk-node"] -->|HTTP POST /api/ingest| INGEST["apps/web /api/ingest"]
    INGEST -->|xadd| REDIS["Redis Stream litetrace:events"]
    REDIS -->|xread BLOCK| FP_WORKER["Fingerprint Worker workers/fingerprint.ts"]
    FP_WORKER -->|enqueueAlert| ALERT_Q["BullMQ Queue alerts"]
    ALERT_Q --> ALERTS_WORKER["Alerts Worker workers/alerts.ts"]
    ALERTS_WORKER -->|HTTP POST| SLACK["Slack Webhook"]
    FP_WORKER -->|Prisma| PG[(PostgreSQL)]
    ALERTS_WORKER -->|Prisma| PG
\`\`\`

### 2.3 Key Audit Findings & Severity Assessment

#### Critical Security & Logic Issues
> [!CAUTION]
> 1. **No Ingest Sanitization / Scrubbing**: Raw error messages and stack traces are committed to Redis streams and Postgres without PII scrubbing, potentially leaking bearer tokens, passwords, and API keys.
> 2. **Authentication Bypass**: Ingest routes look up sources by \`sourceId\` without verifying API secret keys, allowing unauthorized callers to inject arbitrary error events.
> 3. **Hardcoded Test Tenant**: The UI dashboard defaults to hardcoded tenant ID \`test-tenant-id-123\`.
> 4. **Type Safety Bypasses**: Usage of \`(prisma as any).alertConfig\` and \`err: any\` in route handlers.

#### Structural & Code Health Deficiencies
- **Co-located Workers**: Background workers running inside \`apps/web\` share lifecycle and build targets with the Next.js frontend app.
- **Monolithic UI Components**: \`dashboard.tsx\` is an unwieldy 57 KB file containing all UI logic in a single file.
- **Missing Repository Abstraction**: Direct Prisma queries are executed directly inside Next.js page components and worker routines.
- **Lack of Vitest Test Suites**: Unit and integration test coverage is missing across packages.

### 2.4 Recommended Remediation & Structure
The document recommends:
1. Extracting background workers into a dedicated process app (\`apps/worker\`).
2. Creating a domain pipeline package (\`packages/ingest\`) containing payload validators, PII scrubbers, and stack trace fingerprinters.
3. Implementing a repository layer (\`lib/repositories/\`) to abstract database queries away from route logic.

---

## 3. File Representation 2: [architecture_kt_documentation.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/9683b40d-9d4f-4a55-9762-6a948c8e1241/architecture_kt_documentation.md)

### 3.1 Core Purpose & Summary
[architecture_kt_documentation.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/9683b40d-9d4f-4a55-9762-6a948c8e1241/architecture_kt_documentation.md) serves as the primary Knowledge Transfer (KT) guide and technical specification for the production-grade **Event-Driven Microservices Platform**.

### 3.2 Target Microservices Architecture & Data Flow
\`\`\`mermaid
graph TD
    Client[SDK / Client] -->|HTTP POST| GW[apps/gateway]
    UI[Dashboard UI] -->|HTTP GET| GW
    
    subgraph Gateway & CQRS Routing
        GW -->|Write Path| INGEST_SVC[apps/ingestion]
        GW -->|Read Path| QUERY_SVC[apps/query]
    end

    INGEST_SVC -->|Publish telemetry.received| KAFKA((Kafka Bus))
    KAFKA --> PROC_SVC[apps/processing]
    PROC_SVC -->|Upload Blob| S3[(S3 / MinIO)]
    PROC_SVC -->|Publish telemetry.processed| KAFKA
    
    KAFKA --> GROUP_SVC[apps/grouping]
    GROUP_SVC -->|Upsert Issue| PG[(PostgreSQL)]
    GROUP_SVC -->|Insert Event| CH[(ClickHouse)]
    GROUP_SVC -->|Publish issue.grouped| KAFKA

    KAFKA --> ALERT_SVC[apps/alerting]
    ALERT_SVC -->|Check Cooldown| REDIS[(Redis Cache)]
    ALERT_SVC -->|Publish alert.triggered| KAFKA

    KAFKA --> NOTIF_SVC[apps/notification]
    NOTIF_SVC -->|Webhook POST| EXTERNAL[Slack / Webhooks]
    QUERY_SVC -->|Read| PG
    QUERY_SVC -->|Read Metrics| CH
\`\`\`

### 3.3 Microservice Component Breakdown

1. **API Gateway (\`apps/gateway\`)**: Fixed-window rate limiting, authorization header validation, and CQRS traffic routing.
2. **Ingestion Service (\`apps/ingestion\`)**: High-throughput write endpoint returning immediate \`202 Accepted\` upon publishing \`telemetry.received\`.
3. **Processing Service (\`apps/processing\`)**: PII scrubbing (emails, tokens, API keys), stack normalization, and raw blob storage in S3/MinIO.
4. **Grouping Service (\`apps/grouping\`)**: SHA256 error fingerprinting (\`normalize(title) + normalize(culprit)\`), upserting Postgres \`Issue\` domain objects, and inserting ClickHouse time-series metrics.
5. **Alerting Service (\`apps/alerting\`)**: Step-threshold error burst evaluation (5, 10, 50, 100 occurrences) and Redis 300s window cooldown checks (\`cooldown:{issueId}\`).
6. **Notification Service (\`apps/notification\`)**: Multi-channel webhook dispatches with exponential retries and Dead-Letter Queue (DLQ) routing.
7. **Query Service (\`apps/query\`)**: CQRS read service serving dashboard analytics from Postgres read replicas and ClickHouse.

### 3.4 Resilience & Polyglot Persistence

> [!IMPORTANT]
> - **Circuit Breakers**: \`CLOSED\` → \`OPEN\` → \`HALF_OPEN\` state machine isolates failing downstreams after 5 consecutive failures.
> - **Exponential Backoff**: Doubling retry delays (\`initialBackoffMs * 2^(attempt-1)\`).
> - **Dead-Letter Queue (DLQ)**: Stores unprocessable events for manual inspection and replay.

#### Polyglot Storage Matrix
- **Redis**: Rate limits, alert cooldown keys (300s TTL).
- **S3 / MinIO**: Object storage for raw stack trace JSON payloads (\`s3://litetrace-blobs/raw/...\`).
- **PostgreSQL**: Relational storage for tenant boundaries, sources, issues, and alert configs.
- **ClickHouse**: Columnar time-series store for high-volume telemetry analytics.

---

## 4. Comparative Synthesis & Architectural Evolution

| Aspect | Initial Monolith State ([project_analysis.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/6bc3d84c-0914-4be9-9cc7-f26cc94a546c/project_analysis.md)) | Target Microservices State ([architecture_kt_documentation.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/9683b40d-9d4f-4a55-9762-6a948c8e1241/architecture_kt_documentation.md)) | Resolution Status in Repository (\`apps/\`) |
| :--- | :--- | :--- | :--- |
| **Worker Isolation** | Co-located in \`apps/web\` | Dedicated microservices (\`ingestion\`, \`processing\`, \`grouping\`, \`alerting\`, \`notification\`) | Fully decoupled under \`apps/*\` |
| **Queue & Event Bus** | Redis Stream + BullMQ | Kafka Event Streaming Backbone | Event bus isolated in \`packages/events\` |
| **Data Persistence** | Postgres only | Postgres + ClickHouse + S3 + Redis | Polyglot persistence strategy defined |
| **PII Sanitization** | Missing / Vulnerable | Automated in Processing Service | Handled in processing pipeline |
| **Fault Tolerance** | Basic Redis dedup | Circuit Breaker + Exponential Retries + DLQ | Circuit breaker & DLQ implemented in \`packages/events\` |
| **CQRS Separation** | Shared Next.js endpoints | Complete isolation of \`ingestion\` (Write) and \`query\` (Read) | Gateway routes write to Ingest, read to Query |

---

## 5. Summary & Actionable Recommendations

Both documents outline a coherent roadmap for building a scalable error tracking system:
1. **[project_analysis.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/6bc3d84c-0914-4be9-9cc7-f26cc94a546c/project_analysis.md)** provides the critical audit baseline, emphasizing missing PII scrubbing, authentication gaps, and monolithic code bottlenecks.
2. **[architecture_kt_documentation.md](file:///c:/Users/HP/.gemini/antigravity-ide/brain/9683b40d-9d4f-4a55-9762-6a948c8e1241/architecture_kt_documentation.md)** supplies the blueprint for a resilient, event-driven microservices architecture capable of handling high-ingest telemetry bursts with isolation, polyglot storage, and failure recovery.
`
    },
    {
      id: 'gen-002',
      filename: 'project_analysis.md',
      path: 'c:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\6bc3d84c-0914-4be9-9cc7-f26cc94a546c\\project_analysis.md',
      category: 'General',
      isFeaturedInGeneral: true,
      title: 'Project Analysis & Recommended Monorepo Structure',
      subtitle: 'Codebase Health Audit, Security Flaws & Refactoring Blueprint',
      description: 'Audit report of the initial single Next.js monolith architecture. Pinpoints 5 critical security vulnerabilities, 8 structural code smells, monolithic UI component bottlenecks, and details a phased refactoring blueprint to extract background workers.',
      size: '14.8 KB',
      lines: 304,
      lastUpdated: '2026-07-25',
      tags: ['General', 'Monolith Audit', 'Security Audit', 'Codebase Health', 'Refactoring'],
      securityLevel: 'Super Admin',
      summaryHighlights: [
        'Audit of apps/web co-located background workers and ingest routes.',
        'Critical vulnerability C1: Missing payload scrubbing allowing unsanitized secret leaks.',
        'Critical vulnerability C3: sourceId lookup without API key verification.',
        'Structural recommendation to extract apps/worker and create packages/ingest.'
      ],
      content: `# Prod-Own — Project Analysis & Recommended Structure

## What the Project Is

**Prod-Own** is a self-hosted, INR-priced **error tracking + sampled APM platform** for small teams — think a lightweight, open-core Sentry alternative. It captures uncaught errors from Node.js applications, groups them by fingerprint, and dispatches alert webhooks to Slack.

---

## Current Architecture Overview

\`\`\`mermaid
graph TD
    SDK["@prod-own/sdk-node\nCaptures uncaughtException /\nunhandledRejection"] -->|HTTP POST| INGEST

    INGEST["apps/web /api/ingest\nNext.js Route Handler\n(rate-limit → validate → enqueue)"] -->|xadd| REDIS_STREAM["Redis Stream\nlitetrace:events"]

    REDIS_STREAM -->|xread BLOCK| FP_WORKER["Fingerprint Worker\nworkers/fingerprint.ts\n(scrub → hash → upsert Issue)"]

    FP_WORKER -->|BullMQ enqueueAlert| ALERT_QUEUE["BullMQ Queue\nalerts"]
    ALERT_QUEUE --> ALERTS_WORKER["Alerts Worker\nworkers/alerts.ts\n(dedup → webhook dispatch)"]
    ALERTS_WORKER -->|HTTP POST| SLACK["Slack Webhook"]

    FP_WORKER -->|prisma| PG["Postgres\nTenant · Source · Issue · Event\nAlertConfig · AlertEvent · Payment"]
    ALERTS_WORKER -->|prisma| PG
    INGEST -->|prisma.source.findUnique| PG

    DASHBOARD["apps/web\nNext.js Dashboard\n(Auth · Issues · Sources · Analytics)"] --> PG
\`\`\`

---

## Monorepo Package Map

| Package | Name | Role |
|---|---|---|
| \`apps/web\` | \`@prod-own/web\` | Next.js app — dashboard UI + all API routes + BullMQ workers |
| \`packages/config\` | \`@prod-own/config\` | Zod-validated \`env\` singleton; .env traversal |
| \`packages/db\` | \`@prod-own/db\` | Prisma client + schema (Postgres) |
| \`packages/queue\` | \`@prod-own/queue\` | BullMQ connection, queue factories, job types |
| \`packages/observability\` | \`@prod-own/observability\` | OpenTelemetry SDK bootstrap (OTLP exporter) |
| \`packages/sdk-node\` | \`@prod-own/sdk-node\` | Publishable SDK: hooks \`uncaughtException\` / \`unhandledRejection\` |
| \`packages/types\` | \`@prod-own/types\` | Shared TS interfaces (FingerprintJobPayload, AlertEvent, etc.) |

---

## Data Model (Prisma)

\`\`\`
Tenant (RLS boundary)
  ├── User[]           – Auth.js users
  ├── Source[]         – Ingest origins with API keys
  │     └── AlertConfig[] – Webhook configs per source
  ├── Issue[]          – Grouped errors by fingerprint
  │     └── Event[]    – Raw event payloads
  ├── AlertEvent[]     – Audit log of dispatched alerts
  └── PaymentEvent[]   – Razorpay billing hooks
\`\`\`

---

## Ingest Pipeline

\`\`\`
SDK → POST /api/ingest
         │ 1. Rate-limit (Redis token bucket, 1000/min/source)
         │ 2. Validate sourceId → fetch tenantId from Postgres
         │ 3. xadd Redis Stream litetrace:events
         └── 202 Accepted

Redis Stream → Fingerprint Worker (xread BLOCK 5000ms)
         │ 1. Parse payload
         │ 2. md5(error string) = fingerprint
         │ 3. Upsert Issue (create or update eventCount/lastSeen)
         │ 4. Create Event record
         └── enqueueAlert (if new_issue | reopened)

BullMQ alerts queue → Alerts Worker
         │ 1. Load AlertConfig for source + trigger
         │ 2. Redis dedup key (issue:channel:hour_bucket, 1h TTL)
         │ 3. POST webhook payload to Slack
         └── Create AlertEvent (audit trail)
\`\`\`

---

## What's Working Well ✅

- **Clean package boundaries** — config, db, queue, sdk-node are all properly isolated
- **Zod env validation** in \`@prod-own/config\` fails fast on startup
- **BullMQ + IORedis** used correctly with shared connection and \`maxRetriesPerRequest: null\`
- **Redis Stream for ingest** decouples the HTTP path from processing (202-first design)
- **Graceful shutdown** (\`SIGTERM\`/\`SIGINT\`) in \`workers/index.ts\`
- **Hourly dedup key** in alerts worker prevents flood alerts per issue
- **Turborepo** pipelines with correct \`dependsOn: ["^build"]\` ordering

---

## Issues Found 🚩

### Critical

| # | Issue | Location |
|---|---|---|
| C1 | **No payload validation / scrubbing on ingest** — raw error string goes to Redis stream and then Postgres without sanitizing secrets/tokens | \`api/ingest/route.ts\` |
| C2 | **Hardcoded test tenant** (\`test-tenant-id-123\`, slug \`test-workspace\`) baked into dashboard page | \`(app)/dashboard/page.tsx:27-40\` |
| C3 | **\`sourceId\` used as lookup key without API key auth** — any caller who knows a \`sourceId\` can ingest events for that tenant | \`api/ingest/route.ts\` |
| C4 | **\`(prisma as any).alertConfig\`** bypasses type safety in alerts worker | \`workers/alerts.ts:26\` |
| C5 | **\`err: any\` in ingest catch block** violates strict mode rule | \`api/ingest/route.ts:51\` |

### Structural

| # | Issue | Location |
|---|---|---|
| S1 | **Workers co-located inside \`apps/web\`** — they run outside Next.js lifecycle but share the same package. Should be a separate entrypoint or app. | \`apps/web/workers/\` |
| S2 | **Massive monolithic components** — \`dashboard.tsx\` is 57 KB, \`dashboard-overview.tsx\` is 15 KB. These are giant files that contain all UI in a single component. | \`components/\` |
| S3 | **Duplicate code across pages** — \`analytics/page.tsx\` and \`sources/page.tsx\` are near-identical (copy-paste of mock data, interfaces, state, utility functions) | \`(app)/analytics/\`, \`(app)/sources/\` |
| S4 | **Mock data in production pages** — \`MOCK_ERRORS\`, \`MOCK_SOURCES\`, \`MOCK_TEAM\` live inside route files | Multiple pages |
| S5 | **Missing \`repositories\` layer** — Prisma queries live directly in route handlers and workers with no abstraction | \`dashboard/page.tsx\`, \`fingerprint.ts\` |
| S6 | **\`packages/observability\`** — barely started, only \`otel.ts\` + empty \`index.ts\`. Not integrated anywhere. | \`packages/observability/src/\` |
| S7 | **\`scratch/\` directory and test files** committed to root | \`scratch/\`, \`test-alerts.ts\` |
| S8 | **No Vitest test suites** exist anywhere despite AGENTS.md requiring them | All packages |

### Minor

| # | Issue | Location |
|---|---|---|
| M1 | \`enqueueAlert\` creates a new Queue instance per call — should be a singleton | \`queue/src/jobs/alerts.ts\` |
| M2 | Fingerprint uses raw MD5 — no stack normalization (line numbers, paths). Will miss duplicates. | \`workers/fingerprint.ts:76\` |
| M3 | \`environment: 'production'\` and \`release: 'unknown'\` are hard-coded placeholders | \`workers/fingerprint.ts:134\` |
| M4 | \`alertEvent.severity\` is always \`'error'\` regardless of trigger type | \`workers/alerts.ts:86\` |
| M5 | \`FingerprintJob\` model exists in Prisma schema but is never used in code | \`schema.prisma\` |
| M6 | \`PaymentEvent\` and billing queue exist but billing processing is not wired | \`schema.prisma\`, \`queue/src/factories.ts\` |

---

## Priority Action Items

| Priority | Action |
|---|---|
| 🔴 High | Add payload validation + scrubbing before ingest enqueue |
| 🔴 High | Implement API key auth for \`/api/ingest\` (hash at rest, check on request) |
| 🔴 High | Remove hardcoded \`test-tenant-id-123\` from dashboard page |
| 🟠 Medium | Extract workers to \`apps/worker\` |
| 🟠 Medium | Add \`lib/repositories/\` layer in \`apps/web\` |
| 🟠 Medium | Create \`packages/ingest\` with validator, scrubber, fingerprinter |
| 🟠 Medium | Split \`dashboard.tsx\` (57 KB) into feature components |
| 🟡 Low | Write Vitest suites for scrubber, fingerprinter, RLS isolation |
| 🟡 Low | Fix singleton queue in \`enqueueAlert\` |
| 🟡 Low | Wire observability package into worker + web startup |
| 🟡 Low | Delete \`scratch/\` dir and \`test-alerts.ts\` from repo |
`
    },
    {
      id: 'gen-003',
      filename: 'architecture_kt_documentation.md',
      path: 'c:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\9683b40d-9d4f-4a55-9762-6a948c8e1241\\architecture_kt_documentation.md',
      category: 'General',
      isFeaturedInGeneral: true,
      title: 'Comprehensive Architecture & Knowledge Transfer (KT) Guide',
      subtitle: 'Blueprint for Event-Driven Microservices, CQRS & Polyglot Persistence',
      description: 'Comprehensive Knowledge Transfer (KT) guide detailing the 7-microservice event-driven target platform. Covers Kafka streaming backbones, CQRS read/write isolation, PII scrubbing, circuit breakers, dead-letter queues (DLQ), and Kubernetes HPA autoscaling.',
      size: '10.7 KB',
      lines: 235,
      lastUpdated: '2026-07-25',
      tags: ['General', 'Microservices', 'Kafka', 'CQRS', 'Knowledge Transfer', 'Polyglot Storage'],
      securityLevel: 'Architect',
      summaryHighlights: [
        'Complete specification of all 7 microservices (Gateway, Ingestion, Processing, Grouping, Alerting, Notification, Query).',
        'Kafka event pipeline: telemetry.received → telemetry.processed → issue.grouped → alert.triggered.',
        'Resilience architecture: Circuit breaker state machine (CLOSED/OPEN/HALF_OPEN) and DLQ.',
        'Polyglot storage matrix: Postgres (relational), ClickHouse (OLAP), S3 (blobs), Redis (cooldowns).'
      ],
      content: `# Comprehensive Architecture & Knowledge Transfer (KT) Guide

This document provides a detailed architectural breakdown and knowledge transfer (KT) guide for the **Prod Own Event-Driven Microservices Platform**. It contains deep technical descriptions, data flow models, resilience patterns, polyglot persistence schemas, and Mermaid diagrams to aid team onboarding, documentation, and diagram generation.

---

## 1. System Architecture Overview

The system is structured as an **asynchronous, event-driven microservices architecture** with **CQRS read/write separation**, **polyglot persistence** (Postgres, ClickHouse, S3, Redis), **circuit breakers**, **dead-letter queues (DLQ)**, and an **API Gateway**.

\`\`\`mermaid
graph TD
    Client[Client SDKs / Browsers] -->|HTTP POST /api/v1/ingest| Gateway[apps/gateway: API Gateway]
    DashboardUI[Next.js Dashboard UI] -->|HTTP GET /api/v1/query| Gateway

    subgraph API Gateway Layer
        Gateway -->|Auth & Rate Limit| Route{CQRS Router}
    end

    subgraph CQRS Write & Async Processing Stack
        Route -->|Write Path| Ingestion[apps/ingestion: Ingestion Service]
        Ingestion -->|Publish telemetry.received| Kafka((Kafka Event Bus))
        Kafka -->|Consume| Processing[apps/processing: Processing Service]
        Processing -->|Store Raw Payload| S3[(S3 / MinIO Blob Store)]
        Processing -->|Publish telemetry.processed| Kafka
        Kafka -->|Consume| Grouping[apps/grouping: Grouping Service]
        Grouping -->|Upsert Issues| Postgres[(PostgreSQL Relational DB)]
        Grouping -->|Record Analytics| ClickHouse[(ClickHouse Time-Series DB)]
        Grouping -->|Publish issue.grouped| Kafka
        Kafka -->|Consume| Alerting[apps/alerting: Alerting Service]
        Alerting -->|Check Cooldown| Redis[(Redis Cache)]
        Alerting -->|Publish alert.triggered| Kafka
        Kafka -->|Consume| Notification[apps/notification: Notification Service]
        Notification -->|Dispatch| External[Slack & Webhooks]
    end

    subgraph CQRS Read Stack
        Route -->|Read Path| QueryService[apps/query: Query API Service]
        QueryService -->|Read Issues| Postgres
        QueryService -->|Read Time-Series Metrics| ClickHouse
    end
\`\`\`

---

## 2. Event-Driven Sequence & End-to-End Data Flow

The sequence diagram below details the asynchronous event pipeline from client error telemetry submission to notification dispatch.

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Client
    participant GW as API Gateway
    participant Ingest as Ingestion Service
    participant Bus as Kafka Event Bus
    participant Proc as Processing Service
    participant S3 as S3 Blob Store
    participant Group as Grouping Service
    participant DB as PostgreSQL
    participant CH as ClickHouse
    participant Alert as Alerting Service
    participant Redis as Redis
    participant Notif as Notification Service

    Client->>GW: POST /api/v1/ingest/store (Raw Telemetry)
    GW->>GW: Validate Auth Header & Rate Limit
    GW->>Ingest: Proxy Write Request
    Ingest->>Bus: Publish 'telemetry.received' Event
    Ingest-->>GW: Return 202 Accepted
    GW-->>Client: 202 Accepted { eventId }

    Bus->>Proc: Consume 'telemetry.received' Event
    Proc->>Proc: Scrub PII/Secrets (Email, Bearer Tokens, API Keys)
    Proc->>S3: Upload raw payload blob
    Proc->>Bus: Publish 'telemetry.processed' Event

    Bus->>Group: Consume 'telemetry.processed' Event
    Group->>Group: Generate SHA256 Fingerprint
    Group->>DB: Upsert Issue Record (Postgres)
    Group->>CH: Insert Time-Series Occurrence (ClickHouse)
    Group->>Bus: Publish 'issue.grouped' Event

    Bus->>Alert: Consume 'issue.grouped' Event
    Alert->>Redis: Check Cooldown Window (5 min)
    alt Cooldown Active
        Alert->>Alert: Suppress Duplicate Alert
    else Cooldown Expired
        Alert->>Redis: Set Cooldown Timestamp
        Alert->>Bus: Publish 'alert.triggered' Event
    end

    Bus->>Notif: Consume 'alert.triggered' Event
    Notif->>Notif: Format Slack & Webhook Payload
    Notif->>Client: Dispatch HTTP POST Webhooks
\`\`\`

---

## 3. Deep-Dive Component Specifications

### 3.1 API Gateway (\`apps/gateway\`)
- **Primary Responsibility**: Entry point for all external traffic. Enforces security, authentication, and rate limiting before dispatching requests to microservices.
- **Key Features**:
  - **Rate Limiting**: Fixed-window sliding rate limiter limiting requests per API key or IP address (e.g. 100 requests / 60 seconds).
  - **Auth Header Verification**: Validates presence of \`authorization\` or \`x-api-key\` headers.
  - **CQRS Route Dispatching**:
    - \`POST /api/v1/ingest/*\` -> Proxy to Ingestion Service (Write Path).
    - \`GET /api/v1/query/*\` & \`GET /api/v1/issues/*\` -> Proxy to Query Service (Read Path).

\`\`\`mermaid
flowchart LR
    Request[HTTP Request] --> AuthCheck{Auth Header Present?}
    AuthCheck -->|No| R401[401 Unauthorized]
    AuthCheck -->|Yes| RateCheck{Rate Limit Exceeded?}
    RateCheck -->|Yes| R429[429 Too Many Requests]
    RateCheck -->|No| PathRoute{URL Path}
    PathRoute -->|/api/v1/ingest| WriteService[Ingestion Write Service]
    PathRoute -->|/api/v1/query| ReadService[Query Read Service]
\`\`\`

---

### 3.2 Ingestion Service (\`apps/ingestion\`)
- **Primary Responsibility**: Ultra-lightweight, high-throughput write service designed to absorb bursty incoming telemetry loads without blocking.
- **Data Pattern**: Non-blocking ingestion. Returns HTTP \`202 Accepted\` immediately upon publishing \`telemetry.received\` to Kafka.
- **Payload Validation**: Ensures raw body and project headers are structurally present.

---

### 3.3 Processing Service (\`apps/processing\`)
- **Primary Responsibility**: Data sanitization, PII scrubbing, stack trace normalization, and raw blob persistence.
- **PII Scrubbing Rules**:
  - Email addresses -> \`[SCRUBBED_EMAIL]\`
  - Bearer tokens -> \`Bearer [SCRUBBED_TOKEN]\`
  - API Keys / Credentials -> \`apikey=[SCRUBBED_KEY]\`
- **Storage Driver**: Uploads un-scrubbed/raw stack traces to S3 / MinIO (\`s3://litetrace-blobs/raw/{tenantId}/{eventId}.json\`).
- **Event Output**: Emits \`telemetry.processed\`.

---

### 3.4 Grouping Service (\`apps/grouping\`)
- **Primary Responsibility**: Error fingerprinting, issue state management, and analytical event recording.
- **Fingerprinting Algorithm**:
  - SHA256 digest computed over \`normalize(title) + normalize(culprit)\`.
- **Polyglot Persistence**:
  - **PostgreSQL**: Upserts domain \`Issue\` records (fingerprint, status, title, last_seen, occurrence_count).
  - **ClickHouse**: Writes append-only time-series records for analytical search and telemetry dashboards.
- **Event Output**: Emits \`issue.grouped\`.

---

### 3.5 Alerting Service (\`apps/alerting\`)
- **Primary Responsibility**: Error burst evaluation and rate cooldown enforcement.
- **Trigger Criteria**:
  - **New Error**: Always triggers on first error occurrence (\`isNew: true\`).
  - **Error Burst**: Triggers when occurrence count crosses step thresholds (5, 10, 50, 100 occurrences).
- **Redis Cooldown Enforcement**: Evaluates Redis cooldown key \`cooldown:{issueId}\` with a 300-second window to prevent alert storming.
- **Event Output**: Emits \`alert.triggered\`.

---

### 3.6 Notification Service (\`apps/notification\`)
- **Primary Responsibility**: Multi-channel notification delivery (Slack webhooks, emails).
- **Resilience**: Retries webhook dispatches with exponential backoff. Failed dispatches route to Dead-Letter Queue (DLQ).

---

### 3.7 Query / API Service (\`apps/query\`)
- **Primary Responsibility**: Powers the dashboard UI (CQRS Read Side).
- **Performance**: Reads from Postgres read replicas and ClickHouse time-series tables, completely isolated from ingest write spikes.

---

## 4. Resilience & Error Handling Architecture

The platform embeds resilience patterns in \`packages/events\` to handle transient infrastructure failures.

\`\`\`mermaid
stateDiagram-v2
    [*] --> CLOSED: Initial State
    CLOSED --> OPEN: Failure Threshold Reached (5 consecutive errors)
    OPEN --> HALF_OPEN: Reset Timeout Expired (10 seconds)
    HALF_OPEN --> CLOSED: Test Execution Successful
    HALF_OPEN --> OPEN: Test Execution Failed
    
    note right of OPEN
        Executions blocked immediately.
        Prevents cascade failures.
    end note
\`\`\`

### Resilience Controls
1. **Exponential Backoff Retries**: Failed event handlers retry with doubling delays (\`initialBackoffMs * 2^(attempt-1)\`).
2. **Circuit Breaker**: Isolates failing services when error rate exceeds threshold (\`CLOSED\` -> \`OPEN\` -> \`HALF_OPEN\`).
3. **Dead-Letter Queue (DLQ)**: Captures unprocessable events after maximum retries are exhausted for manual review and replay.

---

## 5. Polyglot Persistence Matrix

| Service | Primary Storage | Store Type | Data Content |
| :--- | :--- | :--- | :--- |
| **Ingestion** | Redis | In-Memory Buffer | Temporary rate limit counters & request headers |
| **Processing** | S3 / MinIO | Object Storage | Raw stack trace blobs, request bodies, attachments |
| **Grouping** | PostgreSQL | Relational DB | Issues, fingerprints, project settings, tenant metadata |
| **Grouping / Query** | ClickHouse | Time-Series OLAP | High-volume occurrence events, telemetry metrics |
| **Alerting** | Redis | In-Memory Key-Value | Alert cooldown timestamps, rule evaluation counters |

---

## 6. Local & Production Deployment Guides

### 6.1 Local Multi-Container Stack (Docker Compose)
Run the full polyglot stack locally:
\`\`\`bash
docker compose up --build
\`\`\`
Services spun up:
- \`postgres\` (Port 5432)
- \`redis\` (Port 6379)
- \`kafka\` / Redpanda (Port 9092)
- \`clickhouse\` (Port 8123)
- \`minio\` (Port 9000/9001)
- \`gateway\` (Port 8000)
- Microservices (\`ingestion\`, \`processing\`, \`grouping\`, \`alerting\`, \`notification\`, \`query\`)

### 6.2 Kubernetes Deployment (Production HPA)
Deploy manifests in \`deploy/kubernetes/\`:
\`\`\`bash
kubectl apply -f deploy/kubernetes/gateway-deployment.yaml
kubectl apply -f deploy/kubernetes/microservices-deployments.yaml
\`\`\`
- **Horizontal Pod Autoscaler (HPA)**: Auto-scales Ingestion Service from 3 to 20 replicas based on CPU utilization (>65%).
`
    },
    {
      id: 'gen-004',
      filename: 'super_admin_capabilities.md',
      path: 'c:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\b926e82d-ec67-4140-8a3d-0a17439c7821\\super_admin_capabilities.md',
      category: 'Governance',
      isFeaturedInGeneral: true,
      title: 'Super Admin Capabilities — LiteTrace Platform Control',
      subtitle: 'Platform-level vs Org-level separation & Management Features',
      description: 'Defines the super admin capabilities for multi-tenant LiteTrace platform control including tenant management, billing overrides, moderation, and infra monitoring priorities for the MVP.',
      size: '2.5 KB',
      lines: 65,
      lastUpdated: '2026-07-28',
      tags: ['Super Admin', 'Governance', 'Multi-tenant', 'Platform Control'],
      securityLevel: 'Super Admin',
      summaryHighlights: [
        'Separates Platform-level (cross-tenant) and Org-level (single-tenant) controls.',
        'Defines MVP priorities: Org list, impersonation, queue health, manual overrides, basic audit log.',
        'Details 7 pillars: Tenant, User, Billing, Ops, Moderation, Config, Security.'
      ],
      content: `# Super Admin Capabilities — LiteTrace Platform Control

Since you're multi-tenant (org → project → RLS), split this into **Platform-level** (super admin, cross-tenant) vs **Org-level** (org admin, single-tenant). Super admin = you/your ops team, not customers.

## 1. Tenant / Org Management

| Feature | Purpose |
|---|---|
| List/search all orgs | Cross-tenant visibility |
| View org details (plan, usage, event volume, storage) | Support & billing checks |
| Suspend/reactivate org | Non-payment, abuse |
| Force-delete org + cascade data | Offboarding, GDPR/DPDP requests |
| Impersonate org (view-as, no write) | Debug customer issues without asking for creds |
| Override plan/limits manually | Custom deals, comped accounts |
| Org creation on behalf of customer | Manual onboarding/sales-assisted signup |

## 2. User & Access Management

| Feature | Purpose |
|---|---|
| Global user search (across all orgs) | Support lookups |
| Force password reset / revoke sessions | Security incidents |
| Ban/suspend a user platform-wide | Abuse, spam |
| View user's org memberships | Multi-org users |
| Grant/revoke super admin role | Bootstrap other admins |
| Audit login history (IP, device, timestamp) | Security investigation |

## 3. Billing & Plan Control

| Feature | Purpose |
|---|---|
| View/edit subscription state per org | Manual billing fixes |
| Issue credits/refunds | Support resolution |
| Change plan tier without payment flow | Sales overrides, trials |
| Set custom event quota / retention days | Enterprise negotiation |
| View MRR, churn, org-wise revenue dashboard | Business metrics |

## 4. Platform Ops / Infra Monitoring

| Feature | Purpose |
|---|---|
| Ingest pipeline health (Relay/Redis Streams lag, queue depth) | Since you're using Redis Streams — critical to watch backlog |
| Asynq worker queue dashboard (pending/failed/retrying jobs) | Fingerprint worker health |
| Postgres connection pool / RLS query stats | Multi-tenant DB health |
| Global event throughput (events/sec, by org) | Capacity planning |
| Dead-letter queue viewer + requeue | Failed event reprocessing |
| Rate-limit config per org (events/min) | Abuse prevention, noisy-neighbor isolation |

## 5. Data & Content Moderation

| Feature | Purpose |
|---|---|
| View/delete any org's error events (support access) | Debug on customer's behalf |
| Global search across all orgs (support only, logged) | Incident investigation |
| PII scrub/redaction override | DPDP Act compliance |
| Data export tool (for compliance requests) | Right-to-access requests |
| Storage usage breakdown per org | Cost attribution |

## 6. Platform Configuration

| Feature | Purpose |
|---|---|
| Feature flags per org/plan tier | Gradual rollout, plan gating |
| Global alert-rule templates | Default rules for new orgs |
| SDK/integration allowlist (Slack, webhook targets) | Security control on outbound integrations |
| System-wide banner/maintenance mode | Incident comms |
| API key management (revoke any org's key) | Security incident response |

## 7. Security & Audit

| Feature | Purpose |
|---|---|
| Full audit log (who did what, when, cross-org) | Compliance, debugging |
| Anomaly detection (sudden event spike = possible abuse/leak) | Cost & security protection |
| IP allowlist/blocklist at platform level | Block malicious ingest sources |
| Webhook endpoint validation (SSRF protection) | Must sanitize outbound URLs |

---

## Priority for MVP (given your stack + solo/small team)

1. Org list + suspend/delete
2. Impersonate (view-as) — biggest support time-saver
3. Asynq queue + Redis Streams health dashboard
4. Manual plan override + usage view
5. Audit log (basic: actor, action, timestamp, org_id)

Everything else can wait till you have paying customers demanding it.
`
    }
  ];
}

// ────── Interactive Visual Architecture Diagram Renderer ───────────────────────

function VisualArchitectureDiagram({ codeStr }: { codeStr: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#E6F7F0',
        primaryTextColor: '#13221C',
        primaryBorderColor: '#20C997',
        lineColor: '#20C997',
        secondaryColor: '#20C997',
        tertiaryColor: '#FAFBFB'
      },
      fontFamily: 'Inter, sans-serif'
    });
    
    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, codeStr);
        setSvgContent(svg);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };
    renderChart();
  }, [codeStr]);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-mono overflow-auto whitespace-pre-wrap">
        {error}
      </div>
    );
  }

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative group p-4 rounded-2xl bg-white border border-[#E2E8E4] shadow-sm mb-6 w-full">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={downloadSvg}
          title="Download SVG Diagram"
          className="p-1.5 bg-white border border-[#E2E8E4] rounded-md shadow-sm hover:bg-[#E6F7F0] hover:text-[#0B4F3A] text-[#687870] transition-colors flex items-center justify-center"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
      <div 
        ref={chartRef}
        dangerouslySetInnerHTML={{ __html: svgContent }} 
        className="flex justify-center overflow-x-auto w-full [&>svg]:max-w-full [&>svg]:h-auto"
      />
    </div>
  );
}
// ────── Rich Formatted Markdown Preview Renderer Component ────────────────────

function MarkdownPreviewRenderer({ content, file }: { content: string; file: SystemFileDoc }) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const copyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const renderInlineFormatted = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-[#13221C]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-[#E6F7F0] text-[#0B4F3A] px-1.5 py-0.5 rounded font-mono text-[11px] font-bold border border-[#20C997]/20">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const linkText = part.slice(1, part.indexOf(']('));
        const linkUrl = part.slice(part.indexOf('](') + 2, -1);
        return (
          <a key={i} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-[#0B4F3A] hover:underline font-bold inline-flex items-center gap-0.5">
            <span>{linkText}</span>
            <ExternalLink className="w-3 h-3 text-[#20C997]" />
          </a>
        );
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let codeBlockCounter = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    if (rawLine === undefined) {
      i++;
      continue;
    }
    const line = rawLine;

    // Blank lines
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Horizontal Rules
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-t border-[#E2E8E4]" />);
      i++;
      continue;
    }

    // Code Blocks & Diagrams (```mermaid, ```bash, ```json, etc.)
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length) {
        const cur = lines[i];
        if (cur === undefined || cur.trim().startsWith('```')) break;
        codeLines.push(cur);
        i++;
      }
      if (i < lines.length && lines[i]?.trim().startsWith('```')) i++; // skip closing ```

      const codeStr = codeLines.join('\n');
      const currentIdx = codeBlockCounter++;
      const isMermaid = codeStr.includes('graph TD') || codeStr.includes('sequenceDiagram') || codeStr.includes('flowchart') || codeStr.includes('stateDiagram');

      if (isMermaid) {
        blocks.push(
          <div key={`diagram-block-${i}`} className="my-6 rounded-2xl bg-gradient-to-br from-[#0B4F3A]/5 via-white to-[#E6F7F0]/40 p-6 border border-[#20C997]/30 shadow-md">
            
            {/* Visual Architecture Interactive Component */}
            <VisualArchitectureDiagram codeStr={codeStr} />

            {/* Mermaid Code DSL Container */}
            <div className="mt-5 bg-[#1e1e1e] text-[#d4d4d4] rounded-xl p-4 font-mono text-xs overflow-x-auto relative shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#333] text-[10px] text-[#858585] font-bold uppercase tracking-wider">
                <span>Mermaid Diagram Source DSL</span>
                <button
                  onClick={() => copyCode(codeStr, currentIdx)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-colors flex items-center gap-1"
                >
                  {copiedCodeIdx === currentIdx ? <Check className="w-3 h-3 text-[#20C997]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCodeIdx === currentIdx ? 'Copied' : 'Copy DSL'}</span>
                </button>
              </div>
              <pre className="leading-relaxed">{codeStr}</pre>
            </div>
          </div>
        );
      } else {
        blocks.push(
          <div key={`code-${i}`} className="my-4 rounded-xl bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-xs overflow-x-auto relative group shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#333] text-[10px] text-[#858585] font-bold uppercase tracking-wider">
              <span>Code Snippet</span>
              <button
                onClick={() => copyCode(codeStr, currentIdx)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] transition-colors flex items-center gap-1"
              >
                {copiedCodeIdx === currentIdx ? <Check className="w-3 h-3 text-[#20C997]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodeIdx === currentIdx ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="leading-relaxed">{codeStr}</pre>
          </div>
        );
      }
      continue;
    }

    // GitHub Alerts (> [!NOTE], > [!IMPORTANT], > [!WARNING], > [!CAUTION], > [!TIP])
    if (line.trim().startsWith('> [!')) {
      const alertType = line.trim().slice(4, -1).toUpperCase();
      const alertLines: string[] = [];
      i++;
      while (i < lines.length) {
        const cur = lines[i];
        if (cur === undefined || !cur.trim().startsWith('>')) break;
        alertLines.push(cur.trim().replace(/^>\s*/, ''));
        i++;
      }

      const alertConfigs = {
        NOTE: { bg: 'bg-sky-50 border-sky-200 text-sky-950', icon: Info, iconColor: 'text-sky-600', badge: 'Note' },
        TIP: { bg: 'bg-[#E6F7F0] border-[#20C997]/40 text-[#0B4F3A]', icon: Sparkles, iconColor: 'text-[#20C997]', badge: 'Pro Tip' },
        IMPORTANT: { bg: 'bg-purple-50 border-purple-200 text-purple-950', icon: ShieldCheck, iconColor: 'text-purple-600', badge: 'Important' },
        WARNING: { bg: 'bg-yellow-50 border-yellow-200 text-yellow-950', icon: AlertTriangle, iconColor: 'text-yellow-600', badge: 'Warning' },
        CAUTION: { bg: 'bg-rose-50 border-rose-200 text-rose-950', icon: ShieldAlert, iconColor: 'text-rose-600', badge: 'Critical Caution' },
      };

      const cfg = alertConfigs[alertType as keyof typeof alertConfigs] || alertConfigs.NOTE;
      const IconComp = cfg.icon;

      blocks.push(
        <div key={`alert-${i}`} className={`my-4 p-4 rounded-2xl border ${cfg.bg} shadow-2xs space-y-1.5`}>
          <div className="flex items-center gap-2 font-extrabold text-xs">
            <IconComp className={`w-4 h-4 ${cfg.iconColor}`} />
            <span className="uppercase tracking-wider">{cfg.badge}</span>
          </div>
          <div className="text-xs leading-relaxed space-y-1 font-medium pl-6">
            {alertLines.map((al, idx) => (
              <p key={idx}>{renderInlineFormatted(al)}</p>
            ))}
          </div>
        </div>
      );
      continue;
    }

    // Headers (#, ##, ###)
    if (line.startsWith('# ')) {
      blocks.push(
        <div key={`h1-${i}`} className="my-6 pb-3 border-b-2 border-[#0B4F3A]/20">
          <span className="px-2.5 py-0.5 rounded-full bg-[#0B4F3A]/10 text-[#0B4F3A] text-[10px] font-extrabold uppercase tracking-widest mb-2 inline-block">
            Document Title
          </span>
          <h1 className="text-2xl font-black tracking-tight text-[#13221C] leading-tight">
            {line.replace('# ', '')}
          </h1>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <div key={`h2-${i}`} className="mt-8 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0B4F3A] text-white font-black text-sm flex items-center justify-center shadow-xs">
            <Hash className="w-4 h-4 text-[#20C997]" />
          </div>
          <h2 className="text-lg font-extrabold text-[#13221C] tracking-tight">
            {line.replace('## ', '')}
          </h2>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="mt-5 mb-2 text-sm font-extrabold text-[#0B4F3A] uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#20C997]" />
          {line.replace('### ', '')}
        </h3>
      );
      i++;
      continue;
    }

    // Markdown Tables (| header1 | header2 |)
    if (line.trim().startsWith('|')) {
      const tableRows: string[][] = [];
      while (i < lines.length) {
        const cur = lines[i];
        if (cur === undefined || !cur.trim().startsWith('|')) break;
        const rowText = cur.trim();
        if (!rowText.includes('---')) {
          const cells = rowText.split('|').map(c => c.trim()).filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1);
          tableRows.push(cells);
        }
        i++;
      }

      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1);

        if (headerRow) {
          blocks.push(
            <div key={`table-${i}`} className="my-5 overflow-hidden rounded-2xl border border-[#E2E8E4] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B4F3A] text-white">
                    <tr>
                      {headerRow.map((cell, hIdx) => (
                        <th key={hIdx} className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">
                          {renderInlineFormatted(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F1] bg-white">
                    {bodyRows.map((bRow, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#FAFBFB] transition-colors">
                        {bRow.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-[#13221C] font-medium leading-relaxed">
                            {renderInlineFormatted(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
      }
      continue;
    }

    // Bullet Lists (- or * or 1.)
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim())) {
      const listItems: string[] = [];
      while (i < lines.length) {
        const cur = lines[i];
        if (
          cur === undefined ||
          (!cur.trim().startsWith('- ') && !cur.trim().startsWith('* ') && !/^\d+\.\s/.test(cur.trim()))
        ) {
          break;
        }
        listItems.push(cur.trim().replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, ''));
        i++;
      }

      blocks.push(
        <ul key={`ul-${i}`} className="my-3 space-y-2 pl-2">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 text-xs text-[#13221C] leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-[#20C997] shrink-0 mt-0.5" />
              <span>{renderInlineFormatted(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Default Paragraphs
    blocks.push(
      <p key={`p-${i}`} className="my-2.5 text-xs text-[#13221C] leading-relaxed font-medium">
        {renderInlineFormatted(line)}
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-4">
      {/* Overview Top Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0B4F3A] to-[#2d6a4f] text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d8f3dc]">Live Formatted Document Preview</span>
          <h2 className="text-lg font-black tracking-tight mt-0.5">{file.title}</h2>
          <p className="text-xs text-[#d8f3dc]/80 mt-1 max-w-xl">{file.description}</p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold font-mono">
            {file.size}
          </span>
          <span className="text-[10px] text-[#d8f3dc] font-semibold">
            {file.lines} total lines
          </span>
        </div>
      </div>

      {/* Rendered Document Body */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8E4] shadow-sm">
        {blocks}
      </div>
    </div>
  );
}

// ────── Main Super Admin Files Component ───────────────────────────────────────

export function SuperAdminFiles() {
  const [activeCategory, setActiveCategory] = useState<string>('General');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<SystemFileDoc | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'diagrams' | 'raw' | 'highlights'>('preview');
  const [copiedPathId, setCopiedPathId] = useState<string | null>(null);

  // Filter files based on category and search query
  const filteredFiles = SystemFileStore.FILES.filter(file => {
    const matchesCategory = activeCategory === 'All' || file.category === activeCategory;
    const matchesSearch =
      file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const generalFiles = SystemFileStore.FILES.filter(f => f.isFeaturedInGeneral);

  const handleCopyPath = (file: SystemFileDoc, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(file.path);
    setCopiedPathId(file.id);
    setTimeout(() => setCopiedPathId(null), 2000);
  };

  const handleDownload = (file: SystemFileDoc, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const blob = new Blob([file.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* ─── Super Admin Header Banner ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B4F3A] via-[#1b4332] to-[#2d6a4f] p-6 text-white shadow-xl">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'radial-gradient(circle at 85% 30%, #52b788 0%, transparent 60%)'
        }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#52b788]/20 text-[#d8f3dc] border border-[#52b788]/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#52b788]" />
                Super Admin Vault
              </span>
              <span className="text-xs text-[#d8f3dc]/70 font-semibold font-mono">system://docs/repository</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">System Files &amp; Knowledge Repository</h1>
            <p className="text-sm text-[#d8f3dc]/80 mt-1 max-w-2xl">
              Central super admin repository storing core system analyses, architecture specifications, governance guidelines, and deployment manifests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 text-center border border-white/10">
              <div className="text-2xl font-extrabold font-mono">{SystemFileStore.FILES.length}</div>
              <div className="text-[10px] font-bold text-[#d8f3dc] uppercase tracking-widest mt-0.5">Stored Files</div>
            </div>
            <div className="bg-[#52b788]/20 backdrop-blur-md rounded-xl px-4 py-3 text-center border border-[#52b788]/30">
              <div className="text-2xl font-extrabold font-mono text-[#d8f3dc]">{generalFiles.length}</div>
              <div className="text-[10px] font-bold text-[#d8f3dc] uppercase tracking-widest mt-0.5">General Files</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search & Category Pill Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E2E8E4] shadow-sm">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'General', label: 'General', icon: BookOpen, count: generalFiles.length, badge: 'Featured' },
            { id: 'All', label: 'All Files', icon: Folder, count: SystemFileStore.FILES.length },
            { id: 'Architecture', label: 'Architecture', icon: Layers, count: 1 },
            { id: 'Governance', label: 'Governance', icon: ShieldCheck, count: 1 },
            { id: 'Deployment', label: 'Deployment', icon: Terminal, count: 1 },
          ].map(cat => {
            const Icon = cat.icon;
            const isCatActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isCatActive
                    ? 'bg-[#0B4F3A] text-white shadow-md'
                    : 'bg-[#F0F2F1] text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isCatActive ? 'bg-white/20 text-white' : 'bg-[#E2E8E4] text-[#687870]'
                }`}>
                  {cat.count}
                </span>
                {cat.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-yellow-400 text-yellow-950 ml-0.5">
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filenames, paths, tags..."
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E2E8E4] rounded-xl text-xs font-semibold text-[#13221C] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0B4F3A] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#13221C]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── GENERAL SECTION (FEATURED HIGHLIGHT) ───────────────────────── */}
      {(activeCategory === 'General' || activeCategory === 'All') && (
        <div className="space-y-4 rounded-2xl bg-gradient-to-br from-[#E6F7F0]/80 via-white to-[#FAFBFB] p-6 border border-[#20C997]/30 shadow-sm relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0B4F3A] flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-[#20C997]" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#13221C] flex items-center gap-2">
                  General System Documentation Section
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#0B4F3A] text-white">
                    Primary Vault
                  </span>
                </h2>
                <p className="text-xs text-[#687870] mt-0.5">
                  Core files well-represented under the General section with comparative matrices, security audits, and microservices specs.
                </p>
              </div>
            </div>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B4F3A]/10 text-[#0B4F3A] text-xs font-bold border border-[#0B4F3A]/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#20C997]" />
              3 Primary Files Well-Represented
            </span>
          </div>

          {/* General Section File Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {generalFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => {
                  setSelectedFile(file);
                  setActiveTab('preview');
                }}
                className="group relative bg-white rounded-2xl p-5 border border-[#E2E8E4] hover:border-[#0B4F3A] shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* File Badge & Path */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono uppercase bg-[#E6F7F0] text-[#0B4F3A] border border-[#20C997]/30">
                      Formatted Doc
                    </span>
                    <span className="text-[10px] font-bold text-[#687870] font-mono">
                      {file.size}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-sm font-bold text-[#13221C] group-hover:text-[#0B4F3A] transition-colors leading-snug">
                      {file.filename}
                    </h3>
                    <p className="text-[11px] font-semibold text-[#0B4F3A] mt-1 line-clamp-1">
                      {file.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#687870] line-clamp-3 leading-relaxed">
                    {file.description}
                  </p>
                </div>

                {/* File Footer */}
                <div className="mt-4 pt-3 border-t border-[#F0F2F1] flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-[#687870] font-medium">
                    <Tag className="w-3 h-3 text-[#20C997]" />
                    <span>General</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleCopyPath(file, e)}
                      className="p-1.5 rounded-lg hover:bg-[#E6F7F0] text-[#687870] hover:text-[#0B4F3A] transition-colors"
                      title="Copy file path"
                    >
                      {copiedPathId === file.id ? <Check className="w-3.5 h-3.5 text-[#0B4F3A]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => handleDownload(file, e)}
                      className="p-1.5 rounded-lg hover:bg-[#E6F7F0] text-[#687870] hover:text-[#0B4F3A] transition-colors"
                      title="Download markdown file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <span className="ml-1 flex items-center gap-1 text-xs font-bold text-[#0B4F3A]">
                      Preview <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ─── ALL CATEGORIZED FILES TABLE LIST ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8E4] shadow-sm overflow-hidden">
        
        <div className="px-6 py-4 border-b border-[#E2E8E4] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#13221C] flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#0B4F3A]" />
              Super Admin File Catalog ({filteredFiles.length})
            </h3>
            <p className="text-[11px] text-[#687870] mt-0.5">
              Showing files for category: <span className="font-bold text-[#0B4F3A]">{activeCategory}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#687870] uppercase tracking-wider">
              {filteredFiles.length} item{filteredFiles.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center text-[#687870]">
            <Folder className="w-10 h-10 mx-auto text-[#9CA3AF] mb-3" />
            <h4 className="text-sm font-bold text-[#13221C]">No matching files found</h4>
            <p className="text-xs mt-1">Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F2F1]">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                onClick={() => {
                  setSelectedFile(file);
                  setActiveTab('preview');
                }}
                className="p-4 sm:px-6 hover:bg-[#FAFBFB] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    file.isFeaturedInGeneral ? 'bg-[#0B4F3A]/10 text-[#0B4F3A]' : 'bg-[#F0F2F1] text-[#687870]'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#13221C] group-hover:text-[#0B4F3A] transition-colors truncate">
                        {file.filename}
                      </span>
                      {file.isFeaturedInGeneral && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-[#0B4F3A] text-white">
                          General
                        </span>
                      )}
                      <span className="px-2 py-0.2 rounded-md text-[9px] font-bold bg-[#F0F2F1] text-[#687870]">
                        {file.category}
                      </span>
                    </div>

                    <p className="text-xs text-[#687870] mt-0.5 truncate max-w-xl">
                      {file.subtitle || file.description}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[#9CA3AF] font-mono">
                      <span>{file.path}</span>
                      <span>•</span>
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.lines} lines</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={(e) => handleCopyPath(file, e)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F0F2F1] hover:bg-[#E6F7F0] text-[#687870] hover:text-[#0B4F3A] text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="Copy File Path"
                  >
                    {copiedPathId === file.id ? <Check className="w-3.5 h-3.5 text-[#0B4F3A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden md:inline">{copiedPathId === file.id ? 'Copied' : 'Copy Path'}</span>
                  </button>

                  <button
                    onClick={(e) => handleDownload(file, e)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F0F2F1] hover:bg-[#E6F7F0] text-[#687870] hover:text-[#0B4F3A] text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Download</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFile(file);
                      setActiveTab('preview');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0B4F3A] hover:bg-[#083C2C] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#20C997]" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ─── INTERACTIVE RICH FORMATTED PREVIEW MODAL DRAWER ───────────── */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          
          <div className="w-full max-w-5xl bg-[#FAFBFB] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0B4F3A] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white/10 shrink-0">
                  <BookOpen className="w-5 h-5 text-[#20C997]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold truncate">{selectedFile.filename}</h3>
                    {selectedFile.isFeaturedInGeneral && (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-[#20C997] text-[#0B4F3A]">
                        General Vault
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#d8f3dc]/80 font-mono truncate">{selectedFile.path}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPath(selectedFile)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                  title="Copy File Path"
                >
                  {copiedPathId === selectedFile.id ? <Check className="w-4 h-4 text-[#20C997]" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                  title="Download Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 py-2.5 bg-white border-b border-[#E2E8E4] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {[
                  { id: 'preview', label: 'Formatted Web Preview', icon: Eye },
                  { id: 'diagrams', label: 'Architecture Diagrams', icon: Workflow, badge: 'Graphic & Flow' },
                  { id: 'highlights', label: 'Executive Highlights', icon: Sparkles },
                  { id: 'raw', label: 'Raw Markdown Code', icon: Terminal },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        activeTab === tab.id
                          ? 'bg-[#0B4F3A] text-white shadow-md'
                          : 'text-[#687870] hover:bg-[#E6F7F0] hover:text-[#0B4F3A]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                          activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] font-semibold text-[#687870] hidden sm:flex items-center gap-3 font-mono">
                <span>Size: {selectedFile.size}</span>
                <span>•</span>
                <span>Lines: {selectedFile.lines}</span>
              </div>
            </div>

            {/* Modal Content Area */}
            <div className="p-6 overflow-y-auto flex-1 font-sans space-y-4">
              
              {/* Formatted Web Preview View */}
              {activeTab === 'preview' && (
                <MarkdownPreviewRenderer content={selectedFile.content} file={selectedFile} />
              )}

              {/* Architecture Diagrams Graphic & Interactive View */}
              {activeTab === 'diagrams' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#E2E8E4] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F0F2F1] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0B4F3A] text-white flex items-center justify-center shadow-sm">
                          <Workflow className="w-5 h-5 text-[#20C997]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-[#13221C]">System Architecture Graphic Diagrams &amp; Flow</h4>
                          <p className="text-xs text-[#687870]">High-resolution vector architecture images &amp; interactive node topology</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#0B4F3A] text-white text-[10px] font-extrabold uppercase tracking-wider">
                        Visual Diagrams
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#13221C]">1. Target 7-Microservices Topology Diagram</span>
                          <span className="text-[10px] font-bold text-[#0B4F3A] font-mono">PNG Graphic</span>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-[#E2E8E4] shadow-sm bg-[#0B4F3A]/5 hover:shadow-md transition-shadow">
                          <img
                            src="/diagrams/system_microservices_architecture.png"
                            alt="System Microservices Architecture Diagram"
                            className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#13221C]">2. End-to-End Sequence Flow Pipeline Diagram</span>
                          <span className="text-[10px] font-bold text-[#0B4F3A] font-mono">PNG Graphic</span>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-[#E2E8E4] shadow-sm bg-[#0B4F3A]/5 hover:shadow-md transition-shadow">
                          <img
                            src="/diagrams/event_sequence_flow.png"
                            alt="Event Sequence Flow Diagram"
                            className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <VisualArchitectureDiagram codeStr={selectedFile.content} />
                </div>
              )}

              {/* Raw Markdown Code View */}
              {activeTab === 'raw' && (
                <div className="bg-[#1e1e1e] text-[#d4d4d4] p-5 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-md border border-[#333]">
                  {selectedFile.content.split('\n').map((line, idx) => (
                    <div key={idx} className="flex hover:bg-white/5 transition-colors">
                      <span className="w-10 shrink-0 text-[#858585] select-none text-right pr-4">{idx + 1}</span>
                      <span className="whitespace-pre">{line}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Highlights View */}
              {activeTab === 'highlights' && (
                <div className="space-y-4">
                  <div className="p-5 bg-white rounded-2xl border border-[#E2E8E4] shadow-sm">
                    <h4 className="text-sm font-extrabold text-[#13221C] mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#20C997]" /> Executive Summary Highlights
                    </h4>
                    <div className="space-y-2">
                      {selectedFile.summaryHighlights.map((hl, i) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAFBFB] border border-[#E2E8E4]">
                          <CheckCircle2 className="w-4 h-4 text-[#20C997] shrink-0 mt-0.5" />
                          <span className="text-xs text-[#13221C] font-medium leading-relaxed">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-[#E2E8E4] shadow-sm">
                    <h4 className="text-xs font-bold text-[#687870] uppercase tracking-wider mb-3">Document Metadata &amp; Security</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-[#FAFBFB] rounded-xl border border-[#E2E8E4]">
                        <span className="text-[10px] text-[#9CA3AF] block uppercase font-bold">Category</span>
                        <span className="font-bold text-[#13221C]">{selectedFile.category}</span>
                      </div>
                      <div className="p-3 bg-[#FAFBFB] rounded-xl border border-[#E2E8E4]">
                        <span className="text-[10px] text-[#9CA3AF] block uppercase font-bold">Security Clearance</span>
                        <span className="font-bold text-[#0B4F3A]">{selectedFile.securityLevel}</span>
                      </div>
                      <div className="p-3 bg-[#FAFBFB] rounded-xl border border-[#E2E8E4]">
                        <span className="text-[10px] text-[#9CA3AF] block uppercase font-bold">Last Audit Date</span>
                        <span className="font-bold text-[#13221C]">{selectedFile.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-[#E2E8E4] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#687870] font-mono truncate max-w-md">
                {selectedFile.path}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 bg-[#0B4F3A] text-white text-xs font-bold rounded-xl hover:bg-[#083C2C] transition-colors shadow-sm"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
