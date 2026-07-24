# Prod Own

TypeScript monorepo scaffold for a self-hosted multi-tenant product stack.

## Stack

- Fastify ingest API
- BullMQ + Redis queue
- Postgres + Prisma + RLS-ready tenant modeling
- Node worker for fingerprinting jobs
- Next.js + Tailwind + shadcn/ui dashboard
- OpenTelemetry SDK wiring
- Slack webhook and n8n alert hooks
- Razorpay payment integration surface

## Layout

- `apps/api` - ingest API and public HTTP surface
- `apps/worker` - queue processor and background jobs
- `apps/dashboard` - dashboard UI
- `packages/db` - Prisma schema and client
- `packages/queue` - BullMQ queue names and helpers
- `packages/observability` - OpenTelemetry bootstrap
- `packages/config` - shared env parsing
- `packages/types` - shared domain types

## Getting started

1. Copy `.env.example` to `.env` and fill in secrets.
2. Install dependencies with `pnpm install`.
3. Generate Prisma client with `pnpm db:generate`.
4. Run local services with `docker compose up --build`.
5. Start apps with `pnpm dev`.

## Notes

- The Docker Compose file intentionally keeps only four runtime services: Postgres, Redis, API, and worker.
- The dashboard runs separately through `pnpm dev:web`.
- RLS policies are modeled in the Prisma schema and should be enforced in Postgres migrations before production data is used.
