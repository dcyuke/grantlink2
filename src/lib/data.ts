import type { OpportunityListItem, OpportunityDetail, FocusArea, FunderDetail, FunderType } from '@/types/opportunity'
import { createClient } from '@/lib/supabase/server'

// This module provides data access functions powered by Supabase.

export async function getFocusAreas(): Promise<FocusArea[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('focus_areas')
    .select('id, slug, name, parent_id, icon, sort_order')
    .order('sort_order')

  if (error) {
    console.error('getFocusAreas error:', error)
    return []
  }
  return data ?? []
}

export async function getFunders(): Promise<FunderDetail[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('funders')
    .select('id, slug, name, funder_type, description, website_url, logo_url, headquarters, country_code, total_giving, assets, ein, contact_email')
    .order('name')

  if (error) {
    console.error('getFunders error:', error)
    return []
  }
  return data ?? []
}

// Helper: fetch all opportunities with funder + focus area joins and map to OpportunityListItem
async function fetchAllOpportunityListItems(): Promise<OpportunityListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      id, slug, title, summary, opportunity_type, status,
      amount_min, amount_max, amount_exact, amount_display,
      deadline_type, deadline_date, deadline_display,
      eligible_org_types, eligible_geography, eligible_populations,
      geo_scope_display, application_url, application_complexity,
      is_featured, is_verified,
      funders!inner ( name, slug, funder_type, logo_url ),
      opportunity_focus_areas ( focus_areas ( name, slug ) )
    `)

  if (error) {
    console.error('fetchAllOpportunityListItems error:', error)
    return []
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const funder = row.funders as Record<string, unknown> | null
    const ofas = (row.opportunity_focus_areas as Array<{ focus_areas: { name: string; slug: string } | null }>) ?? []

    return {
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      summary: row.summary as string | null,
      opportunity_type: row.opportunity_type as OpportunityListItem['opportunity_type'],
      status: row.status as OpportunityListItem['status'],
      amount_min: row.amount_min as number | null,
      amount_max: row.amount_max as number | null,
      amount_exact: row.amount_exact as number | null,
      amount_display: row.amount_display as string | null,
      deadline_type: row.deadline_type as OpportunityListItem['deadline_type'],
      deadline_date: row.deadline_date as string | null,
      deadline_display: row.deadline_display as string | null,
      eligible_org_types: row.eligible_org_types as string[] | null,
      eligible_geography: row.eligible_geography as string[] | null,
      eligible_populations: row.eligible_populations as string[] | null,
      geo_scope_display: row.geo_scope_display as string | null,
      application_url: row.application_url as string | null,
      application_complexity: row.application_complexity as OpportunityListItem['application_complexity'],
      is_featured: row.is_featured as boolean,
      is_verified: row.is_verified as boolean,
      funder_name: (funder?.name as string) ?? null,
      funder_slug: (funder?.slug as string) ?? null,
      funder_type: (funder?.funder_type as OpportunityListItem['funder_type']) ?? null,
      funder_logo_url: (funder?.logo_url as string) ?? null,
      focus_area_names: ofas.map((ofa) => ofa.focus_areas?.name).filter(Boolean) as string[],
      focus_area_slugs: ofas.map((ofa) => ofa.focus_areas?.slug).filter(Boolean) as string[],
    }
  })
}

export async function getFeaturedOpportunities(): Promise<OpportunityListItem[]> {
  const all = await fetchAllOpportunityListItems()
  return all.filter((opp) => opp.is_featured).slice(0, 6)
}

export async function getAllOpportunities(): Promise<OpportunityListItem[]> {
  return fetchAllOpportunityListItems()
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
  const all = await fetchAllOpportunityListItems()
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
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      funders ( * ),
      opportunity_focus_areas ( focus_areas ( name, slug ) )
    `)
    .eq('slug', slug)
    .single()

  if (error || !data) return null

  const funderData = data.funders as Record<string, unknown> | null
  const ofas = (data.opportunity_focus_areas as Array<{ focus_areas: { name: string; slug: string } | null }>) ?? []

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    summary: data.summary ?? null,
    description: data.description ?? null,
    opportunity_type: data.opportunity_type,
    status: data.status,
    amount_min: data.amount_min,
    amount_max: data.amount_max,
    amount_exact: data.amount_exact,
    amount_display: data.amount_display,
    deadline_type: data.deadline_type,
    deadline_date: data.deadline_date,
    deadline_display: data.deadline_display,
    eligible_org_types: data.eligible_org_types,
    eligible_geography: data.eligible_geography,
    eligible_populations: data.eligible_populations,
    eligibility_summary: data.eligibility_summary ?? null,
    geo_scope: data.eligible_geography,
    geo_scope_display: data.geo_scope_display,
    application_url: data.application_url,
    application_complexity: data.application_complexity,
    application_notes: data.application_notes ?? null,
    total_pool: data.total_pool ?? null,
    num_awards: data.num_awards ?? null,
    open_date: data.open_date ?? null,
    cycle_frequency: data.cycle_frequency ?? null,
    eligible_org_budget_min: data.eligible_org_budget_min ?? null,
    eligible_org_budget_max: data.eligible_org_budget_max ?? null,
    eligible_org_age_min: data.eligible_org_age_min ?? null,
    requires_loi: data.requires_loi ?? false,
    requires_fiscal_sponsor: data.requires_fiscal_sponsor ?? false,
    source_url: data.source_url ?? data.application_url,
    is_featured: data.is_featured,
    is_verified: data.is_verified,
    view_count: data.view_count ?? 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    funder_name: (funderData?.name as string) ?? null,
    funder_slug: (funderData?.slug as string) ?? null,
    funder_type: (funderData?.funder_type as FunderType) ?? null,
    funder_logo_url: (funderData?.logo_url as string) ?? null,
    focus_area_names: ofas.map((ofa) => ofa.focus_areas?.name).filter(Boolean) as string[],
    focus_area_slugs: ofas.map((ofa) => ofa.focus_areas?.slug).filter(Boolean) as string[],
    funder: funderData
      ? {
          id: funderData.id as string,
          slug: funderData.slug as string,
          name: funderData.name as string,
          funder_type: funderData.funder_type as FunderType,
          description: (funderData.description as string) ?? null,
          website_url: (funderData.website_url as string) ?? null,
          logo_url: (funderData.logo_url as string) ?? null,
          headquarters: (funderData.headquarters as string) ?? null,
          country_code: (funderData.country_code as string) ?? null,
          total_giving: (funderData.total_giving as number) ?? null,
          assets: (funderData.assets as number) ?? null,
          ein: (funderData.ein as string) ?? null,
          contact_email: (funderData.contact_email as string) ?? null,
        }
      : null,
  }
}

export async function getOpportunityStats() {
  const supabase = await createClient()

  const [opps, fundrs, fas] = await Promise.all([
    supabase.from('opportunities').select('id', { count: 'exact', head: true }),
    supabase.from('funders').select('id', { count: 'exact', head: true }),
    supabase.from('focus_areas').select('id', { count: 'exact', head: true }),
  ])

  return {
    opportunityCount: opps.count ?? 0,
    funderCount: fundrs.count ?? 0,
    focusAreaCount: fas.count ?? 0,
  }
}
