# Config Package (`packages/config`) — Development & Governance Guidelines

This document provides package-specific execution boundaries, patterns, security, and verification rules for `packages/config`.

---

## 1. Scope & Execution Boundaries (Preventing Runaway Changes)

- **Primary Responsibility**: Single source of truth for loading, validating, casting, and exporting environment variables across all services in the monorepo.
- **Forbidden Scope Extensions**:
  - Do **NOT** bypass `@prod-own/config` by reading `process.env` directly in application routes, workers, or package files.
  - Do **NOT** allow unvalidated optional environment strings without explicit fallbacks or Zod schema constraints.
  - Do **NOT** store plaintext production secrets or hardcoded passwords in default values inside schema definitions.

---

## 2. Architecture & Pattern Compliance

- **Single Source of Truth**: Expose `env` parsed object via `src/env.ts` ([env.ts:L25-L52](file:///e:/Prod_Own/packages/config/src/env.ts#L25-L52)).
- **Zod Schema Parsing**: Validate environment variables strictly using `z.object(...)`. Throw a explicit startup error (`ZodError`) if required keys are invalid or missing.
- **Automatic Root `.env` Resolution**: Traverses parent execution working directories to locate the root `.env` file automatically using `process.loadEnvFile` ([env.ts:L7-L19](file:///e:/Prod_Own/packages/config/src/env.ts#L7-L19)).

---

## 3. Security & Safety Rules

- **URL & Format Validation**: Validate connection URIs (`DATABASE_URL`, `REDIS_URL`, `APP_URL`) for correct scheme protocols (`postgresql://`, `redis://`, `http://`/`https://`).
- **Secret Isolation**: Ensure sensitive API credentials (`RAZORPAY_KEY_SECRET`, webhook secrets) default to empty strings or optional parameters without leaking placeholder keys.

---

## 4. Verification & Self-Correction Loop

- **Package Validation Commands**:
  ```bash
  pnpm typecheck
  ```
- **Verification Scenarios**:
  - Verify `envSchema.parse(process.env)` throws a descriptive validation error if `DATABASE_URL` is omitted or invalid.
  - Verify optional variables (`SLACK_WEBHOOK_URL`, `RAZORPAY_KEY_ID`) resolve cleanly to default empty strings (`''`).

---

## 5. File Modification & Output Format

- Keep Zod schema definitions clean, commented, and type-safe in `src/env.ts` ([env.ts](file:///e:/Prod_Own/packages/config/src/env.ts)).
- Include JSDoc descriptions above every key in `envSchema`.
- Use clickable `file:///` links for code symbol references.

---

## 6. Operational Rules Summary

1. All environment variables must pass through `@prod-own/config`.
2. Use Zod validation schemas for all process variables.
3. Keep default values secure and explicit.
4. Validate changes with `pnpm typecheck`.
