# Database Package (`packages/db`) — Development & Governance Guidelines

This document provides package-specific execution boundaries, patterns, security, and verification rules for `packages/db`.

---

## 1. Scope & Execution Boundaries (Preventing Runaway Changes)

- **Primary Responsibility**: Prisma ORM schema definition, client instantiation, and database multi-tenancy model.
- **Forbidden Scope Extensions**:
  - Do **NOT** add new stateful data stores (ClickHouse, Kafka, Cassandra, Mongo) beyond PostgreSQL 16.
  - Do **NOT** bypass PostgreSQL Row-Level Security (RLS) by relying solely on application-level filtering without database policy enforcement.
  - Do **NOT** instantiate multiple `PrismaClient` objects in runtime code; use the shared singleton ([client.ts](file:///e:/Prod_Own/packages/db/src/client.ts)).

---

## 2. Architecture & Pattern Compliance

- **Prisma Schema Structure**: Define multi-tenant models (`Tenant`, `User`, `Source`, `FingerprintJob`, `AlertEvent`, `PaymentEvent`) linked via foreign key cascades ([schema.prisma](file:///e:/Prod_Own/packages/db/prisma/schema.prisma#L13-L101)).
- **Prisma Client Singleton**: Maintain the `globalThis` cached Prisma client instance in `src/client.ts` ([client.ts:L7-L20](file:///e:/Prod_Own/packages/db/src/client.ts#L7-L20)) to prevent connection pool exhaustion during development hot-reloads.
- **PostgreSQL RLS Strategy**: Model tenant foreign keys (`tenantId`) across all entity models to support RLS policies in SQL migrations.

---

## 3. Security & Safety Rules

- **Multi-Tenancy Isolation**: Enforce RLS policy targets on `tenantId` to ensure Tenant A cannot read or write Tenant B records under any query condition.
- **API Key Hashing**: Never store raw unhashed API keys or secrets in Prisma model fields.
- **Sensitive Data Scrubbing**: Ensure error payload strings are scrubbed of PII before database write operations.

---

## 4. Verification & Self-Correction Loop

- **Package Validation Commands**:
  ```bash
  pnpm db:generate
  pnpm db:migrate
  pnpm typecheck
  ```
- **Verification Scenarios**:
  - Run cross-tenant query tests to verify RLS blocks unauthorized cross-project reads/writes.
  - Verify `pnpm db:generate` runs cleanly without Prisma schema validation errors.

---

## 5. File Modification & Output Format

- Keep models explicitly documented in `prisma/schema.prisma` ([schema.prisma](file:///e:/Prod_Own/packages/db/prisma/schema.prisma)).
- Document model relations and foreign key cascade rules using JSDoc-style triple-slash comments (`///`).
- Use clickable `file:///` links for schema and code symbol references.

---

## 6. Operational Rules Summary

1. Enforce tenant multi-tenancy isolation via `tenantId` RLS in PostgreSQL.
2. Use the shared PrismaClient singleton in `src/client.ts`.
3. Run `pnpm db:generate` whenever `schema.prisma` changes.
4. Validate changes with `pnpm typecheck`.
