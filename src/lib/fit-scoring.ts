/**
 * Shared fit-scoring logic used by both the individual opportunity
 * FitAssessment widget and the search-level fit badges.
 */

export interface OrgProfile {
  orgType: string
  geography: string
  populations: string[]
  budget: string
  missionAlignment: string
}

export interface FitResult {
  score: number
  matches: { label: string; status: 'match' | 'partial' | 'mismatch' | 'unknown' }[]
  summary: string
}

export interface OpportunityFitData {
  eligibleOrgTypes: string[] | null
  eligibleGeography: string[] | null
  eligiblePopulations: string[] | null
  amountMin: number | null
  amountMax: number | null
  applicationComplexity: string
}

/**
 * Full fit calculation — used by the detail-page FitAssessment widget.
 * Checks org type, geography, population alignment, and mission statement.
 */
export function calculateFit(profile: OrgProfile, props: OpportunityFitData): FitResult {
  const matches: FitResult['matches'] = []
  let matchCount = 0
  let totalChecks = 0

  // Organization type check
  if (props.eligibleOrgTypes?.length) {
    totalChecks++
    if (profile.orgType && props.eligibleOrgTypes.includes(profile.orgType)) {
      matches.push({ label: 'Organization type eligible', status: 'match' })
      matchCount++
    } else if (profile.orgType) {
      matches.push({ label: 'Organization type may not be eligible', status: 'mismatch' })
    } else {
      matches.push({ label: 'Organization type not specified', status: 'unknown' })
      matchCount += 0.5
    }
  }

  // Geography check
  if (props.eligibleGeography?.length) {
    totalChecks++
    const geo = profile.geography.toUpperCase().trim()
    const isMatch = props.eligibleGeography.some(
      (g) => g === 'Global' || g.toUpperCase() === geo || geo.includes(g.toUpperCase())
    )
    if (geo && isMatch) {
      matches.push({ label: 'Geographic eligibility met', status: 'match' })
      matchCount++
    } else if (geo) {
      matches.push({ label: 'May not meet geographic requirements', status: 'mismatch' })
    } else {
      matches.push({ label: 'Geographic eligibility not checked', status: 'unknown' })
      matchCount += 0.5
    }
  }

  // Population alignment
  if (props.eligiblePopulations?.length && props.eligiblePopulations.length > 0) {
    totalChecks++
    const overlap = profile.populations.filter((p) =>
      props.eligiblePopulations!.includes(p)
    )
    if (overlap.length > 0) {
      matches.push({
        label: `Population alignment: ${overlap.length} of ${props.eligiblePopulations.length} match`,
        status: overlap.length >= props.eligiblePopulations.length / 2 ? 'match' : 'partial',
      })
      matchCount += overlap.length / props.eligiblePopulations.length
    } else if (profile.populations.length > 0) {
      matches.push({ label: 'Populations served may not align', status: 'mismatch' })
    } else {
      matches.push({ label: 'Population alignment not checked', status: 'unknown' })
      matchCount += 0.5
    }
  }

  // Mission alignment (text-based - simple keyword check)
  if (profile.missionAlignment.trim().length > 10) {
    totalChecks++
    matches.push({ label: 'Mission statement provided', status: 'match' })
    matchCount++
  } else if (profile.missionAlignment.trim().length > 0) {
    totalChecks++
    matches.push({ label: 'Consider adding more detail about your mission', status: 'partial' })
    matchCount += 0.5
  }

  const score = totalChecks > 0 ? Math.round((matchCount / totalChecks) * 100) : 50
  let summary: string
  if (score >= 80) {
    summary = 'Strong fit! Your organization aligns well with this opportunity\'s requirements.'
  } else if (score >= 60) {
    summary = 'Moderate fit. Some criteria align, but review the requirements carefully.'
  } else if (score >= 40) {
    summary = 'Partial fit. Several criteria may not align - review eligibility before applying.'
  } else {
    summary = 'This opportunity may not be the best match for your organization.'
  }

  return { score, matches, summary }
}

/**
 * Lightweight fit calculation for search results.
 * Skips mission alignment (per-opportunity field) and returns a simple score + label.
 */
export function calculateSearchFit(
  profile: OrgProfile,
  opp: OpportunityFitData
): { score: number; label: string; color: string } {
  // Use the full calculateFit but with empty mission alignment
  const profileForSearch: OrgProfile = {
    ...profile,
    missionAlignment: '',
  }
  const result = calculateFit(profileForSearch, opp)
  const { label, color } = getFitLabel(result.score)
  return { score: result.score, label, color }
}

/**
 * Get a human-readable label and color for a fit score.
 */
export function getFitLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Strong Fit', color: 'emerald' }
  if (score >= 60) return { label: 'Moderate Fit', color: 'amber' }
  if (score >= 40) return { label: 'Partial Fit', color: 'orange' }
  return { label: 'Low Fit', color: 'rose' }
}
