import type { OpportunityListItem, OpportunityDetail, FocusArea, FunderDetail } from '@/types/opportunity'

// This module provides data access functions.
// For the MVP, it reads from the seed data directly.
// When Supabase is set up, swap these implementations to use the Supabase client.

let seedDataModule: typeof import('./seed-data') | null = null

async function getSeedData() {
  if (!seedDataModule) {
    seedDataModule = await import('./seed-data')
  }
  return seedDataModule
}

export async function getFocusAreas(): Promise<FocusArea[]> {
  const data = await getSeedData()
  return data.SEED_FOCUS_AREAS.map((fa) => ({
    id: fa.id,
    slug: fa.slug,
    name: fa.name,
    parent_id: null,
    icon: fa.icon,
    sort_order: fa.sort_order,
  }))
}

export async function getFunders(): Promise<FunderDetail[]> {
  const data = await getSeedData()
  return data.SEED_FUNDERS.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    funder_type: f.funder_type,
    description: f.description,
    website_url: f.website_url,
    logo_url: null,
    headquarters: f.headquarters,
    country_code: f.country_code,
    total_giving: f.total_giving,
    assets: f.assets,
    ein: f.ein,
    contact_email: null,
  }))
}

function buildOpportunityListItem(
  opp: (typeof import('./seed-data'))['SEED_OPPORTUNITIES'][number],
  funders: (typeof import('./seed-data'))['SEED_FUNDERS'],
  focusAreas: (typeof import('./seed-data'))['SEED_FOCUS_AREAS'],
  oppFocusAreas: (typeof import('./seed-data'))['SEED_OPPORTUNITY_FOCUS_AREAS'],
): OpportunityListItem {
  const funder = funders.find((f) => f.id === opp.funder_id)
  const focusAreaIds = oppFocusAreas
    .filter((ofa) => ofa.opportunity_id === opp.id)
    .map((ofa) => ofa.focus_area_id)
  const matchedFocusAreas = focusAreas.filter((fa) => focusAreaIds.includes(fa.id))

  return {
    id: opp.id,
    slug: opp.slug,
    title: opp.title,
    summary: opp.summary,
    opportunity_type: opp.opportunity_type,
    status: opp.status,
    amount_min: opp.amount_min,
    amount_max: opp.amount_max,
    amount_exact: opp.amount_exact,
    amount_display: opp.amount_display,
    deadline_type: opp.deadline_type,
    deadline_date: opp.deadline_date,
    deadline_display: opp.deadline_display,
    eligible_org_types: opp.eligible_org_types,
    eligible_geography: opp.eligible_geography,
    eligible_populations: opp.eligible_populations,
    geo_scope_display: opp.geo_scope_display,
    application_url: opp.application_url,
    application_complexity: opp.application_complexity,
    is_featured: opp.is_featured,
    is_verified: true,
    funder_name: funder?.name ?? null,
    funder_slug: funder?.slug ?? null,
    funder_type: funder?.funder_type ?? null,
    funder_logo_url: null,
    focus_area_names: matchedFocusAreas.map((fa) => fa.name),
    focus_area_slugs: matchedFocusAreas.map((fa) => fa.slug),
  }
}

export async function getFeaturedOpportunities(): Promise<OpportunityListItem[]> {
  const data = await getSeedData()
  return data.SEED_OPPORTUNITIES
    .filter((opp) => opp.is_featured)
    .map((opp) =>
      buildOpportunityListItem(opp, data.SEED_FUNDERS, data.SEED_FOCUS_AREAS, data.SEED_OPPORTUNITY_FOCUS_AREAS)
    )
    .slice(0, 6)
}

export async function getAllOpportunities(): Promise<OpportunityListItem[]> {
  const data = await getSeedData()
  return data.SEED_OPPORTUNITIES.map((opp) =>
    buildOpportunityListItem(opp, data.SEED_FUNDERS, data.SEED_FOCUS_AREAS, data.SEED_OPPORTUNITY_FOCUS_AREAS)
  )
}

