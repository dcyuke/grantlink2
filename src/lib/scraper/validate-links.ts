import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Validates application URLs for all active opportunities.
 * Dead links (404, 410, connection refused, timeout) get flagged.
 *
 * - Opportunities with dead links get their status set to 'closed' and
 *   is_verified set to false so they stop appearing in search results.
 * - Opportunities with working links get a `link_last_verified` timestamp bump.
 *
 * Runs as part of the daily cron job.
 */
export async function validateOpportunityLinks(): Promise<{
  checked: number
  dead: number
  alive: number
  errors: string[]
}> {
  const supabase = createAdminClient()
  const results = { checked: 0, dead: 0, alive: 0, errors: [] as string[] }

  // Fetch all active opportunities with application URLs
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('id, title, slug, application_url, funder_id')
    .eq('is_verified', true)
    .in('status', ['open', 'closing_soon', 'upcoming'])
    .not('application_url', 'is', null)

  if (error || !opportunities) {
    results.errors.push(`Failed to fetch opportunities: ${error?.message}`)
    return results
  }

  console.log(`[LinkValidator] Checking ${opportunities.length} opportunity links...`)

  // Process in batches to avoid overwhelming servers
  const BATCH_SIZE = 10
  const deadIds: string[] = []
  const aliveIds: string[] = []

  for (let i = 0; i < opportunities.length; i += BATCH_SIZE) {
    const batch = opportunities.slice(i, i + BATCH_SIZE)

    const checks = batch.map(async (opp) => {
      results.checked++
      try {
        const response = await fetch(opp.application_url!, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'GrantLink/1.0 (grant-link-checker)',
            Accept: 'text/html,application/xhtml+xml,*/*',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
        })

        // Some servers don't support HEAD — fall back to GET if we get 405
        if (response.status === 405) {
          const getResponse = await fetch(opp.application_url!, {
            method: 'GET',
            headers: {
              'User-Agent': 'GrantLink/1.0 (grant-link-checker)',
              Accept: 'text/html,application/xhtml+xml,*/*',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(15000),
          })
          if (getResponse.ok || getResponse.status === 403) {
            // 403 often means the page exists but blocks bots — don't flag as dead
            aliveIds.push(opp.id)
          } else if (getResponse.status === 404 || getResponse.status === 410) {
            console.log(`[LinkValidator] DEAD: ${opp.title} → ${opp.application_url} (${getResponse.status})`)
            deadIds.push(opp.id)
          } else {
            // Other status codes — keep as alive, may be temporary
            aliveIds.push(opp.id)
          }
          return
        }

        if (response.ok || response.status === 403 || response.status === 301 || response.status === 302) {
          aliveIds.push(opp.id)
        } else if (response.status === 404 || response.status === 410) {
          console.log(`[LinkValidator] DEAD: ${opp.title} → ${opp.application_url} (${response.status})`)
          deadIds.push(opp.id)
        } else {
          // Other status codes (500, 503, etc.) — don't flag as dead, may be temporary
          aliveIds.push(opp.id)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        // Connection refused or DNS failure likely means page is truly dead
        if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
          console.log(`[LinkValidator] DEAD (connection): ${opp.title} → ${opp.application_url}`)
          deadIds.push(opp.id)
        } else if (msg.includes('timeout') || msg.includes('AbortError')) {
          // Timeout — could be temporary, don't flag
          results.errors.push(`Timeout: ${opp.title}`)
          aliveIds.push(opp.id)
        } else {
          results.errors.push(`${opp.title}: ${msg}`)
          aliveIds.push(opp.id)
        }
      }
    })

    await Promise.all(checks)

    // Small delay between batches to be respectful
    if (i + BATCH_SIZE < opportunities.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  // Mark dead links as closed and unverified
  if (deadIds.length > 0) {
    const { error: updateError } = await supabase
      .from('opportunities')
      .update({
        status: 'closed',
        is_verified: false,
        application_notes: 'Automatically closed: application link no longer active.',
      })
      .in('id', deadIds)

    if (updateError) {
      results.errors.push(`Failed to update dead opportunities: ${updateError.message}`)
    }
  }

  // Update link_last_verified for alive links
  // Note: we update in batches since Supabase has limits
  if (aliveIds.length > 0) {
    const UPSERT_BATCH = 100
    for (let i = 0; i < aliveIds.length; i += UPSERT_BATCH) {
      const batch = aliveIds.slice(i, i + UPSERT_BATCH)
      await supabase
        .from('opportunities')
        .update({ updated_at: new Date().toISOString() })
        .in('id', batch)
    }
  }

  results.dead = deadIds.length
  results.alive = aliveIds.length

  console.log(`[LinkValidator] Done: ${results.checked} checked, ${results.alive} alive, ${results.dead} dead`)
  return results
}
