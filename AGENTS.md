# Agentic Development Guide

Use this file as the primary operating guide for coding work in this repository.

## Purpose

This repository is a self-hosted, INR-priced error tracking and sampled-APM platform for small teams. The codebase should stay easy for an agent to reason about: one language, one type system, one monorepo, and clear boundaries between services and packages.

## Architecture Rules

- TypeScript end-to-end across ingest, worker, dashboard, shared packages, and SDK surfaces.
- Keep the monorepo single-rooted; do not split into separate repos for services.
- Core runtime services for self-hosting are Postgres, Redis, API, and worker.
- Dashboard stays as a separate Next.js app, not part of the Docker runtime stack.
- RLS is the multi-tenancy boundary. Enforce tenant/project isolation in Postgres, not in ad hoc app logic.
- Use BullMQ for queueing and retries; do not hand-roll retry/backoff logic.
- Use plain HTTP integrations for alerting and billing hooks; prefer Slack webhooks, n8n webhooks, and Razorpay APIs over vendor SDK sprawl.

## Coding Conventions

- Keep TypeScript strict.
- Avoid `any` unless there is a clear, inline justification.
- Validate ingest payloads before any persistence, queueing, or side effects.
- Read environment variables in one config module and pass values down.
- Prefer interfaces at module boundaries.
- Keep one exported responsibility per file.
- Do not add silent catch blocks.
- Prefer extending an interface over adding conditional branches in shared implementations.

## Interface-First Workflow

- Define the contract before the implementation when adding a new channel, source, repository, or worker boundary.
- Existing implementations should conform to the interface; do not change the contract unless the task explicitly requires it.
- Keep responsibilities separated: validator, scrubber, fingerprinter, repositories, alert channel, and dispatcher should remain distinct.

## Testing Rules

- Add or update a Vitest suite for any new interface implementation.
- Prove RLS isolation with cross-project read/write tests.
- Add realistic scrubbing tests for secrets, tokens, API keys, and emails.
- Cover hard fingerprinting cases, not just happy paths.
- Verify alert cooldown behavior when repeated bursts occur.
- Run the relevant package tests before considering the task complete.

## Security Rules

- Scrub before persistence, never after.
- Hash API keys at rest; never log or store plaintext keys.
- Enforce ingest rate limiting before payloads reach the queue.
- Keep secrets in environment variables only.

## Scope Guardrails

Do not silently add:

- Session replay
- Mobile SDKs
- Full-fidelity unsampled distributed tracing
- Kafka, ClickHouse, or other new stateful services beyond Postgres and Redis
- A custom auth-as-a-service platform
- Kubernetes or multi-node orchestration for the MVP

If a task requires one of those, stop and flag it as a scope change.

## Workflow

- Read the relevant module and tests before changing it.
- Keep edits minimal and localized.
- Prefer concrete, falsifiable checks before broad refactors.
- Run the narrowest useful validation after each substantive change.
- If a change affects a package, validate that package before moving on.

## Production Readiness

Before onboarding real customers, ensure:

- Redis persistence behavior is defined and tested.
- Postgres backups and restore are documented and verified.
- Health checks are monitored.
- Ingest rate limiting is live.
- Scrubbing tests pass against realistic data.
- Fingerprinting misgroupings have a review process.