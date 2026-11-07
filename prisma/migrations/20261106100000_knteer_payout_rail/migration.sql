-- Migration: 20261106100000_knteer_payout_rail
-- Adds Bank Transfer (Knteer) rail support to the shared PayoutRequest lifecycle.
--
-- Changes:
--   1. Add KNTEER_PAYOUT to ServiceCode enum
--   2. Add rail, knteerBeneficiaryId, gstRate to PayoutRequest
--   3. Create knteer_beneficiaries table (beneficiary book for Bank Transfer)
--   4. Add rail-scoped cooldown index on PayoutRequest

-- 1. Extend ServiceCode enum
ALTER TYPE "ServiceCode" ADD VALUE IF NOT EXISTS 'KNTEER_PAYOUT';

-- 2a. Add rail column to PayoutRequest (defaults SETTLEMENT so all existing rows are unaffected)
ALTER TABLE "PayoutRequest" ADD COLUMN IF NOT EXISTS "rail" TEXT NOT NULL DEFAULT 'SETTLEMENT';

-- 2b. Add knteerBeneficiaryId (FK added after knteer_beneficiaries table is created)
ALTER TABLE "PayoutRequest" ADD COLUMN IF NOT EXISTS "knteerBeneficiaryId" TEXT;

-- 2c. Add gstRate (whole-number GST % stamped at quote time for GSTR filing)
ALTER TABLE "PayoutRequest" ADD COLUMN IF NOT EXISTS "gstRate" INTEGER NOT NULL DEFAULT 0;

-- 3. Create KnteerBeneficiary table
CREATE TABLE IF NOT EXISTS "knteer_beneficiaries" (
    "id"                 TEXT NOT NULL,
    "userId"             TEXT NOT NULL,
    "accountNumber"      TEXT NOT NULL,
    "accountLast4"       TEXT NOT NULL,
    "ifscCode"           TEXT NOT NULL,
    "accountHolderName"  TEXT NOT NULL,
    "bankName"           TEXT NOT NULL,
    "mobile"             TEXT NOT NULL,
    "referenceId"        TEXT,
    "registrationType"   TEXT NOT NULL DEFAULT 'register',
    "verificationCharge" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "isRegistered"       BOOLEAN NOT NULL DEFAULT true,
    "isBankVerified"     BOOLEAN NOT NULL DEFAULT false,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knteer_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- FK: knteer_beneficiaries.userId → User.id
ALTER TABLE "knteer_beneficiaries"
    ADD CONSTRAINT "knteer_beneficiaries_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique: one entry per (owner, last-4, IFSC) — re-registering updates in place
CREATE UNIQUE INDEX IF NOT EXISTS "knteer_beneficiaries_userId_accountLast4_ifscCode_key"
    ON "knteer_beneficiaries"("userId", "accountLast4", "ifscCode");

-- Index: list all beneficiaries for a user fast
CREATE INDEX IF NOT EXISTS "knteer_beneficiaries_userId_idx"
    ON "knteer_beneficiaries"("userId");

-- Index: IFSC lookups
CREATE INDEX IF NOT EXISTS "knteer_beneficiaries_ifscCode_idx"
    ON "knteer_beneficiaries"("ifscCode");

-- FK: PayoutRequest.knteerBeneficiaryId → knteer_beneficiaries.id (SET NULL on delete)
ALTER TABLE "PayoutRequest"
    ADD CONSTRAINT "PayoutRequest_knteerBeneficiaryId_fkey"
    FOREIGN KEY ("knteerBeneficiaryId") REFERENCES "knteer_beneficiaries"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Rail-scoped cooldown + reporting index
CREATE INDEX IF NOT EXISTS "PayoutRequest_userId_rail_accountLast4_status_createdAt_idx"
    ON "PayoutRequest"("userId", "rail", "accountLast4", "status", "createdAt");
