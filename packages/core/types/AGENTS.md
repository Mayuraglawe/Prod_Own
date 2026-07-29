# Shared Types Package (`packages/types`) — Development & Governance Guidelines

This document provides package-specific execution boundaries, patterns, security, and verification rules for `packages/types`.

---

## 1. Scope & Execution Boundaries (Preventing Runaway Changes)

- **Primary Responsibility**: Single monorepo repository for shared domain TypeScript interfaces, type aliases, and contract definitions.
- **Forbidden Scope Extensions**:
  - Do **NOT** place executable runtime code, helper functions, or class instantiations inside `@prod-own/types`. (Keep it 100% type-only).
  - Do **NOT** introduce third-party runtime package dependencies into `package.json`.
  - Do **NOT** use `any` or loose untyped records (`Record<string, any>`) without explicit justification.

---

## 2. Architecture & Pattern Compliance

- **Pure Type Exports**: Export explicit domain types (`TenantId`, `FingerprintJobPayload`, `AlertEvent`, `PaymentWebhookEvent`) from `src/index.ts` ([index.ts:L1-L47](file:///e:/Prod_Own/packages/types/src/index.ts#L1-L47)).
- **Contract-First Workflow**: Define domain payload structures in `@prod-own/types` before implementing receivers or queue consumers.
- **Interface Extension**: Prefer extending existing interfaces (`interface` / `type`) over introducing multi-branch union conditionals across consumers.

---

## 3. Security & Safety Rules

- **Strict Property Typing**: Explicitly type sensitive payload fields (e.g., `tenantId`, `sourceId`, `content`) to enforce compile-time verification across all services.

---

## 4. Verification & Self-Correction Loop

- **Package Validation Commands**:
  ```bash
  pnpm typecheck
  ```
- **Verification Scenarios**:
  - Verify changing a field in `FingerprintJobPayload` triggers compile-time type errors in both `apps/api` ingest routes and `apps/worker` job handlers.

---

## 5. File Modification & Output Format

- Keep type declarations formatted with clean JSDoc comments explaining property intent in `src/index.ts` ([index.ts](file:///e:/Prod_Own/packages/types/src/index.ts)).
- Maintain clean export names without default exports.
- Use clickable `file:///` links for code symbol references.

---

## 6. Operational Rules Summary

1. `@prod-own/types` is strictly type-only; zero runtime execution logic.
2. Define domain payload contracts before writing feature logic.
3. Keep TypeScript strict without loose `any` casts.
4. Validate changes with `pnpm typecheck`.
