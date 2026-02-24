import { NextResponse } from 'next/server'
import { runScraper, closeExpiredOpportunities, markClosingSoon } from '@/lib/scraper'
import { fetchGrantsGov } from '@/lib/scraper/grants-gov'
import { rotateFeaturedOpportunities } from '@/lib/scraper/rotate-featured'

/**
 * Cron endpoint: runs daily to scrape funder websites for new opportunities,
 * close expired ones, and mark upcoming deadlines.
 *
 * Secured with CRON_SECRET — Vercel Cron sends this automatically.
 * Can also be triggered manually: POST /api/cron/scrape with Authorization header.
 */
export async function GET(request: Request) {
  return handleScrape(request)
}

export async function POST(request: Request) {
  return handleScrape(request)
}

async function handleScrape(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()

  try {
    console.log('[Cron] Starting daily scrape job...')

    // 1. Close expired opportunities
    const closedCount = await closeExpiredOpportunities()

    // 2. Mark closing soon
    const closingSoonCount = await markClosingSoon()

    // 3. Run the website scraper (foundation pages)
    const scrapeResults = await runScraper()

    // 4. Fetch from Grants.gov API (federal grants)
    console.log('[Cron] Fetching Grants.gov federal opportunities...')
    const grantsGovResults = await fetchGrantsGov()

    // 5. Rotate featured opportunities on the homepage
    console.log('[Cron] Rotating featured opportunities...')
    const featuredResults = await rotateFeaturedOpportunities()

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    const response = {
      success: true,
      duration: `${duration}s`,
      expired_closed: closedCount,
      marked_closing_soon: closingSoonCount,
      funders_checked: scrapeResults.fundersChecked,
      new_opportunities: scrapeResults.newOpportunities + grantsGovResults.newOpportunities,
      updated_opportunities: scrapeResults.updatedOpportunities + grantsGovResults.updatedOpportunities,
      grants_gov: {
        fetched: grantsGovResults.fetched,
        new: grantsGovResults.newOpportunities,
        updated: grantsGovResults.updatedOpportunities,
        errors: grantsGovResults.errors,
      },
      featured_rotated: featuredResults,
      scraper_errors: scrapeResults.errors,
    }

    console.log('[Cron] Job complete:', JSON.stringify(response, null, 2))

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Cron] Fatal error:', message)

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
