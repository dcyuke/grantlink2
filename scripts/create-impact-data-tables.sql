-- ============================================
-- Run this SQL in Supabase SQL Editor to create
-- tables for the Impact Data Import feature.
-- ============================================

-- 1. Datasets (one per upload)
CREATE TABLE IF NOT EXISTS impact_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('csv', 'xlsx', 'paste')),
  original_filename TEXT,
  row_count INTEGER NOT NULL DEFAULT 0,
  column_count INTEGER NOT NULL DEFAULT 0,
  detected_issue_area TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_datasets_user ON impact_datasets(user_id);

-- 2. Column mappings (one per column per dataset)
CREATE TABLE IF NOT EXISTS impact_column_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES impact_datasets(id) ON DELETE CASCADE,
  column_index INTEGER NOT NULL,
  original_header TEXT NOT NULL,
  detected_type TEXT NOT NULL CHECK (detected_type IN ('metric', 'date', 'category', 'currency', 'percentage', 'text', 'id', 'unknown')),
  mapped_metric_id TEXT,
  display_name TEXT NOT NULL,
  unit TEXT,
  confidence REAL DEFAULT 0,
  is_included BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_column_mappings_dataset ON impact_column_mappings(dataset_id);

-- 3. Data rows (actual imported values)
CREATE TABLE IF NOT EXISTS impact_data_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES impact_datasets(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  values JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_data_rows_dataset ON impact_data_rows(dataset_id);

-- ============================================
-- Row Level Security Policies
-- ============================================

ALTER TABLE impact_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_column_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_data_rows ENABLE ROW LEVEL SECURITY;

-- Datasets: users can only manage their own
CREATE POLICY "Users can view own datasets" ON impact_datasets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own datasets" ON impact_datasets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own datasets" ON impact_datasets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets" ON impact_datasets
  FOR DELETE USING (auth.uid() = user_id);

-- Column mappings: access via dataset ownership
CREATE POLICY "Users can view own column mappings" ON impact_column_mappings
  FOR SELECT USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own column mappings" ON impact_column_mappings
  FOR INSERT WITH CHECK (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own column mappings" ON impact_column_mappings
  FOR UPDATE USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own column mappings" ON impact_column_mappings
  FOR DELETE USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));

-- Data rows: access via dataset ownership
CREATE POLICY "Users can view own data rows" ON impact_data_rows
  FOR SELECT USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own data rows" ON impact_data_rows
  FOR INSERT WITH CHECK (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own data rows" ON impact_data_rows
  FOR UPDATE USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own data rows" ON impact_data_rows
  FOR DELETE USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));
