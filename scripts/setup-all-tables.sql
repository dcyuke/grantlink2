-- ============================================
-- COMBINED SETUP: All GrantLink Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- Focus Areas table
-- =====================
create table if not exists focus_areas (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  parent_id uuid references focus_areas(id),
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- Funders table
-- =====================
create table if not exists funders (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  funder_type text not null check (funder_type in (
    'private_foundation', 'community_foundation', 'corporate',
    'government_federal', 'government_state', 'government_local',
    'individual_donor', 'impact_investor', 'international_org', 'other'
  )),
  description text,
  website_url text,
  logo_url text,
  headquarters text,
  country_code text,
  total_giving bigint,
  assets bigint,
  ein text,
  contact_email text,
  is_verified boolean default true,
  scrape_url text,
  scrape_config jsonb,
  last_scraped_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- Opportunities table
-- =====================
create table if not exists opportunities (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  funder_id uuid not null references funders(id) on delete cascade,
  opportunity_type text not null check (opportunity_type in (
    'grant', 'fellowship', 'prize', 'competition', 'corporate_giving',
    'impact_investment', 'scholarship', 'award', 'residency', 'accelerator', 'other'
  )),
  status text not null default 'open' check (status in (
    'open', 'closing_soon', 'closed', 'upcoming', 'unknown'
  )),
  summary text,
  description text,
  amount_min bigint,
  amount_max bigint,
  amount_exact bigint,
  amount_display text,
  deadline_type text not null default 'unknown' check (deadline_type in (
    'fixed', 'rolling', 'loi_then_full', 'by_invitation', 'continuous', 'unknown'
  )),
  deadline_date date,
  deadline_display text,
  eligible_org_types text[] default '{}',
  eligible_geography text[] default '{}',
  eligible_populations text[] default '{}',
  eligibility_summary text,
  geo_scope_display text,
  application_url text,
  application_complexity text default 'unknown' check (application_complexity in (
    'simple', 'moderate', 'complex', 'unknown'
  )),
  application_notes text,
  total_pool bigint,
  num_awards integer,
  open_date date,
  cycle_frequency text,
  eligible_org_budget_min bigint,
  eligible_org_budget_max bigint,
  eligible_org_age_min integer,
  requires_loi boolean default false,
  requires_fiscal_sponsor boolean default false,
  source_url text,
  source_hash text,
  is_featured boolean default false,
  is_verified boolean default true,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- Junction table: opportunities <-> focus_areas
-- =====================
create table if not exists opportunity_focus_areas (
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  focus_area_id uuid not null references focus_areas(id) on delete cascade,
  primary key (opportunity_id, focus_area_id)
);

-- =====================
-- Indexes
-- =====================
create index if not exists idx_opportunities_status on opportunities(status);
create index if not exists idx_opportunities_type on opportunities(opportunity_type);
create index if not exists idx_opportunities_funder on opportunities(funder_id);
create index if not exists idx_opportunities_featured on opportunities(is_featured) where is_featured = true;
create index if not exists idx_opportunities_deadline on opportunities(deadline_date);
create index if not exists idx_opportunities_slug on opportunities(slug);
create index if not exists idx_funders_slug on funders(slug);
create index if not exists idx_focus_areas_slug on focus_areas(slug);
create index if not exists idx_ofa_opportunity on opportunity_focus_areas(opportunity_id);
create index if not exists idx_ofa_focus_area on opportunity_focus_areas(focus_area_id);

-- =====================
-- Full text search
-- =====================
alter table opportunities add column if not exists fts tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(geo_scope_display, '')), 'C')
  ) stored;
create index if not exists idx_opportunities_fts on opportunities using gin(fts);

-- =====================
-- Updated_at triggers
-- =====================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_funders_updated_at
  before update on funders for each row execute function update_updated_at_column();
create trigger update_opportunities_updated_at
  before update on opportunities for each row execute function update_updated_at_column();
create trigger update_focus_areas_updated_at
  before update on focus_areas for each row execute function update_updated_at_column();

-- =====================
-- RLS for public tables
-- =====================
alter table focus_areas enable row level security;
alter table funders enable row level security;
alter table opportunities enable row level security;
alter table opportunity_focus_areas enable row level security;

create policy "Public read access" on focus_areas for select using (true);
create policy "Public read access" on funders for select using (true);
create policy "Public read access" on opportunities for select using (true);
create policy "Public read access" on opportunity_focus_areas for select using (true);

-- =====================
-- Email Subscribers
-- =====================
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  alert_preference TEXT NOT NULL DEFAULT 'all_grants' CHECK (alert_preference IN ('similar_only', 'all_grants')),
  focus_areas TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  unsubscribe_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_active ON email_subscribers (is_active) WHERE is_active = true;

-- =====================
-- Saved Opportunities
-- =====================
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  notes TEXT DEFAULT '',
  remind_before_deadline BOOLEAN DEFAULT false,
  reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_opps_user ON saved_opportunities (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opps_opp ON saved_opportunities (opportunity_id);

-- =====================
-- Application Tracking
-- =====================
CREATE TABLE IF NOT EXISTS application_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'researching' CHECK (status IN ('researching', 'writing', 'submitted', 'awarded', 'rejected', 'archived')),
  notes TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ,
  awarded_amount INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_app_tracking_user ON application_tracking (user_id);

-- =====================
-- RLS for user tables
-- =====================
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved opportunities" ON saved_opportunities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved opportunities" ON saved_opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved opportunities" ON saved_opportunities
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own saved opportunities" ON saved_opportunities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own applications" ON application_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON application_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON application_tracking
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON application_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================
-- Impact Data Tables
-- =====================
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

CREATE TABLE IF NOT EXISTS impact_data_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES impact_datasets(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  values JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_data_rows_dataset ON impact_data_rows(dataset_id);

-- RLS for impact data
ALTER TABLE impact_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_column_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_data_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own datasets" ON impact_datasets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own datasets" ON impact_datasets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own datasets" ON impact_datasets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own datasets" ON impact_datasets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own column mappings" ON impact_column_mappings
  FOR SELECT USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own column mappings" ON impact_column_mappings
  FOR INSERT WITH CHECK (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own column mappings" ON impact_column_mappings
  FOR UPDATE USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own column mappings" ON impact_column_mappings
  FOR DELETE USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own data rows" ON impact_data_rows
  FOR SELECT USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own data rows" ON impact_data_rows
  FOR INSERT WITH CHECK (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own data rows" ON impact_data_rows
  FOR UPDATE USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own data rows" ON impact_data_rows
  FOR DELETE USING (dataset_id IN (SELECT id FROM impact_datasets WHERE user_id = auth.uid()));
