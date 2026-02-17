import { createAdminClient } from '@/lib/supabase/admin'
import { parseGrantsPage } from './parsers'
import { matchAndUpsertOpportunities } from './matcher'

export interface ScrapedOpportunity {
  title: string
  summary: string | null
  amount_display: string | null
  deadline_display: string | null
  deadline_date: string | null
  application_url: string | null
  status: 'open' | 'closing_soon' | 'closed' | 'upcoming' | 'unknown'
  opportunity_type: string
  eligible_org_types: string[]
  eligible_geography: string[]
  geo_scope_display: string | null
}

interface FunderScrapeConfig {
  id: string
  name: string
  slug: string
  scrape_url: string
  scrape_config: {
    type?: 'html' | 'api'
    selectors?: Record<string, string>
    grants_page_url?: string
  } | null
}

export async function runScraper(): Promise<{
  fundersChecked: number
  newOpportunities: number
  updatedOpportunities: number
  errors: string[]
}> {
  const supabase = createAdminClient()
  const results = {
    fundersChecked: 0,
    newOpportunities: 0,
    updatedOpportunities: 0,
    errors: [] as string[],
  }

  // Get all funders with scrape URLs
  const { data: funders, error } = await supabase
    .from('funders')
    .select('id, name, slug, scrape_url, scrape_config')
    .not('scrape_url', 'is', null)

  if (error || !funders) {
    results.errors.push(`Failed to fetch funders: ${error?.message}`)
    return results
  }

  console.log(`[Scraper] Found ${funders.length} funders with scrape URLs`)

  for (const funder of funders as FunderScrapeConfig[]) {
    try {
      results.fundersChecked++
      console.log(`[Scraper] Checking ${funder.name} (${funder.scrape_url})...`)

      // Fetch the grants page
      const response = await fetch(funder.scrape_url, {
        headers: {
          'User-Agent': 'GrantLink/1.0 (grant discovery platform)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        results.errors.push(`${funder.name}: HTTP ${response.status}`)
        continue
      }

      const html = await response.text()

      // Parse grants from the page
      const scraped = await parseGrantsPage(html, funder.scrape_url, funder.scrape_config)

      if (scraped.length === 0) {
        console.log(`[Scraper] No opportunities found for ${funder.name}`)
        continue
      }

      console.log(`[Scraper] Found ${scraped.length} opportunities for ${funder.name}`)

      // Match against existing and upsert
      const { newCount, updatedCount } = await matchAndUpsertOpportunities(
        supabase,
        funder.id,
        funder.slug,
        scraped
      )

      results.newOpportunities += newCount
      results.updatedOpportunities += updatedCount

      // Update last_scraped_at
      await supabase
        .from('funders')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', funder.id)

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.errors.push(`${funder.name}: ${msg}`)
      console.error(`[Scraper] Error for ${funder.name}:`, msg)
    }
  }

  return results
}

/**
 * Mark opportunities as closed if their deadline has passed.
 */
export async function closeExpiredOpportunities(): Promise<number> {
  const supabase = createAdminClient()
  const now = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('opportunities')
    .update({ status: 'closed' })
    .in('status', ['open', 'closing_soon'])
    .lt('deadline_date', now)
    .not('deadline_date', 'is', null)
    .select('id')

  if (error) {
    console.error('[Scraper] Error closing expired:', error.message)
    return 0
  }

  const count = data?.length ?? 0
  if (count > 0) {
    console.log(`[Scraper] Closed ${count} expired opportunities`)
  }
  return count
}

/**
 * Mark opportunities as closing_soon if deadline is within 14 days.
 */
export async function markClosingSoon(): Promise<number> {
  const supabase = createAdminClient()
  const now = new Date()
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const nowStr = now.toISOString().split('T')[0]
  const cutoff = twoWeeks.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('opportunities')
    .update({ status: 'closing_soon' })
    .eq('status', 'open')
    .gte('deadline_date', nowStr)
    .lte('deadline_date', cutoff)
    .select('id')

  if (error) {
    console.error('[Scraper] Error marking closing soon:', error.message)
    return 0
  }

  const count = data?.length ?? 0
  if (count > 0) {
    console.log(`[Scraper] Marked ${count} opportunities as closing soon`)
  }
  return count
}
