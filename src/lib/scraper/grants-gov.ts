import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

/**
 * Grants.gov API fetcher.
 * Uses the free, no-auth search2 endpoint to pull federal grant opportunities.
 * Docs: https://grants.gov/api/api-guide
 */

const GRANTS_GOV_API = 'https://api.grants.gov/v1/api/search2'
const FETCH_OPPORTUNITY_API = 'https://api.grants.gov/v1/api/fetchOpportunity'

// Map Grants.gov funding categories to our focus area slugs
const CATEGORY_TO_FOCUS_AREA: Record<string, string[]> = {
  'ACA': ['arts-culture'],           // Arts
  'AG': ['food-agriculture'],        // Agriculture
  'BC': ['economic-development'],    // Business and Commerce
  'CD': ['community-development'],   // Community Development
  'CP': ['civic-engagement'],        // Consumer Protection
  'DPR': ['social-justice'],         // Disaster Prevention and Relief
  'ED': ['education'],               // Education
  'ELT': ['workforce'],              // Employment, Labor and Training
  'EN': ['environment'],             // Energy
  'ENV': ['environment'],            // Environment
  'FN': ['food-agriculture'],        // Food and Nutrition
  'HL': ['health'],                  // Health
  'HO': ['housing'],                 // Housing
  'HU': ['social-justice'],          // Humanities
  'IIJ': ['social-justice'],         // Income Security and Social Services
  'IS': ['technology'],              // Information and Statistics
  'ISS': ['international'],          // International
  'LJL': ['social-justice'],         // Law, Justice and Legal Services
  'NR': ['environment'],             // Natural Resources
  'O': ['community-development'],    // Other
  'RA': ['science-research'],        // Recovery Act
  'RD': ['science-research'],        // Regional Development
  'ST': ['science-research'],        // Science and Technology
  'T': ['technology'],               // Transportation
}

// Map Grants.gov eligibility codes to our org types
const ELIGIBILITY_TO_ORG_TYPE: Record<string, string> = {
  '12': '501c3',              // Nonprofits having a 501(c)(3) status
  '13': '501c3',              // Nonprofits without 501(c)(3)
  '25': 'individual',         // Individuals
  '00': 'government',         // State governments
  '01': 'government',         // County governments
  '02': 'government',         // City/township governments
  '04': 'government',         // Special district governments
  '05': 'government',         // Independent school districts
  '06': 'government',         // Public higher education institutions
  '07': 'government',         // Native American tribal governments
  '11': 'government',         // Native American tribal orgs
  '20': 'government',         // Public housing authorities
  '99': 'other',              // Others
}

interface GrantsGovOpp {
  id: string
  number: string
  title: string
  agencyCode: string
  agencyName?: string
  openDate: string
  closeDate: string
  oppStatus: string
  docType: string
  alnist?: string[]
}

interface GrantsGovDetail {
  id: string
  number: string
  title: string
  agencyCode: string
  agencyName?: string
  openDate: string
  closeDate: string
  oppStatus: string
  description?: string
  eligibilityCodes?: string
  fundingCategories?: string
  awardCeiling?: number
  awardFloor?: number
  estimatedTotalProgramFunding?: number
  expectedNumberOfAwards?: number
  applicantTypes?: string[]
  cfdaList?: Array<{ cfdaNum: string; programTitle: string }>
  closeDateExplanation?: string
  additionalInformationUrl?: string
  grantsGovUrl?: string
}

