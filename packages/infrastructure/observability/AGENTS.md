# Observability Package (`packages/observability`) — Development & Governance Guidelines

This document provides package-specific execution boundaries, patterns, security, and verification rules for `packages/observability`.

---

## 1. Scope & Execution Boundaries (Preventing Runaway Changes)

- **Primary Responsibility**: OpenTelemetry Node SDK initialization, trace collector configuration, and graceful telemetry shutdown helpers.
- **Forbidden Scope Extensions**:
  - Do **NOT** introduce heavy unsampled distributed tracing agents or full-fidelity session recording.
  - Do **NOT** hardcode OTLP collector endpoints; read target collectors from `env.OTEL_EXPORTER_OTLP_ENDPOINT`.
  - Do **NOT** block application startup if an OTLP trace exporter endpoint is offline.

---

## 2. Architecture & Pattern Compliance

- **SDK Bootstrap Pattern**: Export `createObservabilitySdk()` helper in `src/otel.ts` ([otel.ts:L15-L33](file:///e:/Prod_Own/packages/observability/src/otel.ts#L15-L33)).
- **Lifecycle Integration**: Provide `start()` and `shutdown()` asynchronous lifecycle interfaces used by Fastify (`apps/api`) and BullMQ Worker (`apps/worker`).
- **Config Driven**: Read `OTEL_SERVICE_NAME` and `OTEL_EXPORTER_OTLP_ENDPOINT` via `@prod-own/config`.

---

## 3. Security & Safety Rules

- **Header & Token Scrubbing**: Ensure telemetry span attributes do not log sensitive Authorization headers, raw passwords, or credit card numbers.
- **Fault-Tolerant Exporter**: Configure OTLP trace exporters to degrade gracefully without crashing the host Node process during network partitions.

---

## 4. Verification & Self-Correction Loop

- **Package Validation Commands**:
  ```bash
  pnpm typecheck
  ```
- **Verification Scenarios**:
  - Verify `createObservabilitySdk().start()` initializes cleanly when `OTEL_EXPORTER_OTLP_ENDPOINT` is blank.
  - Verify `sdk.shutdown()` flushes open trace pipelines within <500ms during SIGTERM signals.

---

## 5. File Modification & Output Format

- Keep OpenTelemetry initialization encapsulated in `src/otel.ts` ([otel.ts](file:///e:/Prod_Own/packages/observability/src/otel.ts)).
- Include JSDoc comments explaining trace provider configurations.
- Use clickable `file:///` links for code symbol references.

---

## 6. Operational Rules Summary

1. OpenTelemetry is the single observability tracing framework.
2. Ensure tracing pipelines degrade gracefully if trace collectors are unreachable.
3. Handle graceful shutdown on process termination.
4. Validate changes with `pnpm typecheck`.
