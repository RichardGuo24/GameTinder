-- Migration: Add RAWG integration fields to games table
-- This enables:
-- 1. Idempotent upserts (rawg_id as unique key)
-- 2. Richer game data (genres, description, ratings)
-- 3. Tracking data source (seed vs RAWG)

-- Add RAWG-specific columns
ALTER TABLE games ADD COLUMN IF NOT EXISTS rawg_id INTEGER UNIQUE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS rawg_slug TEXT;

-- Add richer game data columns
ALTER TABLE games ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS genres TEXT[];
ALTER TABLE games ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2);
ALTER TABLE games ADD COLUMN IF NOT EXISTS metacritic INTEGER;
ALTER TABLE games ADD COLUMN IF NOT EXISTS released DATE;

-- Add index for faster lookups by rawg_id
CREATE INDEX IF NOT EXISTS idx_games_rawg_id ON games(rawg_id);

-- Note: Existing seed data will have NULL for rawg_id
-- This is intentional - we can identify seed data by: WHERE rawg_id IS NULL
-- Seed data remains functional, just lacks RAWG metadata