export async function fetchGrantsGov(): Promise<{
  fetched: number
  newOpportunities: number
  updatedOpportunities: number
  errors: string[]
}> {
  const supabase = createAdminClient()
  const results = {
    fetched: 0,
    newOpportunities: 0,
    updatedOpportunities: 0,
    errors: [] as string[],
  }

  // Ensure we have a "Grants.gov" funder record
  const funderId = await ensureGrantsGovFunder(supabase)
  if (!funderId) {
    results.errors.push('Failed to create/find Grants.gov funder record')
    return results
  }

  // Fetch focus area IDs for mapping
  const { data: focusAreas } = await supabase
    .from('focus_areas')
    .select('id, slug')

  const focusAreaMap = new Map<string, string>()
  for (const fa of focusAreas ?? []) {
    focusAreaMap.set(fa.slug, fa.id)
  }

  // Search for posted (open) opportunities across key nonprofit-relevant categories
  const categoriesToFetch = [
    'ED',   // Education
    'HL',   // Health
    'ENV',  // Environment
    'CD',   // Community Development
    'ACA',  // Arts
    'HO',   // Housing
    'FN',   // Food and Nutrition
    'IIJ',  // Income Security / Social Services
    'ISS',  // International
    'HU',   // Humanities
    'ELT',  // Employment, Labor, Training
    'ST',   // Science and Technology
  ]

  for (const category of categoriesToFetch) {
    try {
      console.log(`[Grants.gov] Fetching category: ${category}`)

      const body = {
        keyword: '',
        oppNum: '',
        eligibilities: '12|13', // Nonprofits (501c3 and non-501c3)
        agencies: '',
        oppStatuses: 'posted',  // Only open opportunities
        aln: '',
        fundingCategories: category,
        rows: 100,              // Max per category
        startRecordNum: 0,
      }

      const response = await fetch(GRANTS_GOV_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        results.errors.push(`Grants.gov category ${category}: HTTP ${response.status}`)
        continue
      }

      const json = await response.json()
      const hits: GrantsGovOpp[] = json?.data?.oppHits ?? []
      results.fetched += hits.length

      console.log(`[Grants.gov] Found ${hits.length} opportunities in category ${category}`)

      // Get existing opportunities for this funder to check for duplicates
      const { data: existing } = await supabase
        .from('opportunities')
        .select('id, slug, title, source_hash, source_url')
        .eq('funder_id', funderId)

      const existingArr = existing ?? []
      const existingBySourceUrl = new Map<string, (typeof existingArr)[number]>()
      for (const e of existingArr) {
        if (e.source_url) existingBySourceUrl.set(e.source_url, e)
      }

      for (const hit of hits) {
        try {
          const sourceUrl = `https://www.grants.gov/search-results-detail/${hit.id}`
          const contentHash = crypto.createHash('md5')
            .update(JSON.stringify({ title: hit.title, closeDate: hit.closeDate, status: hit.oppStatus }))
            .digest('hex')

          // Check if we already have this one
          const existingOpp = existingBySourceUrl.get(sourceUrl)

          if (existingOpp) {
            // Update if changed
            if (existingOpp.source_hash !== contentHash) {
              const status = mapStatus(hit.oppStatus, hit.closeDate)
              await supabase
                .from('opportunities')
                .update({
                  status,
                  deadline_date: parseGrantsGovDate(hit.closeDate),
                  deadline_display: hit.closeDate || 'Not specified',
                  source_hash: contentHash,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingOpp.id)
              results.updatedOpportunities++
            }
            continue
          }

          // Fetch detailed info for new opportunities
          const detail = await fetchOpportunityDetail(hit.id)

          const deadlineDate = parseGrantsGovDate(hit.closeDate)
          const status = mapStatus(hit.oppStatus, hit.closeDate)

          // Map funding category to focus areas
          const focusSlugs = CATEGORY_TO_FOCUS_AREA[category] ?? ['community-development']
          const focusAreaIds = focusSlugs
            .map(slug => focusAreaMap.get(slug))
            .filter((id): id is string => !!id)

          // Parse amounts
          const awardFloor = detail?.awardFloor ?? null
          const awardCeiling = detail?.awardCeiling ?? null
          const amountDisplay = formatAmountDisplay(awardFloor, awardCeiling)

          // Parse eligible org types
          const orgTypes = parseEligibilityCodes(detail?.eligibilityCodes)

          // Build slug
          const slug = generateSlug('grants-gov', hit.title)

          // Insert opportunity
          const { error: insertError } = await supabase
            .from('opportunities')
            .insert({
              slug,
              title: hit.title,
              funder_id: funderId,
              opportunity_type: 'grant' as const,
              status,
              summary: detail?.description
                ? detail.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500)
                : null,
              description: detail?.description
                ? detail.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
                : null,
              amount_min: awardFloor ? awardFloor * 100 : null,  // Convert to cents
              amount_max: awardCeiling ? awardCeiling * 100 : null,
              amount_exact: null,
              amount_display: amountDisplay,
              deadline_type: deadlineDate ? 'fixed' : 'unknown',
              deadline_date: deadlineDate,
              deadline_display: hit.closeDate || 'Not specified',
              eligible_org_types: orgTypes,
              eligible_geography: ['US'],
              eligible_populations: [],
              geo_scope_display: 'United States',
              application_url: sourceUrl,
              application_complexity: 'moderate',
              source_url: sourceUrl,
              source_hash: contentHash,
              is_featured: false,
              is_verified: true,  // Official government data
              num_awards: detail?.expectedNumberOfAwards ?? null,
              total_pool: detail?.estimatedTotalProgramFunding
                ? detail.estimatedTotalProgramFunding * 100
                : null,
            })

          if (insertError) {
            // Slug collision — skip silently
            if (insertError.code === '23505') continue
            results.errors.push(`Insert error for "${hit.title}": ${insertError.message}`)
            continue
          }

          results.newOpportunities++

          // Link focus areas
          if (focusAreaIds.length > 0) {
            const { data: newOpp } = await supabase
              .from('opportunities')
              .select('id')
              .eq('slug', slug)
              .single()

            if (newOpp) {
              await supabase
                .from('opportunity_focus_areas')
                .insert(
                  focusAreaIds.map(faId => ({
                    opportunity_id: newOpp.id,
                    focus_area_id: faId,
                  }))
                )
            }
          }

          console.log(`[Grants.gov] New: ${hit.title}`)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          results.errors.push(`Error processing "${hit.title}": ${msg}`)
        }
      }

      // Rate limiting — be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.errors.push(`Category ${category}: ${msg}`)
    }
  }

  return results
}

