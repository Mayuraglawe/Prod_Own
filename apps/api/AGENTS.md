# Fastify Ingest API (`apps/api`) — Development & Governance Guidelines

This document provides service-specific execution boundaries, patterns, security, and verification rules for `apps/api`.

---

## 1. Scope & Execution Boundaries (Preventing Runaway Changes)

- **Primary Responsibility**: Public HTTP telemetry ingest endpoint (`POST /ingest`), alert webhook receivers (`POST /alerts/slack`), and payment webhook receivers (`POST /billing/razorpay/webhook`).
- **Forbidden Scope Extensions**:
  - Do **NOT** perform synchronous database persistence, stack trace parsing, PII scrubbing, or fingerprint hashing inside HTTP request handlers.
  - Do **NOT** introduce heavy vendor SDKs for alerting or payments; use BullMQ queue offloading and lightweight HTTP hooks.
  - Do **NOT** mount raw unvalidated routes without Helmet security headers and CORS protection.

---

## 2. Architecture & Pattern Compliance

- **Framework & Plugins**: Fastify with `@fastify/cors` and `@fastify/helmet` ([server.ts](file:///e:/Prod_Own/apps/api/src/server.ts#L43-L49)).
- **Async Queue Pattern**: Request handlers MUST validate payloads, push jobs to BullMQ queues (`@prod-own/queue`), and immediately return `202 Accepted` to minimize API latency ([ingest.ts:L45-L56](file:///e:/Prod_Own/apps/api/src/routes/ingest.ts#L45-L56)).
- **Config Access**: Load environment variables exclusively through `@prod-own/config` (`env.APP_URL`, `env.TENANT_HEADER`, `env.REDIS_URL`). Never access `process.env` directly.
- **Observability Integration**: OpenTelemetry SDK lifecycle hooks (`sdk.start()` on boot, `sdk.shutdown()` on Fastify `onClose`).

---

## 3. Security & Safety Rules

- **Pre-Queue Validation**: Strictly validate mandatory fields (`tenantId`, `sourceId`, `content`) before enqueuing jobs ([ingest.ts:L33-L37](file:///e:/Prod_Own/apps/api/src/routes/ingest.ts#L33-L37)).
- **Headers & CORS Security**: Enforce CORS restricted to `env.APP_URL` and mount Helmet headers.
- **Tenant Header Handling**: Extract and validate the tenant identifier header (`x-tenant-id`).

---

## 4. Verification & Self-Correction Loop

- **Package Validation Command**:
  ```bash
  pnpm --filter @prod-own/api dev
  pnpm typecheck
  ```
- **Verification Scenarios**:
  - Prove `POST /ingest` returns `400 Bad Request` on missing `tenantId`/`content`.
  - Prove `POST /ingest` enqueues to BullMQ and returns `202 Accepted` within <20ms.
  - Verify `GET /health` returns `{ status: 'ok' }`.

---

## 5. File Modification & Output Format

- Keep routes split into single-responsibility plugin modules under `src/routes/` ([health.ts](file:///e:/Prod_Own/apps/api/src/routes/health.ts), [ingest.ts](file:///e:/Prod_Own/apps/api/src/routes/ingest.ts), [alerts.ts](file:///e:/Prod_Own/apps/api/src/routes/alerts.ts), [payments.ts](file:///e:/Prod_Own/apps/api/src/routes/payments.ts)).
- Include JSDoc comments explaining flow details and HTTP response codes.
- Use clickable `file:///` links for file references.

---

## 6. Operational Rules Summary

1. Enqueue background work immediately; never block HTTP response threads with heavy jobs.
2. Validate inputs before queueing.
3. Keep Fastify plugins focused and modular under `src/routes/`.
4. Run `pnpm typecheck` after any route or server modification.
