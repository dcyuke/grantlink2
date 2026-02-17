-- GrantLink Database Schema
-- Run this in Supabase SQL Editor or via the API

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
  -- Scraping fields
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
-- Row Level Security
-- =====================
alter table focus_areas enable row level security;
alter table funders enable row level security;
alter table opportunities enable row level security;
alter table opportunity_focus_areas enable row level security;

create policy "Public read access" on focus_areas for select using (true);
create policy "Public read access" on funders for select using (true);
create policy "Public read access" on opportunities for select using (true);
create policy "Public read access" on opportunity_focus_areas for select using (true);
