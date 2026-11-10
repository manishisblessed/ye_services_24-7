-- Additive migration: Cloudflare-for-SaaS custom-hostname automation for
-- white-label partner domains. Safe to apply while the app is running —
-- all columns are nullable / defaulted, no locks on existing data rows.

ALTER TABLE "WhitelabelProfile"
  ADD COLUMN IF NOT EXISTS "cfCustomHostnameId" TEXT,
  ADD COLUMN IF NOT EXISTS "sslStatus"          TEXT,
  ADD COLUMN IF NOT EXISTS "domainVerified"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "domainCheckedAt"    TIMESTAMP(3);
