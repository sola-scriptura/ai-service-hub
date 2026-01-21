-- =====================================================
-- SCHEMA PATCH: Change experts.id from UUID to TEXT
-- =====================================================
-- This patch modifies the experts table to use TEXT ids
-- instead of UUID to match the frontend mock data format
-- (e.g., 'expert-legal-1', 'expert-content-1', etc.)
-- 
-- Run this BEFORE seed-experts.sql if your schema is 
-- already deployed, OR apply this change to schema.sql
-- before initial deployment.
-- =====================================================

-- Drop dependent foreign keys first
ALTER TABLE expert_specializations DROP CONSTRAINT IF EXISTS expert_specializations_expert_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_expert_id_fkey;

-- Drop the experts table and recreate with TEXT id
DROP TABLE IF EXISTS experts CASCADE;

CREATE TABLE experts (
  id TEXT PRIMARY KEY,  -- Changed from UUID to TEXT
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT,
  rating DECIMAL(2,1) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  completed_projects INTEGER NOT NULL DEFAULT 0,
  response_time TEXT NOT NULL,
  expertise TEXT[] NOT NULL,
  availability expert_availability NOT NULL DEFAULT 'available',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recreate RLS policies
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experts are viewable by everyone"
  ON experts FOR SELECT
  USING (active = TRUE);

-- Recreate expert_specializations table with TEXT expert_id
DROP TABLE IF EXISTS expert_specializations CASCADE;

CREATE TABLE expert_specializations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id TEXT NOT NULL REFERENCES experts(id) ON DELETE CASCADE,  -- Changed to TEXT
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(expert_id, service_id)
);

-- Recreate RLS policies for expert_specializations
ALTER TABLE expert_specializations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expert specializations are viewable by everyone"
  ON expert_specializations FOR SELECT
  USING (TRUE);

-- Update projects table to use TEXT for expert_id
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_expert_id_fkey;
ALTER TABLE projects ALTER COLUMN expert_id TYPE TEXT;
ALTER TABLE projects ADD CONSTRAINT projects_expert_id_fkey 
  FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE SET NULL;

-- Recreate indexes
CREATE INDEX idx_experts_availability ON experts(availability);
CREATE INDEX idx_expert_specializations_service ON expert_specializations(service_id);
CREATE INDEX idx_expert_specializations_expert ON expert_specializations(expert_id);

-- Recreate trigger for updated_at
CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON experts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check the new schema
-- \d experts
-- \d expert_specializations
-- \d projects
