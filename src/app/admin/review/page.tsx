import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { ReviewActions } from '@/components/admin/review-actions'
import { OPPORTUNITY_TYPE_LABELS, FUNDER_TYPE_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { Shield, Clock, DollarSign, MapPin, ExternalLink } from 'lucide-react'
import type { OpportunityType, FunderType } from '@/types/opportunity'

export const metadata: Metadata = {
  title: 'Review Submissions',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface ReviewPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function AdminReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams
  const token = params.token
  const adminSecret = process.env.ADMIN_SECRET

  if (!token || !adminSecret || token !== adminSecret) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">Unauthorized</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  const supabase = createAdminClient()

  // Fetch pending opportunities with funder info
  const { data: pendingOpportunities, error } = await supabase
    .from('opportunities')
    .select(`
      id, slug, title, summary, description, opportunity_type, status,
      amount_min, amount_max, amount_display,
      deadline_type, deadline_date, deadline_display,
      eligible_org_types, eligible_geography, eligible_populations,
      eligibility_summary, geo_scope_display, application_url,
      created_at, funder_id,
      funders ( id, name, slug, funder_type, website_url, contact_email, description ),
      opportunity_focus_areas ( focus_areas ( name, slug ) )
    `)
    .eq('is_verified', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending submissions:', error)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600">Error loading submissions. Please try again.</p>
      </div>
    )
  }

  const submissions = pendingOpportunities ?? []

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Review Submissions</h1>
          <p className="text-muted-foreground">
            {submissions.length === 0
              ? 'All caught up! No submissions to review.'
              : `${submissions.length} pending submission${submissions.length === 1 ? '' : 's'} to review.`}
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-12 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">All Caught Up!</h2>
            <p className="text-muted-foreground">No pending submissions to review right now.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((opp) => {
              const funder = opp.funders as unknown as {
                id: string
                name: string
                slug: string
                funder_type: string
                website_url: string | null
                contact_email: string | null
                description: string | null
              } | null
              const ofas = opp.opportunity_focus_areas as unknown as Array<{
                focus_areas: { name: string; slug: string } | null
              }>
              const focusAreas = (ofas ?? [])
                .map((ofa) => ofa.focus_areas?.name)
                .filter(Boolean) as string[]

              return (
                <div
                  key={opp.id}
                  className="rounded-xl border border-border/60 bg-card p-6 shadow-sm"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{opp.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        by{' '}
                        <span className="font-medium text-foreground">
                          {funder?.name ?? 'Unknown Funder'}
                        </span>
                        {funder?.funder_type && (
                          <span className="ml-1 text-muted-foreground">
                            ({FUNDER_TYPE_LABELS[funder.funder_type as FunderType] ?? funder.funder_type})
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      Pending Review
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type as OpportunityType] ?? opp.opportunity_type}
                    </span>
                    {(opp.amount_min || opp.amount_max) && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        {opp.amount_display ||
                          (opp.amount_min && opp.amount_max
                            ? `${formatCurrency(opp.amount_min)} - ${formatCurrency(opp.amount_max)}`
                            : formatCurrency(opp.amount_max ?? opp.amount_min))}
                      </span>
                    )}
                    {opp.geo_scope_display && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {opp.geo_scope_display}
                      </span>
                    )}
                    {opp.deadline_display && (
                      <span>Deadline: {opp.deadline_display}</span>
                    )}
                  </div>

                  {/* Summary */}
                  {opp.summary && (
                    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                      {opp.summary}
                    </p>
                  )}

                  {/* Description */}
                  {opp.description && (
                    <div className="mb-4 rounded-lg bg-muted/50 p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Full Description:</p>
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {opp.description}
                      </p>
                    </div>
                  )}

                  {/* Eligibility */}
                  {opp.eligibility_summary && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Eligibility:</p>
                      <p className="text-sm text-muted-foreground">{opp.eligibility_summary}</p>
                    </div>
                  )}

                  {/* Focus Areas */}
                  {focusAreas?.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {focusAreas.map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Funder details */}
                  <div className="mb-4 rounded-lg border border-border/40 p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Funder Details</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {funder?.contact_email && (
                        <p>
                          Email:{' '}
                          <a
                            href={`mailto:${funder.contact_email}`}
                            className="text-primary hover:underline"
                          >
                            {funder.contact_email}
                          </a>
                        </p>
                      )}
                      {funder?.website_url && (
                        <p className="flex items-center gap-1">
                          Website:{' '}
                          <a
                            href={funder.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {funder.website_url}
                            <ExternalLink className="ml-0.5 inline h-3 w-3" />
                          </a>
                        </p>
                      )}
                      {funder?.description && (
                        <p>{funder.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Application URL */}
                  {opp.application_url && (
                    <p className="mb-4 text-sm">
                      Application URL:{' '}
                      <a
                        href={opp.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {opp.application_url}
                        <ExternalLink className="ml-0.5 inline h-3 w-3" />
                      </a>
                    </p>
                  )}

                  {/* Submitted date */}
                  <p className="mb-4 text-xs text-muted-foreground">
                    Submitted {new Date(opp.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>

                  {/* Actions */}
                  <ReviewActions
                    opportunityId={opp.id}
                    funderId={opp.funder_id}
                    token={token}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
