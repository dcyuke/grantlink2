import { FOCUS_AREAS } from '@/lib/constants'

export async function GET() {
  const focusSlugs = FOCUS_AREAS.map((fa) => fa.slug).join(', ')

  const body = `# GrantLink

> A free, searchable database of grants, fellowships, and funding opportunities sized for small and mid-sized nonprofits and social enterprises.

## URL
https://grantlink.org

## Pages

- / — Homepage with featured, closing-soon, and recently-added opportunities
- /search — Full search with filters for type, focus area, amount, deadline, geography, org type
- /opportunity/{slug} — Individual opportunity detail (amount, deadline, eligibility, funder info)
- /funder/{slug} — Funder profile with all their listed opportunities
- /grants-for/{focus-area-slug} — Opportunities filtered by focus area
- /grants-by-type/{type} — Opportunities filtered by type (grant, fellowship, prize, etc.)
- /about — About GrantLink
- /submit — Submit a new funding opportunity
- /impact — Impact measurement tools for nonprofits
- /readiness — Grant readiness assessment
- /partners — Corporate partnership matching

## Public API

### Search grants
GET /api/grants

Query parameters:
- q — Text search (searches title, summary, funder name, focus areas, geography)
- type — Opportunity type, comma-separated (grant, fellowship, prize, competition, corporate_giving, impact_investment, scholarship, award, residency, accelerator)
- focus_area — Focus area slug, comma-separated (${focusSlugs})
- amount_min — Minimum funding amount in dollars
- amount_max — Maximum funding amount in dollars
- deadline — Deadline filter (rolling, 30days, 90days, open)
- page — Page number (default: 1)
- limit — Results per page (default: 20, max: 50)

Response: JSON with grants array, total count, page, limit, and has_more flag.

### RSS feed
GET /feed.xml — Atom feed of the 50 most recently added opportunities.

## Data Model

Each opportunity has: title, slug, summary, type, status (open/closing_soon/closed), amount (min/max/exact in dollars), deadline (date or rolling), funder name and type, focus areas, eligible org types, eligible geography, eligible populations, application URL, and complexity rating.

## Opportunity Types
grant, fellowship, prize, competition, corporate_giving, impact_investment, scholarship, award, residency, accelerator

## Focus Areas
${focusSlugs}

## Feeds & Sitemaps
- /feed.xml — Atom feed of new opportunities
- /sitemap.xml — Full sitemap of all pages
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
