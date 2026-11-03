-- Additive migration: introduce WHITELABEL_PARTNER role.
-- Safe to apply while the app is running (no locks on data rows).

-- Add the new enum value (Postgres supports appending safely).
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'WHITELABEL_PARTNER';
