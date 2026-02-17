import type { SupabaseClient } from '@supabase/supabase-js'
import type { ScrapedOpportunity } from './index'
import crypto from 'crypto'

/**
 * Match scraped opportunities against existing ones and upsert.
 * Uses title similarity + funder_id for matching.
 * Returns counts of new and updated opportunities.
 */
export async function matchAndUpsertOpportunities(
  supabase: SupabaseClient,
  funderId: string,
  funderSlug: string,
  scraped: ScrapedOpportunity[]
): Promise<{ newCount: number; updatedCount: number }> {
  let newCount = 0
  let updatedCount = 0

  // Get existing opportunities for this funder
  const { data: existing, error } = await supabase
    .from('opportunities')
    .select('id, slug, title, source_hash, status')
    .eq('funder_id', funderId)

  if (error) {
    console.error(`[Matcher] Error fetching existing for ${funderSlug}:`, error.message)
    return { newCount: 0, updatedCount: 0 }
  }

  for (const opp of scraped) {
    try {
      // Generate a hash of the scraped content for change detection
      const contentHash = generateHash(opp)

      // Try to match with existing opportunity by title similarity
      const match = findBestMatch(opp.title, existing ?? [])

      if (match) {
        // Check if content has changed
        if (match.source_hash !== contentHash) {
          // Update existing opportunity
          const { error: updateError } = await supabase
            .from('opportunities')
            .update({
              summary: opp.summary || undefined,
              amount_display: opp.amount_display || undefined,
              deadline_display: opp.deadline_display || undefined,
              deadline_date: opp.deadline_date || undefined,
              application_url: opp.application_url || undefined,
              status: opp.status,
              source_hash: contentHash,
              updated_at: new Date().toISOString(),
            })
            .eq('id', match.id)

          if (!updateError) {
            updatedCount++
            console.log(`[Matcher] Updated: ${opp.title}`)
          }
        }
      } else {
        // New opportunity — insert
        const slug = generateSlug(funderSlug, opp.title)

        const { error: insertError } = await supabase
          .from('opportunities')
          .insert({
            slug,
            title: opp.title,
            funder_id: funderId,
            opportunity_type: opp.opportunity_type || 'grant',
            status: opp.status || 'open',
            summary: opp.summary,
            amount_display: opp.amount_display,
            deadline_type: opp.deadline_date ? 'fixed' : 'unknown',
            deadline_date: opp.deadline_date,
            deadline_display: opp.deadline_display,
            eligible_org_types: opp.eligible_org_types,
            eligible_geography: opp.eligible_geography,
            geo_scope_display: opp.geo_scope_display,
            application_url: opp.application_url,
            application_complexity: 'unknown',
            source_url: opp.application_url,
            source_hash: contentHash,
            is_featured: false,
            is_verified: false,
          })

        if (!insertError) {
          newCount++
          console.log(`[Matcher] New: ${opp.title}`)
        } else {
          console.error(`[Matcher] Insert error for "${opp.title}":`, insertError.message)
        }
      }
    } catch (err) {
      console.error(`[Matcher] Error processing "${opp.title}":`, err)
    }
  }

  return { newCount, updatedCount }
}

/**
 * Find the best matching existing opportunity by title similarity.
 */
function findBestMatch(
  title: string,
  existing: Array<{ id: string; slug: string; title: string; source_hash: string | null; status: string }>
): (typeof existing)[number] | null {
  const normalizedTitle = normalizeTitle(title)

  let bestMatch: (typeof existing)[number] | null = null
  let bestScore = 0

  for (const opp of existing) {
    const score = similarity(normalizedTitle, normalizeTitle(opp.title))
    if (score > bestScore && score >= 0.7) {
      bestScore = score
      bestMatch = opp
    }
  }

  return bestMatch
}

/**
 * Normalize a title for comparison.
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Simple Jaccard similarity between two strings (word-level).
 */
function similarity(a: string, b: string): number {
  const wordsA = new Set(a.split(' '))
  const wordsB = new Set(b.split(' '))

  let intersection = 0
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++
  }

  const union = wordsA.size + wordsB.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Generate a content hash for change detection.
 */
function generateHash(opp: ScrapedOpportunity): string {
  const content = JSON.stringify({
    title: opp.title,
    summary: opp.summary,
    amount: opp.amount_display,
    deadline: opp.deadline_display,
    status: opp.status,
  })
  return crypto.createHash('md5').update(content).digest('hex')
}

/**
 * Generate a URL-friendly slug from funder slug and opportunity title.
 */
function generateSlug(funderSlug: string, title: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '')

  return `${funderSlug}-${titleSlug}`
}