/**
 * Fetch detailed info for a single opportunity from Grants.gov.
 */
async function fetchOpportunityDetail(oppId: string): Promise<GrantsGovDetail | null> {
  try {
    const response = await fetch(`${FETCH_OPPORTUNITY_API}/${oppId}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) return null

    const json = await response.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

/**
 * Ensure we have a funder record for Grants.gov.
 */
async function ensureGrantsGovFunder(supabase: ReturnType<typeof createAdminClient>): Promise<string | null> {
  // Check if it exists
  const { data: existing } = await supabase
    .from('funders')
    .select('id')
    .eq('slug', 'grants-gov')
    .single()

  if (existing) return existing.id

  // Create it
  const { data: created, error } = await supabase
    .from('funders')
    .insert({
      slug: 'grants-gov',
      name: 'Grants.gov (Federal)',
      funder_type: 'government_federal',
      description: 'The official U.S. government portal for federal grants. Grants.gov centralizes over 1,000 grant programs from 26 federal agencies.',
      website_url: 'https://www.grants.gov',
      headquarters: 'Washington, DC',
      country_code: 'US',
      is_verified: true,
      scrape_url: 'https://api.grants.gov/v1/api/search2',
      scrape_config: { type: 'api' },
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Grants.gov] Failed to create funder:', error.message)
    return null
  }

  return created?.id ?? null
}

/**
 * Map Grants.gov status to our status enum.
 */
function mapStatus(oppStatus: string, closeDate: string): string {
  if (oppStatus === 'closed' || oppStatus === 'archived') return 'closed'
  if (oppStatus === 'forecasted') return 'upcoming'

  // Check if closing soon (within 14 days)
  if (closeDate) {
    const deadline = parseGrantsGovDate(closeDate)
    if (deadline) {
      const daysLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      if (daysLeft <= 14 && daysLeft > 0) return 'closing_soon'
      if (daysLeft <= 0) return 'closed'
    }
  }

  return 'open'
}

/**
 * Parse Grants.gov date format (MM/DD/YYYY) to ISO date string.
 */
function parseGrantsGovDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null

  // Try MM/DD/YYYY format
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (match) {
    const [, month, day, year] = match
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Try ISO format
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  } catch { /* ignore */ }

  return null
}

/**
 * Format amount display string from floor/ceiling.
 */
function formatAmountDisplay(floor: number | null, ceiling: number | null): string {
  if (floor && ceiling && floor !== ceiling) {
    return `$${formatNum(floor)} – $${formatNum(ceiling)}`
  }
  if (ceiling) return `Up to $${formatNum(ceiling)}`
  if (floor) return `From $${formatNum(floor)}`
  return 'Varies'
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`
  return n.toLocaleString()
}

/**
 * Parse eligibility codes string to our org types.
 */
function parseEligibilityCodes(codes: string | null | undefined): string[] {
  if (!codes) return ['501c3']
  const types = new Set<string>()
  for (const code of codes.split('|').map(c => c.trim())) {
    const mapped = ELIGIBILITY_TO_ORG_TYPE[code]
    if (mapped) types.add(mapped)
  }
  return types.size > 0 ? Array.from(types) : ['501c3']
}

/**
 * Generate a URL-friendly slug.
 */
function generateSlug(prefix: string, title: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/-$/, '')

  return `${prefix}-${titleSlug}`
}
