-- ==============================================================================
-- Error Tracking Platform - PostgreSQL Schema
-- Includes Row-Level Security (RLS) policies for strict tenant isolation
-- ==============================================================================

-- Enable the UUID extension for potential use (though application uses CUIDs for primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Tenant (Organization/Workspace)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Tenant_slug_idx" ON "Tenant"("slug");

-- ------------------------------------------------------------------------------
-- User
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON "User"("tenantId");

-- ------------------------------------------------------------------------------
-- Account
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- ------------------------------------------------------------------------------
-- Session
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ------------------------------------------------------------------------------
-- VerificationToken
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- ------------------------------------------------------------------------------
-- WorkspaceMember (Role-Based Multi-Tenancy: ADMIN | EMPLOYEE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "WorkspaceMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkspaceMember_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceMember_userId_tenantId_key" ON "WorkspaceMember"("userId", "tenantId");
CREATE INDEX IF NOT EXISTS "WorkspaceMember_tenantId_idx" ON "WorkspaceMember"("tenantId");
CREATE INDEX IF NOT EXISTS "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- ------------------------------------------------------------------------------
-- WorkspaceInvite (Pending Email Invitations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "WorkspaceInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkspaceInvite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "WorkspaceInvite_tenantId_idx" ON "WorkspaceInvite"("tenantId");

-- ------------------------------------------------------------------------------
-- Source (Project / App)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Source_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Source_tenantId_externalId_key" ON "Source"("tenantId", "externalId");
CREATE INDEX IF NOT EXISTS "Source_tenantId_idx" ON "Source"("tenantId");

-- ------------------------------------------------------------------------------
-- FingerprintJob (Async grouping jobs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "FingerprintJob" (
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

CREATE INDEX IF NOT EXISTS "FingerprintJob_tenantId_status_idx" ON "FingerprintJob"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "FingerprintJob_sourceId_idx" ON "FingerprintJob"("sourceId");

-- ------------------------------------------------------------------------------
-- AlertEvent
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AlertEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlertEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AlertEvent_tenantId_channel_idx" ON "AlertEvent"("tenantId", "channel");

-- ------------------------------------------------------------------------------
-- AlertConfig
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AlertConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'webhook',
    "webhookUrl" TEXT NOT NULL,
    "events" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AlertConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AlertConfig_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AlertConfig_tenantId_idx" ON "AlertConfig"("tenantId");
CREATE INDEX IF NOT EXISTS "AlertConfig_sourceId_idx" ON "AlertConfig"("sourceId");

-- ------------------------------------------------------------------------------
-- PaymentEvent
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "PaymentEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerEvent" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "PaymentEvent_tenantId_provider_idx" ON "PaymentEvent"("tenantId", "provider");

-- ------------------------------------------------------------------------------
-- Issue (Grouped Error Events)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Issue" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "Issue_sourceId_fingerprint_key" ON "Issue"("sourceId", "fingerprint");
CREATE INDEX IF NOT EXISTS "Issue_tenantId_status_idx" ON "Issue"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "Issue_lastSeen_idx" ON "Issue"("lastSeen");

-- ------------------------------------------------------------------------------
-- Event (Raw Error Occurrences)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Event" (
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

CREATE INDEX IF NOT EXISTS "Event_tenantId_createdAt_idx" ON "Event"("tenantId", "createdAt");
CREATE INDEX IF NOT EXISTS "Event_sourceId_idx" ON "Event"("sourceId");
CREATE INDEX IF NOT EXISTS "Event_issueId_createdAt_idx" ON "Event"("issueId", "createdAt");


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
ALTER TABLE "AlertConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Issue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;

-- Tenant Policy: Users can only see their own tenant record
DROP POLICY IF EXISTS tenant_isolation_policy ON "Tenant";
CREATE POLICY tenant_isolation_policy ON "Tenant"
    FOR ALL
    USING (id = current_setting('app.current_tenant_id', true));

-- Generic Policy: Applied to all tables with a `tenantId` column
DROP POLICY IF EXISTS user_isolation_policy ON "User";
CREATE POLICY user_isolation_policy ON "User"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS source_isolation_policy ON "Source";
CREATE POLICY source_isolation_policy ON "Source"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS fingerprintjob_isolation_policy ON "FingerprintJob";
CREATE POLICY fingerprintjob_isolation_policy ON "FingerprintJob"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS alertexent_isolation_policy ON "AlertEvent";
CREATE POLICY alertexent_isolation_policy ON "AlertEvent"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS alertconfig_isolation_policy ON "AlertConfig";
CREATE POLICY alertconfig_isolation_policy ON "AlertConfig"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS paymentevent_isolation_policy ON "PaymentEvent";
CREATE POLICY paymentevent_isolation_policy ON "PaymentEvent"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS issue_isolation_policy ON "Issue";
CREATE POLICY issue_isolation_policy ON "Issue"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS event_isolation_policy ON "Event";
CREATE POLICY event_isolation_policy ON "Event"
    FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
