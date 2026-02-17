export type OpportunityType =
  | 'grant'
  | 'fellowship'
  | 'prize'
  | 'competition'
  | 'corporate_giving'
  | 'impact_investment'
  | 'scholarship'
  | 'award'
  | 'residency'
  | 'accelerator'
  | 'other'

export type OpportunityStatus = 'open' | 'closing_soon' | 'closed' | 'upcoming' | 'unknown'

export type DeadlineType =
  | 'fixed'
  | 'rolling'
  | 'loi_then_full'
  | 'by_invitation'
  | 'continuous'
  | 'unknown'

export type ApplicationComplexity = 'simple' | 'moderate' | 'complex' | 'unknown'

export type FunderType =
  | 'private_foundation'
  | 'community_foundation'
  | 'corporate'
  | 'government_federal'
  | 'government_state'
  | 'government_local'
  | 'individual_donor'
  | 'impact_investor'
  | 'international_org'
  | 'other'

export interface OpportunityListItem {
  id: string
  slug: string
  title: string
  summary: string | null
  opportunity_type: OpportunityType
  status: OpportunityStatus
  amount_min: number | null
  amount_max: number | null
  amount_exact: number | null
  amount_display: string | null
  deadline_type: DeadlineType
  deadline_date: string | null
  deadline_display: string | null
  eligible_org_types: string[] | null
  eligible_geography: string[] | null
  eligible_populations: string[] | null
  geo_scope_display: string | null
  application_url: string | null
  application_complexity: ApplicationComplexity
  is_featured: boolean
  is_verified: boolean
  funder_name: string | null
  funder_slug: string | null
  funder_type: FunderType | null
  funder_logo_url: string | null
  focus_area_names: string[]
  focus_area_slugs: string[]
}

export interface OpportunityDetail extends OpportunityListItem {
  description: string | null
  eligibility_summary: string | null
  total_pool: number | null
  num_awards: number | null
  open_date: string | null
  cycle_frequency: string | null
  eligible_org_budget_min: number | null
  eligible_org_budget_max: number | null
  eligible_org_age_min: number | null
  geo_scope: string[] | null
  requires_loi: boolean
  requires_fiscal_sponsor: boolean
  application_notes: string | null
  source_url: string | null
  view_count: number
  created_at: string
  updated_at: string
  funder: FunderDetail | null
}

export interface FunderDetail {
  id: string
  slug: string
  name: string
  funder_type: FunderType
  description: string | null
  website_url: string | null
  logo_url: string | null
  headquarters: string | null
  country_code: string | null
  total_giving: number | null
  assets: number | null
  ein: string | null
  contact_email: string | null
}

export interface FocusArea {
  id: string
  slug: string
  name: string
  parent_id: string | null
  icon: string | null
  sort_order: number
}