export interface SearchFilters {
  q?: string
  types?: string[]
  funderTypes?: string[]
  focusAreas?: string[]
  populations?: string[]
  amountMin?: number
  amountMax?: number
  deadline?: string
  orgTypes?: string[]
  sort?: string
  page?: number
}

export async function searchOpportunities(filters: SearchFilters): Promise<{
  opportunities: OpportunityListItem[]
  totalCount: number
  page: number
  pageSize: number
}> {
  const all = await getAllOpportunities()
  let results = [...all]

  // Text search
  if (filters.q) {
    const q = filters.q.toLowerCase()
    results = results.filter(
      (opp) =>
        opp.title.toLowerCase().includes(q) ||
        opp.summary?.toLowerCase().includes(q) ||
        opp.funder_name?.toLowerCase().includes(q) ||
        opp.focus_area_names.some((fa) => fa.toLowerCase().includes(q)) ||
        opp.geo_scope_display?.toLowerCase().includes(q)
    )
  }

  // Type filter
  if (filters.types?.length) {
    results = results.filter((opp) => filters.types!.includes(opp.opportunity_type))
  }

  // Funder type filter
  if (filters.funderTypes?.length) {
    results = results.filter((opp) => opp.funder_type && filters.funderTypes!.includes(opp.funder_type))
  }

  // Focus area filter
  if (filters.focusAreas?.length) {
    results = results.filter((opp) =>
      opp.focus_area_slugs.some((slug) => filters.focusAreas!.includes(slug))
    )
  }

  // Population filter
  if (filters.populations?.length) {
    results = results.filter((opp) =>
      opp.eligible_populations?.some((pop) => filters.populations!.includes(pop))
    )
  }

  // Amount filter
  if (filters.amountMin != null) {
    results = results.filter((opp) => {
      const max = opp.amount_max ?? opp.amount_exact ?? opp.amount_min
      return max != null && max >= filters.amountMin!
    })
  }
  if (filters.amountMax != null) {
    results = results.filter((opp) => {
      const min = opp.amount_min ?? opp.amount_exact ?? opp.amount_max
      return min != null && min <= filters.amountMax!
    })
  }

  // Deadline filter
  if (filters.deadline) {
    const now = new Date()
    if (filters.deadline === 'rolling') {
      results = results.filter((opp) => opp.deadline_type === 'rolling' || opp.deadline_type === 'continuous')
    } else if (filters.deadline === '30days') {
      const cutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      results = results.filter(
        (opp) => opp.deadline_date && new Date(opp.deadline_date) <= cutoff && new Date(opp.deadline_date) >= now
      )
    } else if (filters.deadline === '90days') {
      const cutoff = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      results = results.filter(
        (opp) => opp.deadline_date && new Date(opp.deadline_date) <= cutoff && new Date(opp.deadline_date) >= now
      )
    } else if (filters.deadline === 'open') {
      results = results.filter((opp) => opp.status === 'open' || opp.status === 'closing_soon')
    }
  }

  // Org type filter
  if (filters.orgTypes?.length) {
    results = results.filter((opp) =>
      opp.eligible_org_types?.some((t) => filters.orgTypes!.includes(t))
    )
  }

  // Sort
  const sort = filters.sort || 'relevance'
  if (sort === 'deadline_asc') {
    results.sort((a, b) => {
      if (!a.deadline_date) return 1
      if (!b.deadline_date) return -1
      return new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime()
    })
  } else if (sort === 'deadline_desc') {
    results.sort((a, b) => {
      if (!a.deadline_date) return 1
      if (!b.deadline_date) return -1
      return new Date(b.deadline_date).getTime() - new Date(a.deadline_date).getTime()
    })
  } else if (sort === 'amount_desc') {
    results.sort((a, b) => {
      const aMax = a.amount_max ?? a.amount_exact ?? a.amount_min ?? 0
      const bMax = b.amount_max ?? b.amount_exact ?? b.amount_min ?? 0
      return bMax - aMax
    })
  } else if (sort === 'amount_asc') {
    results.sort((a, b) => {
      const aMin = a.amount_min ?? a.amount_exact ?? a.amount_max ?? 0
      const bMin = b.amount_min ?? b.amount_exact ?? b.amount_max ?? 0
      return aMin - bMin
    })
  } else {
    // relevance or newest: featured first, then by status
    results.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      return 0
    })
  }

  const totalCount = results.length
  const page = filters.page || 1
  const pageSize = 12
  const start = (page - 1) * pageSize
  const paged = results.slice(start, start + pageSize)

  return { opportunities: paged, totalCount, page, pageSize }
}

