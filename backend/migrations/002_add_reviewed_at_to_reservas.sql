-- Migration: add reviewed_at to reservas
BEGIN;

ALTER TABLE IF EXISTS reservas
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE NULL;

COMMIT;