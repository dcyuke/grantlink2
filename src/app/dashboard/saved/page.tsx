import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import { Bookmark, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'
import type { OpportunityListItem } from '@/types/opportunity'

export const metadata: Metadata = {
  title: 'Saved Grants',
  description: 'Your saved and bookmarked grant opportunities.',
}

export default async function SavedGrantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/dashboard/saved')

  // Fetch saved opportunities with full join
  const { data: savedRows, error } = await supabase
    .from('saved_opportunities')
    .select(`
      opportunity_id, remind_before_deadline, created_at,
      opportunities (
        id, slug, title, summary, opportunity_type, status,
        amount_min, amount_max, amount_exact, amount_display,
        deadline_type, deadline_date, deadline_display,
        eligible_org_types, eligible_geography, eligible_populations,
        geo_scope_display, application_url, application_complexity,
        is_featured, is_verified, created_at,
        funders ( name, slug, funder_type, logo_url ),
        opportunity_focus_areas ( focus_areas ( name, slug ) )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch saved error:', error)
  }

  const opportunities: OpportunityListItem[] = (savedRows ?? [])
    .map((row) => {
      const opp = row.opportunities as unknown as Record<string, unknown> | null
      if (!opp) return null

      const funder = opp.funders as Record<string, unknown> | null
      const ofas = (opp.opportunity_focus_areas as unknown as Array<{
        focus_areas: { name: string; slug: string } | null
      }>) ?? []

      return {
        id: opp.id as string,
        slug: opp.slug as string,
        title: opp.title as string,
        summary: opp.summary as string | null,
        opportunity_type: opp.opportunity_type as OpportunityListItem['opportunity_type'],
        status: opp.status as OpportunityListItem['status'],
        amount_min: opp.amount_min as number | null,
        amount_max: opp.amount_max as number | null,
        amount_exact: opp.amount_exact as number | null,
        amount_display: opp.amount_display as string | null,
        deadline_type: opp.deadline_type as OpportunityListItem['deadline_type'],
        deadline_date: opp.deadline_date as string | null,
        deadline_display: opp.deadline_display as string | null,
        eligible_org_types: opp.eligible_org_types as string[] | null,
        eligible_geography: opp.eligible_geography as string[] | null,
        eligible_populations: opp.eligible_populations as string[] | null,
        geo_scope_display: opp.geo_scope_display as string | null,
        application_url: opp.application_url as string | null,
        application_complexity: opp.application_complexity as OpportunityListItem['application_complexity'],
        is_featured: opp.is_featured as boolean,
        is_verified: opp.is_verified as boolean,
        created_at: opp.created_at as string,
        funder_name: (funder?.name as string) ?? null,
        funder_slug: (funder?.slug as string) ?? null,
        funder_type: (funder?.funder_type as OpportunityListItem['funder_type']) ?? null,
        funder_logo_url: (funder?.logo_url as string) ?? null,
        focus_area_names: ofas.map((ofa) => ofa.focus_areas?.name).filter(Boolean) as string[],
        focus_area_slugs: ofas.map((ofa) => ofa.focus_areas?.slug).filter(Boolean) as string[],
      } satisfies OpportunityListItem
    })
    .filter(Boolean) as OpportunityListItem[]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved Grants</h1>
          <p className="text-sm text-muted-foreground">
            {opportunities.length} saved opportunit{opportunities.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
      </div>

      {opportunities.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Bookmark className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-1 text-lg font-semibold text-foreground">No saved grants yet</h3>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Browse opportunities and click the bookmark icon to save grants you&apos;re interested in.
          </p>
          <Button asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Browse Opportunities
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