export async function getOpportunityBySlug(slug: string): Promise<OpportunityDetail | null> {
  const data = await getSeedData()
  const opp = data.SEED_OPPORTUNITIES.find((o) => o.slug === slug)
  if (!opp) return null

  const funder = data.SEED_FUNDERS.find((f) => f.id === opp.funder_id)
  const focusAreaIds = data.SEED_OPPORTUNITY_FOCUS_AREAS
    .filter((ofa) => ofa.opportunity_id === opp.id)
    .map((ofa) => ofa.focus_area_id)
  const matchedFocusAreas = data.SEED_FOCUS_AREAS.filter((fa) => focusAreaIds.includes(fa.id))

  return {
    id: opp.id,
    slug: opp.slug,
    title: opp.title,
    summary: opp.summary,
    description: opp.description ?? null,
    opportunity_type: opp.opportunity_type,
    status: opp.status,
    amount_min: opp.amount_min,
    amount_max: opp.amount_max,
    amount_exact: opp.amount_exact,
    amount_display: opp.amount_display,
    deadline_type: opp.deadline_type,
    deadline_date: opp.deadline_date,
    deadline_display: opp.deadline_display,
    eligible_org_types: opp.eligible_org_types,
    eligible_geography: opp.eligible_geography,
    eligible_populations: opp.eligible_populations,
    eligibility_summary: opp.eligibility_summary ?? null,
    geo_scope: opp.eligible_geography,
    geo_scope_display: opp.geo_scope_display,
    application_url: opp.application_url,
    application_complexity: opp.application_complexity,
    application_notes: null,
    total_pool: null,
    num_awards: opp.num_awards ?? null,
    open_date: null,
    cycle_frequency: opp.cycle_frequency ?? null,
    eligible_org_budget_min: null,
    eligible_org_budget_max: null,
    eligible_org_age_min: null,
    requires_loi: opp.requires_loi ?? false,
    requires_fiscal_sponsor: opp.requires_fiscal_sponsor ?? false,
    source_url: opp.application_url,
    is_featured: opp.is_featured,
    is_verified: true,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    funder_name: funder?.name ?? null,
    funder_slug: funder?.slug ?? null,
    funder_type: funder?.funder_type ?? null,
    funder_logo_url: null,
    focus_area_names: matchedFocusAreas.map((fa) => fa.name),
    focus_area_slugs: matchedFocusAreas.map((fa) => fa.slug),
    funder: funder
      ? {
          id: funder.id,
          slug: funder.slug,
          name: funder.name,
          funder_type: funder.funder_type,
          description: funder.description,
          website_url: funder.website_url,
          logo_url: null,
          headquarters: funder.headquarters,
          country_code: funder.country_code,
          total_giving: funder.total_giving,
          assets: funder.assets,
          ein: funder.ein,
          contact_email: null,
        }
      : null,
  }
}

export async function getOpportunityStats() {
  const data = await getSeedData()
  return {
    opportunityCount: data.SEED_OPPORTUNITIES.length,
    funderCount: data.SEED_FUNDERS.length,
    focusAreaCount: data.SEED_FOCUS_AREAS.length,
  }
}
