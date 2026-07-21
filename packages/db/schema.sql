-- ==============================================================================
-- Error Tracking Platform - PostgreSQL Schema
-- Includes Row-Level Security (RLS) policies for strict tenant isolation
-- ==============================================================================

-- Enable the UUID extension for potential use (though application uses CUIDs for primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Tenant (Organization/Workspace)
-- ------------------------------------------------------------------------------
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- ------------------------------------------------------------------------------
-- User
-- ------------------------------------------------------------------------------
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- ------------------------------------------------------------------------------
-- Source (Project / App)
-- ------------------------------------------------------------------------------
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Source_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Source_tenantId_externalId_key" ON "Source"("tenantId", "externalId");
CREATE INDEX "Source_tenantId_idx" ON "Source"("tenantId");

-- ------------------------------------------------------------------------------
-- FingerprintJob (Async grouping jobs)
-- ------------------------------------------------------------------------------
CREATE TABLE "FingerprintJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "fingerprint" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FingerprintJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FingerprintJob_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "FingerprintJob_tenantId_status_idx" ON "FingerprintJob"("tenantId", "status");
CREATE INDEX "FingerprintJob_sourceId_idx" ON "FingerprintJob"("sourceId");

-- ------------------------------------------------------------------------------
-- AlertEvent
-- ------------------------------------------------------------------------------
CREATE TABLE "AlertEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlertEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "AlertEvent_tenantId_channel_idx" ON "AlertEvent"("tenantId", "channel");

-- ------------------------------------------------------------------------------
-- PaymentEvent
-- ------------------------------------------------------------------------------
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerEvent" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PaymentEvent_tenantId_provider_idx" ON "PaymentEvent"("tenantId", "provider");

-- ------------------------------------------------------------------------------
-- Issue (Grouped Error Events)
-- ------------------------------------------------------------------------------
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Issue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Issue_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Issue_sourceId_fingerprint_key" ON "Issue"("sourceId", "fingerprint");
CREATE INDEX "Issue_tenantId_status_idx" ON "Issue"("tenantId", "status");
CREATE INDEX "Issue_lastSeen_idx" ON "Issue"("lastSeen");

-- ------------------------------------------------------------------------------
-- Event (Raw Error Occurrences)
-- ------------------------------------------------------------------------------
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "issueId" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "environment" TEXT,
    "release" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Event_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Event_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Event_tenantId_createdAt_idx" ON "Event"("tenantId", "createdAt");
CREATE INDEX "Event_sourceId_idx" ON "Event"("sourceId");
CREATE INDEX "Event_issueId_createdAt_idx" ON "Event"("issueId", "createdAt");


-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- The application must set the `app.current_tenant_id` session variable
-- when connecting to the database in order for these policies to permit access.
-- e.g., SET LOCAL app.current_tenant_id = 'cuid-of-tenant';

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Source" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FingerprintJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AlertEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Issue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;

-- Tenant Policy: Users can only see their own tenant record
CREATE POLICY tenant_isolation_policy ON "Tenant"
    FOR ALL
    USING (id = current_setting('app.current_tenant_id', true));

-- Generic Policy: Applied to all tables with a `tenantId` column
CREATE POLICY user_isolation_policy ON "User"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY source_isolation_policy ON "Source"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY fingerprintjob_isolation_policy ON "FingerprintJob"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY alertexent_isolation_policy ON "AlertEvent"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY paymentevent_isolation_policy ON "PaymentEvent"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY issue_isolation_policy ON "Issue"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY event_isolation_policy ON "Event"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
