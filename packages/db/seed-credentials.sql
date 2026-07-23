-- ==============================================================================
-- Seed Script: Test Credentials
-- This script creates a test Tenant and a test User with a valid bcrypt password
-- 
-- Email: admin@example.com
-- Password: password@123
-- ==============================================================================

-- 0. Ensure all required columns exist in the database (in case your DB is out of sync)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT;

-- 1. Create a test Tenant
INSERT INTO "Tenant" ("id", "slug", "name", "updatedAt")
VALUES (
    'test-tenant-id-123',
    'test-workspace',
    'Test Workspace',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

-- 2. Create the test User (Linked to the Tenant)
-- The password hash here corresponds to the plaintext: password@123
INSERT INTO "User" ("id", "tenantId", "email", "password", "role", "updatedAt")
VALUES (
    'test-user-id-123',
    'test-tenant-id-123',
    'admin@example.com',
    '$2b$10$Q97bEG0wnfx5ywM3lczYxOkF/ZAPKG0deZ3DrEvVtxiYu99SJ6orG',
    'admin',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE 
SET "password" = '$2b$10$Q97bEG0wnfx5ywM3lczYxOkF/ZAPKG0deZ3DrEvVtxiYu99SJ6orG',
    "tenantId" = 'test-tenant-id-123';

-- Note: The ON CONFLICT clause ensures this script can be run multiple times safely.
