# Background Worker (`apps/worker`) — Development & Governance Guidelines

This document provides service-specific execution boundaries, patterns, security, and verification rules for `apps/worker`.

---

## 1. Scope & Execution Boundaries (Preventing Runaway Changes)

- **Primary Responsibility**: Background queue consumer for processing error telemetry payloads, performing PII/secret scrubbing, computing deduplicated fingerprint signatures, and persisting job records.
- **Forbidden Scope Extensions**:
  - Do **NOT** expose HTTP listeners or public network endpoints from the worker process.
  - Do **NOT** hand-roll custom retry loops; rely entirely on BullMQ job retries and backoff strategies.
  - Do **NOT** import or spawn multi-node cluster orchestrators in worker code.

---

## 2. Architecture & Pattern Compliance

- **Queue Processor Pattern**: Standard BullMQ `Worker` consuming jobs from `queueNames.fingerprints` with concurrency set to 4 ([worker.ts:L21-L36](file:///e:/Prod_Own/apps/worker/src/worker.ts#L21-L36)).
- **Graceful Shutdown**: Register `SIGINT` and `SIGTERM` handlers to close BullMQ worker connections and flush OpenTelemetry traces cleanly ([worker.ts:L48-L56](file:///e:/Prod_Own/apps/worker/src/worker.ts#L48-L56)).
- **Error Event Handling**: Attach `worker.on('failed', ...)` listeners for structured failure logging ([worker.ts:L40-L45](file:///e:/Prod_Own/apps/worker/src/worker.ts#L40-L45)). Never leave unhandled job rejections.
- **Observability**: OpenTelemetry tracing enabled via `@prod-own/observability`.

---

## 3. Security & Safety Rules

- **Scrub Before Persistence**: Apply PII and secret scrubbers (stripping API keys, tokens, emails, credit card patterns) to raw error contents **before** writing records to PostgreSQL.
- **Tenant Scope Enforcement**: Guarantee all database mutations write `tenantId` to maintain PostgreSQL Row-Level Security (RLS) guarantees.
- **Sanitized Logging**: Log job IDs and failure metadata without outputting unscrubbed payload text into stdout/stderr.

---

## 4. Verification & Self-Correction Loop

- **Package Validation Command**:
  ```bash
  pnpm --filter @prod-own/worker dev
  pnpm typecheck
  ```
- **Verification Scenarios**:
  - Verify worker gracefully reconnects if Redis experiences intermittent connectivity drops.
  - Prove secret scrubbing correctly strips Bearer tokens and passwords from ingested error content.
  - Verify fingerprint deduplication groups identical stack traces despite line number or microsecond timestamp variations.

---

## 5. File Modification & Output Format

- Keep worker entrypoints modularized in `src/worker.ts` ([worker.ts](file:///e:/Prod_Own/apps/worker/src/worker.ts)).
- Maintain JSDoc descriptions on worker initialization and job handlers.
- Use clickable `file:///` links for code symbol references.

---

## 6. Operational Rules Summary

1. Rely exclusively on BullMQ queueing for concurrency and retries.
2. Scrub sensitive data before persistence.
3. Ensure process termination handlers cleanly shut down Redis connections and OTEL pipelines.
4. Validate worker changes with `pnpm typecheck`.
