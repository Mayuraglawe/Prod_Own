# Queue Package (`packages/queue`) — Development & Governance Guidelines

This document provides package-specific execution boundaries, patterns, security, and verification rules for `packages/queue`.

---

## 1. Scope & Execution Boundaries (Preventing Runaway Changes)

- **Primary Responsibility**: Centralized BullMQ queue definitions, Redis connection instantiation, and queue factory helpers.
- **Forbidden Scope Extensions**:
  - Do **NOT** introduce custom hand-rolled in-memory queue implementations or raw Redis pub/sub workarounds.
  - Do **NOT** introduce Kafka, RabbitMQ, SQS, or NATS; BullMQ + Redis is the single queueing technology.
  - Do **NOT** hardcode Redis connection parameters inside individual app routes; use `redisConnection` helpers.

---

## 2. Architecture & Pattern Compliance

- **Centralized Queue Names**: Define all queue name constants in `src/names.ts` ([names.ts](file:///e:/Prod_Own/packages/queue/src/names.ts)).
- **Redis Connection Management**: Use `redisConnection` exported from `src/connection.ts` ([connection.ts](file:///e:/Prod_Own/packages/queue/src/connection.ts)), configuring host, port, and max retries from `env.REDIS_URL`.
- **Factory Helper Pattern**: Expose dedicated queue instantiations (`createFingerprintQueue()`, `createAlertQueue()`, `createBillingQueue()`) in `src/factories.ts` ([factories.ts](file:///e:/Prod_Own/packages/queue/src/factories.ts)).

---

## 3. Security & Safety Rules

- **Connection URL Validation**: Load Redis credentials strictly via `@prod-own/config` Zod schema parsing.
- **Payload Size Control**: Avoid enqueuing massive binary payloads into Redis queues; pass structured JSON job metadata.
- **Queue Rate Limits**: Maintain job rate limits and backoff strategies on BullMQ queue definitions to prevent memory exhaustion.

---

## 4. Verification & Self-Correction Loop

- **Package Validation Commands**:
  ```bash
  pnpm typecheck
  ```
- **Verification Scenarios**:
  - Verify `redisConnection` connects successfully to `redis://localhost:6379`.
  - Prove queue factories create queues tied to correct queue name strings (`fingerprints`, `alerts`, `billing`).

---

## 5. File Modification & Output Format

- Keep exported responsibilities split cleanly: `names.ts` for constants, `connection.ts` for ioredis, `factories.ts` for queue instances.
- Maintain TypeScript export definitions in `src/index.ts`.
- Use clickable `file:///` links for code symbol references.

---

## 6. Operational Rules Summary

1. BullMQ + Redis is the single queueing standard for the platform.
2. Define all queue names in `src/names.ts`.
3. Read Redis connection details through `@prod-own/config`.
4. Validate changes with `pnpm typecheck`.
