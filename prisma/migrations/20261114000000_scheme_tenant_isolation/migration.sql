-- White-label tenant isolation for the Scheme Manager.
--
-- Each scheme now belongs to a tenant namespace via platformOwnerId
-- (NULL = native BankingPoint24 platform scheme). Scheme name uniqueness
-- becomes PER TENANT: a COALESCE("platformOwnerId",'') unique index treats
-- NULL owners as the native namespace so native names stay globally unique
-- while each tenant gets its own name space.
--
-- Additive + safe on a running app: new column is nullable; existing schemes
-- become native (platformOwnerId NULL), preserving current behaviour exactly.

ALTER TABLE "Scheme" ADD COLUMN IF NOT EXISTS "platformOwnerId" TEXT;

-- Replace the global unique(name) with a per-namespace unique index.
-- COALESCE(NULL,'') keeps every existing (native) scheme name unique.
DROP INDEX IF EXISTS "Scheme_name_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Scheme_owner_name_uq"
  ON "Scheme" (COALESCE("platformOwnerId", ''), "name");

CREATE INDEX IF NOT EXISTS "Scheme_platformOwnerId_idx"
  ON "Scheme" ("platformOwnerId");
