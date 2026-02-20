-- Supabase Database Schema for Excel Data Transformation Tool
-- Run this SQL in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Saved Pipelines Table
CREATE TABLE IF NOT EXISTS saved_pipelines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  operations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transformation History Table
CREATE TABLE IF NOT EXISTS transformation_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  original_file_url TEXT,
  transformed_file_url TEXT,
  pipeline_id UUID REFERENCES saved_pipelines(id) ON DELETE SET NULL,
  operations JSONB NOT NULL,
  row_count_before INTEGER,
  row_count_after INTEGER,
  status TEXT CHECK (status IN ('success', 'failed')) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_pipelines_user_id ON saved_pipelines(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_pipelines_created_at ON saved_pipelines(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transformation_history_user_id ON transformation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_transformation_history_created_at ON transformation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transformation_history_pipeline_id ON transformation_history(pipeline_id);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view own pipelines" ON saved_pipelines;
DROP POLICY IF EXISTS "Users can insert own pipelines" ON saved_pipelines;
DROP POLICY IF EXISTS "Users can update own pipelines" ON saved_pipelines;
DROP POLICY IF EXISTS "Users can delete own pipelines" ON saved_pipelines;

DROP POLICY IF EXISTS "Users can view own history" ON transformation_history;
DROP POLICY IF EXISTS "Users can insert own history" ON transformation_history;

-- RLS Policies for saved_pipelines
CREATE POLICY "Users can view own pipelines"
  ON saved_pipelines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pipelines"
  ON saved_pipelines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pipelines"
  ON saved_pipelines FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pipelines"
  ON saved_pipelines FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for transformation_history
CREATE POLICY "Users can view own history"
  ON transformation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON transformation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on saved_pipelines
DROP TRIGGER IF EXISTS update_saved_pipelines_updated_at ON saved_pipelines;
CREATE TRIGGER update_saved_pipelines_updated_at
  BEFORE UPDATE ON saved_pipelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for transformed files (run in Supabase Storage section, not SQL Editor)
-- Go to Storage > Create Bucket
-- Name: transformed-files
-- Public: false (private bucket)
-- File size limit: 50MB
-- Allowed MIME types: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
