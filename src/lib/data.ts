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
    .eq('is_verified', true)
    .order('name')

  if (error) {
    console.error('getFunders error:', error)
    return []
  }
  return data ?? []
}

export async function getFunderBySlug(slug: string): Promise<{
  funder: FunderDetail
  opportunities: OpportunityListItem[]
} | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('funders')
    .select('id, slug, name, funder_type, description, website_url, logo_url, headquarters, country_code, total_giving, assets, ein, contact_email')
    .eq('slug', slug)
    .eq('is_verified', true)
    .single()

  if (error || !data) return null

  const funder = data as FunderDetail
  const allOpps = await fetchAllOpportunityListItems()
  const opportunities = allOpps.filter((opp) => opp.funder_slug === slug)

  return { funder, opportunities }
}

export async function getAllFunderSlugs(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('funders')
    .select('slug')
    .eq('is_verified', true)
  return (data ?? []).map((f) => f.slug)
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
      is_featured, is_verified, created_at,
      funders!inner ( name, slug, funder_type, logo_url ),
      opportunity_focus_areas ( focus_areas ( name, slug ) )
    `)
    .eq('is_verified', true)

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
      created_at: row.created_at as string,
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
  complexity?: string[]
  newThisWeek?: boolean
  geography?: string[]
  firstTimeFriendly?: boolean
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

  // Complexity filter
  if (filters.complexity?.length) {
    results = results.filter((opp) => filters.complexity!.includes(opp.application_complexity))
  }

  // New this week filter
  if (filters.newThisWeek) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    results = results.filter((opp) => opp.created_at >= weekAgo)
  }

  // Geography filter — match against eligible_geography and geo_scope_display
  if (filters.geography?.length) {
    results = results.filter((opp) => {
      // If "US" is selected and opportunity is national, include it
      const geos = opp.eligible_geography ?? []
      const display = (opp.geo_scope_display ?? '').toLowerCase()

      return filters.geography!.some((geo) => {
        // Direct match in eligible_geography array
        if (geos.includes(geo)) return true
        // National US grants match any US state filter
        if (geos.includes('US') || display.includes('united states') || display.includes('national')) return true
        // Match state name in geo_scope_display
        if (display.includes(geo.toLowerCase())) return true
        return false
      })
    })
  }

  // First-time friendly filter
  if (filters.firstTimeFriendly) {
    const { isFirstTimeFriendly } = await import('@/lib/utils')
    results = results.filter((opp) => isFirstTimeFriendly(opp))
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
    .eq('is_verified', true)
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
    supabase.from('opportunities').select('id', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('funders').select('id', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('focus_areas').select('id', { count: 'exact', head: true }),
  ])

  return {
    opportunityCount: opps.count ?? 0,
    funderCount: fundrs.count ?? 0,
    focusAreaCount: fas.count ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Homepage aggregated data (one fetch, many sections)
// ---------------------------------------------------------------------------

export interface HomepageData {
  featured: OpportunityListItem[]
  closingSoon: OpportunityListItem[]
  recentlyAdded: OpportunityListItem[]
  opportunityCount: number
  funderCount: number
  totalFundingDisplay: string
  deadlinesThisMonth: number
  topFunders: { name: string; slug: string }[]
  lastUpdated: string | null
}

function formatFundingTotal(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(1)}B+`
  if (dollars >= 1_000_000) return `$${Math.round(dollars / 1_000_000)}M+`
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K+`
  if (dollars > 0) return `$${Math.round(dollars).toLocaleString()}`
  return '$0'
}

export async function getHomepageData(): Promise<HomepageData> {
  const supabase = await createClient()

  // Fetch opportunity items + funder data in parallel
  const [allItems, fundersResult, topFundersResult, lastUpdatedResult] = await Promise.all([
    fetchAllOpportunityListItems(),
    supabase.from('funders').select('id', { count: 'exact', head: true }).eq('is_verified', true),
    supabase
      .from('funders')
      .select('name, slug')
      .eq('is_verified', true)
      .order('total_giving', { ascending: false, nullsFirst: false })
      .limit(12),
    supabase
      .from('opportunities')
      .select('updated_at')
      .eq('is_verified', true)
      .order('updated_at', { ascending: false })
      .limit(1),
  ])

  const now = new Date()

  // Featured (rotated daily by cron)
  const featured = allItems.filter((opp) => opp.is_featured).slice(0, 6)

  // Closing soon — deadline within next 14 days, sorted soonest first
  const fourteenDays = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const closingSoon = allItems
    .filter((opp) => {
      if (!opp.deadline_date) return false
      const d = new Date(opp.deadline_date)
      return d >= now && d <= fourteenDays && (opp.status === 'open' || opp.status === 'closing_soon')
    })
    .sort((a, b) => new Date(a.deadline_date!).getTime() - new Date(b.deadline_date!).getTime())
    .slice(0, 6)

  // Recently added — last 7 days, newest first
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentlyAdded = allItems
    .filter((opp) => new Date(opp.created_at) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  // Deadlines this month
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const deadlinesThisMonth = allItems.filter((opp) => {
    if (!opp.deadline_date) return false
    const d = new Date(opp.deadline_date)
    return d >= now && d <= endOfMonth && (opp.status === 'open' || opp.status === 'closing_soon')
  }).length

  // Total funding available (sum of max amounts, in cents)
  let totalCents = 0
  for (const opp of allItems) {
    const amt = opp.amount_max ?? opp.amount_exact ?? 0
    if (amt > 0) totalCents += amt
  }

  // Last updated (most recent updated_at across all opportunities)
  const lastUpdated = (lastUpdatedResult.data?.[0]?.updated_at as string) ?? null

  return {
    featured,
    closingSoon,
    recentlyAdded,
    opportunityCount: allItems.length,
    funderCount: fundersResult.count ?? 0,
    totalFundingDisplay: formatFundingTotal(totalCents),
    deadlinesThisMonth,
    topFunders: (topFundersResult.data ?? []).map((f) => ({
      name: f.name as string,
      slug: f.slug as string,
    })),
    lastUpdated,
  }
}
