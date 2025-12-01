-- Migration: create reviews table and add stats to canchas
BEGIN;

-- reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  cancha_id INTEGER NOT NULL REFERENCES canchas(id) ON DELETE CASCADE,
  reserva_id INTEGER NULL REFERENCES reservas(id) ON DELETE SET NULL,
  user_id INTEGER NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  user_name TEXT NULL,
  user_email TEXT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- unique index to allow only one review per user per cancha when user_id is present
CREATE UNIQUE INDEX IF NOT EXISTS reviews_cancha_user_uidx ON reviews (cancha_id, user_id) WHERE user_id IS NOT NULL;

-- add stats columns to canchas
ALTER TABLE IF EXISTS canchas
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

COMMIT;