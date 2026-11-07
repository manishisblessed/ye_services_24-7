-- ============================================================
-- Per-tenant identity uniqueness (white-label isolation)
--
-- email/phone are no longer globally unique. Each white-label tenant is an
-- isolated namespace: the SAME email/phone may exist once per tenant and once
-- for native users. A nullable composite UNIQUE would be unsafe here because
-- Postgres treats NULL as distinct (so native duplicates would slip through),
-- so we enforce the rule with PARTIAL UNIQUE indexes over
-- COALESCE("platformOwnerId", '') and ignore soft-deleted rows so a closed
-- account never blocks re-onboarding.
-- ============================================================

-- 1. Drop the old global UNIQUE indexes on email / phone.
DROP INDEX IF EXISTS "User_email_key";
DROP INDEX IF EXISTS "User_phone_key";

-- 2. Plain lookup indexes (match the @@index declarations in schema.prisma).
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User"("phone");

-- 3. Per-tenant partial UNIQUE indexes.
--    COALESCE maps native users (platformOwnerId NULL) into a single ''
--    namespace so global uniqueness among native users is preserved, while
--    every tenant gets its own namespace keyed by its owner id.
--    lower(email) makes the email rule case-insensitive.
CREATE UNIQUE INDEX IF NOT EXISTS "User_tenant_email_key"
  ON "User" (COALESCE("platformOwnerId", ''), lower("email"))
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_tenant_phone_key"
  ON "User" (COALESCE("platformOwnerId", ''), "phone")
  WHERE "deletedAt" IS NULL;
