-- ==============================================================================
-- Migration: Super Admin — Suspend/Unsuspend + Audit Log
-- ==============================================================================

-- 1. Add suspend columns to Tenant table
ALTER TABLE "Tenant"
  ADD COLUMN IF NOT EXISTS "suspended"       BOOLEAN   NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "suspendedAt"     TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT;

CREATE INDEX IF NOT EXISTS "Tenant_suspended_idx" ON "Tenant"("suspended");

-- 2. Add AuditLog table (immutable — no UPDATE allowed via RLS)
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id"        TEXT         NOT NULL PRIMARY KEY,
  "actorId"   TEXT         NOT NULL,
  "tenantId"  TEXT,
  "action"    TEXT         NOT NULL,
  "detail"    TEXT         NOT NULL,
  "payload"   JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AuditLog_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AuditLog_actorId_idx"   ON "AuditLog"("actorId");
CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_idx"  ON "AuditLog"("tenantId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx"    ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);

-- 3. RLS: Audit logs are readable platform-wide by Super Admins only.
--    We allow SELECT but block INSERT from the application layer (writes go
--    through a privileged service role, not the tenant-scoped Prisma client).
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Super Admin bypass: any connection that has set app.super_admin = 'true'
-- can read all audit logs regardless of tenant.
DROP POLICY IF EXISTS audit_log_super_admin_policy ON "AuditLog";
CREATE POLICY audit_log_super_admin_policy ON "AuditLog"
  FOR SELECT
  USING (current_setting('app.super_admin', true) = 'true');

-- 4. Ingest-guard: block new error events from suspended tenants.
--    The gateway service checks this before writing, but adding a DB-level
--    CHECK provides defense-in-depth.
--    (Optional — comment out if your ingest service uses a separate PG role.)
-- ALTER TABLE "Event"
--   ADD CONSTRAINT "Event_tenant_not_suspended"
--   CHECK (
--     NOT EXISTS (
--       SELECT 1 FROM "Tenant" t WHERE t.id = "tenantId" AND t.suspended = TRUE
--     )
--   );
