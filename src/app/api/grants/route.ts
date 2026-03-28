import { NextRequest, NextResponse } from 'next/server'
import { searchOpportunities } from '@/lib/data'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(request)
  const { success, remaining, resetAt } = checkRateLimit(ip, {
    max: 30,
    windowSeconds: 60,
  })

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }

  const params = request.nextUrl.searchParams

  // Parse query parameters
  const q = params.get('q') || undefined
  const types = params.get('type')?.split(',').filter(Boolean) || undefined
  const focusAreas = params.get('focus_area')?.split(',').filter(Boolean) || undefined
  const deadline = params.get('deadline') || undefined
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(params.get('limit') || '20', 10) || 20))

  // Amounts: API accepts dollars, internal uses cents
  const amountMinParam = params.get('amount_min')
  const amountMaxParam = params.get('amount_max')
  const amountMin = amountMinParam ? Math.round(parseFloat(amountMinParam) * 100) : undefined
  const amountMax = amountMaxParam ? Math.round(parseFloat(amountMaxParam) * 100) : undefined

  const { opportunities, totalCount, page: resultPage, pageSize } = await searchOpportunities({
    q,
    types,
    focusAreas,
    amountMin,
    amountMax,
    deadline,
    page,
    pageSize: limit,
    sort: 'relevance',
  })

  // Transform for API response — convert cents to dollars, clean fields
  const grants = opportunities.map((opp) => ({
    title: opp.title,
    slug: opp.slug,
    summary: opp.summary,
    type: opp.opportunity_type,
    status: opp.status,
    amount_min: opp.amount_min != null ? opp.amount_min / 100 : null,
    amount_max: opp.amount_max != null ? opp.amount_max / 100 : null,
    amount_exact: opp.amount_exact != null ? opp.amount_exact / 100 : null,
    amount_display: opp.amount_display,
    deadline_date: opp.deadline_date,
    deadline_display: opp.deadline_display,
    deadline_type: opp.deadline_type,
    funder_name: opp.funder_name,
    funder_slug: opp.funder_slug,
    focus_areas: opp.focus_area_names,
    geography: opp.geo_scope_display,
    url: `https://grantlink.org/opportunity/${opp.slug}`,
  }))

  return NextResponse.json(
    {
      grants,
      total: totalCount,
      page: resultPage,
      limit: pageSize,
      has_more: resultPage * pageSize < totalCount,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
        'X-RateLimit-Remaining': String(remaining),
      },
    }
  )
}
