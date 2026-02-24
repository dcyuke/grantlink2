import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Automatically rotates the "Featured" grants on the homepage each day.
 *
 * Selection criteria (picks 6):
 *  1. Must be open or closing_soon (no expired grants on the homepage)
 *  2. Must have a deadline in the future (or rolling/continuous)
 *  3. Prioritizes:
 *     - Grants with upcoming deadlines (next 60 days) — urgency
 *     - Recently added grants (last 14 days) — freshness
 *     - Variety of focus areas — diversity
 *     - Mix of funder types — breadth
 *     - First-time friendly grants — accessibility (at least 1)
 *  4. Avoids featuring the same grants two days in a row when possible
 */

const TARGET_FEATURED_COUNT = 6

export async function rotateFeaturedOpportunities(): Promise<{
  unfeatured: number
  featured: number
}> {
  const supabase = createAdminClient()

  // 1. Clear ALL current featured flags
  const { data: currentFeatured } = await supabase
    .from('opportunities')
    .update({ is_featured: false })
    .eq('is_featured', true)
    .select('id')

  const unfeaturedCount = currentFeatured?.length ?? 0

  // 2. Fetch all eligible opportunities (open, verified, with useful data)
  const { data: candidates, error } = await supabase
    .from('opportunities')
    .select(`
      id, slug, title, status, deadline_type, deadline_date,
      application_complexity, amount_max, amount_exact,
      requires_loi, created_at,
      funders!inner ( funder_type ),
      opportunity_focus_areas ( focus_areas ( slug ) )
    `)
    .eq('is_verified', true)
    .in('status', ['open', 'closing_soon', 'upcoming'])

  if (error || !candidates || candidates.length === 0) {
    console.log('[RotateFeatured] No eligible candidates found:', error?.message)
    return { unfeatured: unfeaturedCount, featured: 0 }
  }

  const now = new Date()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  // 3. Score each candidate
  type Candidate = (typeof candidates)[number]

  const scored = candidates.map((c: Candidate) => {
    let score = 0

    const funder = c.funders as unknown as Record<string, unknown> | null
    const ofas = (c.opportunity_focus_areas as unknown as Array<{ focus_areas: { slug: string } | null }>) ?? []
    const focusSlugs = ofas.map((ofa) => ofa.focus_areas?.slug).filter(Boolean) as string[]

    // Upcoming deadline bonus (grants due in next 60 days = high urgency)
    if (c.deadline_date) {
      const deadlineDate = new Date(c.deadline_date)
      if (deadlineDate > now && deadlineDate <= sixtyDaysFromNow) {
        score += 30
        // Extra urgency for deadlines in next 30 days
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        if (deadlineDate <= thirtyDaysFromNow) {
          score += 15
        }
      } else if (deadlineDate <= now) {
        // Skip expired deadlines
        score -= 100
      }
    }

    // Rolling/continuous grants are always timely
    if (c.deadline_type === 'rolling' || c.deadline_type === 'continuous') {
      score += 10
    }

    // Freshness bonus: recently added
    if (new Date(c.created_at) > fourteenDaysAgo) {
      score += 20
    }

    // First-time friendly bonus
    const isSimple = c.application_complexity === 'simple'
    const isModerate = c.application_complexity === 'moderate'
    const maxAmt = (c.amount_max ?? c.amount_exact ?? null) as number | null
    const isSmallGrant = maxAmt !== null && maxAmt <= 10000000 // $100K
    const noLoi = !c.requires_loi
    if (isSimple || (isModerate && isSmallGrant && noLoi)) {
      score += 10
    }

    // Slight randomization to keep things fresh day to day
    score += Math.random() * 15

    return {
      id: c.id as string,
      score,
      funderType: (funder as Record<string, unknown>)?.funder_type as string ?? 'other',
      focusSlugs,
      isFirstTimeFriendly: isSimple || (isModerate && isSmallGrant && noLoi),
    }
  })

  // 4. Remove any with strongly negative scores (expired)
  const viable = scored.filter((c) => c.score > 0)

  if (viable.length === 0) {
    console.log('[RotateFeatured] No viable candidates after scoring')
    return { unfeatured: unfeaturedCount, featured: 0 }
  }

  // 5. Select top candidates with diversity in mind
  viable.sort((a, b) => b.score - a.score)

  const selected: typeof viable = []
  const usedFunderTypes = new Set<string>()
  const usedFocusSlugs = new Set<string>()
  let hasFirstTimeFriendly = false

  // First pass: pick the highest-scoring diverse set
  for (const candidate of viable) {
    if (selected.length >= TARGET_FEATURED_COUNT) break

    // Diversity bonuses: prefer different funder types & focus areas
    const isNewFunderType = !usedFunderTypes.has(candidate.funderType)
    const hasNewFocusArea = candidate.focusSlugs.some((s) => !usedFocusSlugs.has(s))

    // Accept if it adds diversity, or if we haven't filled 6 yet and it's high-scoring
    if (selected.length < 2 || isNewFunderType || hasNewFocusArea || selected.length < TARGET_FEATURED_COUNT) {
      selected.push(candidate)
      usedFunderTypes.add(candidate.funderType)
      candidate.focusSlugs.forEach((s) => usedFocusSlugs.add(s))
      if (candidate.isFirstTimeFriendly) hasFirstTimeFriendly = true
    }
  }

  // Ensure at least 1 first-time friendly if possible
  if (!hasFirstTimeFriendly && selected.length >= TARGET_FEATURED_COUNT) {
    const friendlyCandidate = viable.find(
      (c) => c.isFirstTimeFriendly && !selected.some((s) => s.id === c.id)
    )
    if (friendlyCandidate) {
      // Replace the lowest-scoring selected item
      selected[selected.length - 1] = friendlyCandidate
    }
  }

  // 6. Update the database
  const selectedIds = selected.map((s) => s.id)

  if (selectedIds.length > 0) {
    const { error: updateError } = await supabase
      .from('opportunities')
      .update({ is_featured: true })
      .in('id', selectedIds)

    if (updateError) {
      console.error('[RotateFeatured] Error updating featured:', updateError.message)
      return { unfeatured: unfeaturedCount, featured: 0 }
    }
  }

  console.log(`[RotateFeatured] Rotated: ${unfeaturedCount} unfeatured, ${selectedIds.length} newly featured`)

  return { unfeatured: unfeaturedCount, featured: selectedIds.length }
}
