#!/usr/bin/env node

/**
 * Add scrape URLs to existing funders and insert new funders with public grant pages.
 *
 * These are all PRIMARY SOURCES — the actual funder websites where grants are
 * publicly listed. No scraped competitor data.
 *
 * Run: node scripts/add-scrape-sources.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
}

// ─── EXISTING FUNDERS: Add scrape URLs ───────────────────────────────

const EXISTING_FUNDER_SCRAPE_URLS = [
  {
    slug: 'ford-foundation',
    scrape_url: 'https://www.fordfoundation.org/work/our-grants/',
  },
  {
    slug: 'macarthur-foundation',
    scrape_url: 'https://www.macfound.org/programs/',
  },
  {
    slug: 'rwjf',
    scrape_url: 'https://www.rwjf.org/en/grants/funding-opportunities.html',
  },
  {
    slug: 'kresge-foundation',
    scrape_url: 'https://kresge.org/grants-social-investments/',
  },
  {
    slug: 'knight-foundation',
    scrape_url: 'https://knightfoundation.org/apply/',
  },
  {
    slug: 'nea',
    scrape_url: 'https://www.arts.gov/grants',
  },
  {
    slug: 'nsf',
    scrape_url: 'https://new.nsf.gov/funding/opportunities',
  },
  {
    slug: 'usaid',
    scrape_url: 'https://www.usaid.gov/work-usaid/find-a-funding-opportunity',
  },
  {
    slug: 'echoing-green',
    scrape_url: 'https://echoinggreen.org/fellowship/',
  },
  {
    slug: 'ashoka',
    scrape_url: 'https://www.ashoka.org/en-us/program/ashoka-fellowship',
  },
  {
    slug: 'skoll-foundation',
    scrape_url: 'https://skoll.org/about/skoll-awards/',
  },
  {
    slug: 'patagonia',
    scrape_url: 'https://www.patagonia.com/how-we-fund/',
  },
  {
    slug: 'google-org',
    scrape_url: 'https://www.google.org/our-work/',
  },
  {
    slug: 'bank-of-america',
    scrape_url: 'https://about.bankofamerica.com/en/making-an-impact/charitable-foundation-funding',
  },
  {
    slug: 'cummings-foundation',
    scrape_url: 'https://www.cummingsfoundation.org/grants/grant-programs.html',
  },
]

// ─── NEW FUNDERS: Foundations and public funders not yet in the DB ────

const NEW_FUNDERS = [
  // Federal agencies (their grants are also on Grants.gov but we want the funder records)
  {
    slug: 'hhs',
    name: 'U.S. Department of Health and Human Services',
    funder_type: 'government_federal',
    description: 'The principal federal agency for protecting the health of all Americans and providing essential human services.',
    website_url: 'https://www.hhs.gov',
    headquarters: 'Washington, DC',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.hhs.gov/grants/index.html',
  },
  {
    slug: 'usda',
    name: 'U.S. Department of Agriculture',
    funder_type: 'government_federal',
    description: 'Provides grants for rural development, agriculture research, food programs, and conservation.',
    website_url: 'https://www.usda.gov',
    headquarters: 'Washington, DC',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.usda.gov/topics/farming/grants-and-loans',
  },
  {
    slug: 'epa',
    name: 'Environmental Protection Agency',
    funder_type: 'government_federal',
    description: 'Offers grants for environmental education, pollution prevention, and environmental justice.',
    website_url: 'https://www.epa.gov',
    headquarters: 'Washington, DC',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.epa.gov/grants',
  },
  {
    slug: 'ed-gov',
    name: 'U.S. Department of Education',
    funder_type: 'government_federal',
    description: 'The primary federal agency for administering and coordinating federal education assistance.',
    website_url: 'https://www.ed.gov',
    headquarters: 'Washington, DC',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www2.ed.gov/fund/grants-apply.html',
  },
  {
    slug: 'neh',
    name: 'National Endowment for the Humanities',
    funder_type: 'government_federal',
    description: 'An independent federal agency supporting research, education, preservation, and public programs in the humanities.',
    website_url: 'https://www.neh.gov',
    headquarters: 'Washington, DC',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.neh.gov/grants',
  },
  {
    slug: 'imls',
    name: 'Institute of Museum and Library Services',
    funder_type: 'government_federal',
    description: 'The primary federal agency supporting the nation\'s museums and libraries.',
    website_url: 'https://www.imls.gov',
    headquarters: 'Washington, DC',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.imls.gov/grants/available',
  },
  // Major private foundations
  {
    slug: 'hewlett-foundation',
    name: 'William and Flora Hewlett Foundation',
    funder_type: 'private_foundation',
    description: 'Makes grants to address the most serious social and environmental problems, including education, environment, and performing arts.',
    website_url: 'https://hewlett.org',
    headquarters: 'Menlo Park, CA',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://hewlett.org/grants/',
  },
  {
    slug: 'packard-foundation',
    name: 'David and Lucile Packard Foundation',
    funder_type: 'private_foundation',
    description: 'Works on improving the lives of children, enabling the creative pursuit of science, advancing reproductive health, and conserving and restoring earth\'s natural systems.',
    website_url: 'https://www.packard.org',
    headquarters: 'Los Altos, CA',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.packard.org/grants-and-investments/for-grantseekers/',
  },
  {
    slug: 'moore-foundation',
    name: 'Gordon and Betty Moore Foundation',
    funder_type: 'private_foundation',
    description: 'Fosters path-breaking scientific discovery, environmental conservation, patient care improvements, and preservation of the Bay Area.',
    website_url: 'https://www.moore.org',
    headquarters: 'Palo Alto, CA',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.moore.org/grants',
  },
  {
    slug: 'mellon-foundation',
    name: 'Andrew W. Mellon Foundation',
    funder_type: 'private_foundation',
    description: 'The largest funder of arts and culture, higher education, and humanities in the United States.',
    website_url: 'https://www.mellon.org',
    headquarters: 'New York, NY',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.mellon.org/grant-programs',
  },
  {
    slug: 'walton-foundation',
    name: 'Walton Family Foundation',
    funder_type: 'private_foundation',
    description: 'Works in K-12 education, environment, and community building in the Arkansas-Mississippi Delta and Northwest Arkansas.',
    website_url: 'https://www.waltonfamilyfoundation.org',
    headquarters: 'Bentonville, AR',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.waltonfamilyfoundation.org/grants',
  },
  {
    slug: 'casey-foundation',
    name: 'Annie E. Casey Foundation',
    funder_type: 'private_foundation',
    description: 'Focuses on building better futures for children and families through grants, research, and direct community investments.',
    website_url: 'https://www.aecf.org',
    headquarters: 'Baltimore, MD',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.aecf.org/work/grant-making',
  },
  {
    slug: 'lumina-foundation',
    name: 'Lumina Foundation',
    funder_type: 'private_foundation',
    description: 'Committed to making opportunities for learning beyond high school available to all.',
    website_url: 'https://www.luminafoundation.org',
    headquarters: 'Indianapolis, IN',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.luminafoundation.org/our-grants/',
  },
  {
    slug: 'surdna-foundation',
    name: 'Surdna Foundation',
    funder_type: 'private_foundation',
    description: 'Seeks to foster just and sustainable communities through grants focused on inclusive economies, thriving cultures, and sustainable environments.',
    website_url: 'https://surdna.org',
    headquarters: 'New York, NY',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://surdna.org/grants/',
  },
  // Corporate giving programs
  {
    slug: 'target-foundation',
    name: 'Target Foundation',
    funder_type: 'corporate',
    description: 'Invests in communities through grants focused on equity and inclusion, education, and basic needs.',
    website_url: 'https://corporate.target.com/sustainability-ESG/communities',
    headquarters: 'Minneapolis, MN',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://corporate.target.com/sustainability-ESG/communities/target-foundation',
  },
  {
    slug: 'walmart-foundation',
    name: 'Walmart Foundation',
    funder_type: 'corporate',
    description: 'Supports workforce development, economic opportunity, and sustainability initiatives in local communities.',
    website_url: 'https://walmart.org',
    headquarters: 'Bentonville, AR',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://walmart.org/how-we-give/local-community-grants',
  },
  {
    slug: 'usaa-foundation',
    name: 'USAA Foundation',
    funder_type: 'corporate',
    description: 'Supports military families through financial education and community strengthening programs.',
    website_url: 'https://www.usaa.com/foundation',
    headquarters: 'San Antonio, TX',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://communities.usaa.com/t5/foundation/ct-p/usaa_foundation',
  },
  // Community foundations
  {
    slug: 'new-york-cf',
    name: 'New York Community Trust',
    funder_type: 'community_foundation',
    description: 'One of the largest community foundations in the U.S., making grants to nonprofits in the New York City area.',
    website_url: 'https://www.nycommunitytrust.org',
    headquarters: 'New York, NY',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.nycommunitytrust.org/information-for/for-nonprofits/request-a-grant/',
  },
  {
    slug: 'california-cf',
    name: 'California Community Foundation',
    funder_type: 'community_foundation',
    description: 'Leads positive systemic change that strengthens Los Angeles communities through grants and civic engagement.',
    website_url: 'https://www.calfund.org',
    headquarters: 'Los Angeles, CA',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.calfund.org/receive-a-grant/',
  },
  {
    slug: 'cleveland-foundation',
    name: 'Cleveland Foundation',
    funder_type: 'community_foundation',
    description: 'The world\'s first community foundation, supporting nonprofits and civic projects in Greater Cleveland.',
    website_url: 'https://www.clevelandfoundation.org',
    headquarters: 'Cleveland, OH',
    country_code: 'US',
    is_verified: true,
    scrape_url: 'https://www.clevelandfoundation.org/grants/apply-for-a-grant/',
  },
]

async function supabaseRequest(path, method = 'GET', body = null) {
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${path}: ${res.status} ${text}`)
  }
  return res
}

async function run() {
  console.log('\n=== Adding Scrape Sources to GrantLink ===\n')

  // 1. Update existing funders with scrape URLs
  console.log('--- Updating existing funders with scrape URLs ---')
  let updatedCount = 0

  for (const funder of EXISTING_FUNDER_SCRAPE_URLS) {
    try {
      await supabaseRequest(
        `funders?slug=eq.${funder.slug}`,
        'PATCH',
        { scrape_url: funder.scrape_url }
      )
      console.log(`  ✓ ${funder.slug} → ${funder.scrape_url}`)
      updatedCount++
    } catch (err) {
      console.error(`  ✗ ${funder.slug}: ${err.message}`)
    }
  }
  console.log(`  Updated ${updatedCount} existing funders\n`)

  // 2. Insert new funders
  console.log('--- Adding new funders ---')
  let insertedCount = 0

  for (const funder of NEW_FUNDERS) {
    try {
      // Check if slug already exists
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/funders?slug=eq.${funder.slug}&select=id`,
        { headers }
      )
      const existing = await checkRes.json()

      if (existing && existing.length > 0) {
        // Update scrape_url if not set
        await supabaseRequest(
          `funders?slug=eq.${funder.slug}`,
          'PATCH',
          { scrape_url: funder.scrape_url }
        )
        console.log(`  ↻ ${funder.name} (already exists, updated scrape_url)`)
      } else {
        await supabaseRequest('funders', 'POST', funder)
        console.log(`  ✓ ${funder.name}`)
        insertedCount++
      }
    } catch (err) {
      console.error(`  ✗ ${funder.name}: ${err.message}`)
    }
  }
  console.log(`  Added ${insertedCount} new funders\n`)

  console.log('=== Done! ===')
  console.log(`Total funders with scrape URLs: ${updatedCount + insertedCount + NEW_FUNDERS.length}`)
  console.log('\nNext steps:')
  console.log('1. Run the scraper: POST /api/cron/scrape')
  console.log('2. The Grants.gov fetcher will run automatically as part of the daily cron')
}

run().catch(console.error)
