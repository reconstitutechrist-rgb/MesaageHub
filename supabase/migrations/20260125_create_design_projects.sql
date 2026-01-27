-- Create design_projects table for AI Studio project persistence
-- This stores user's design projects with JSONB layers for flexible layer storage

CREATE TABLE IF NOT EXISTS design_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Design',
  platform_preset TEXT NOT NULL DEFAULT 'instagram-post',
  layers JSONB NOT NULL DEFAULT '[]'::jsonb,
  background JSONB NOT NULL DEFAULT '{"type": "solid", "value": null}'::jsonb,
  text_overlay JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's projects list (sorted by most recently updated)
CREATE INDEX IF NOT EXISTS idx_design_projects_user
  ON design_projects(user_id, updated_at DESC);

-- Index for searching by platform preset
CREATE INDEX IF NOT EXISTS idx_design_projects_platform
  ON design_projects(user_id, platform_preset);

-- Enable Row Level Security
ALTER TABLE design_projects ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access their own projects
CREATE POLICY "Users can CRUD own projects" ON design_projects
  FOR ALL USING (auth.uid() = user_id);

-- Optional: Create a function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_design_project_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on update
DROP TRIGGER IF EXISTS design_projects_updated_at ON design_projects;
CREATE TRIGGER design_projects_updated_at
  BEFORE UPDATE ON design_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_design_project_updated_at();
