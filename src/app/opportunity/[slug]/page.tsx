import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DeadlineBadge } from '@/components/opportunity/deadline-badge'
import { FitAssessment } from '@/components/opportunity/fit-assessment'
import { GrantAlertCTA } from '@/components/opportunity/grant-alert-cta'
import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import { AddToCalendar } from '@/components/opportunity/add-to-calendar'
import { getOpportunityBySlug, searchOpportunities } from '@/lib/data'
import { formatAmountRange, isFirstTimeFriendly } from '@/lib/utils'
import {
  OPPORTUNITY_TYPE_LABELS,
  FUNDER_TYPE_LABELS,
  COMPLEXITY_LABELS,
  ORG_TYPE_OPTIONS,
  POPULATION_OPTIONS,
} from '@/lib/constants'
import {
  ArrowLeft,
  ExternalLink,
  Building2,
  DollarSign,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  FileText,
  Calendar,
  Globe,
} from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const opp = await getOpportunityBySlug(slug)
  if (!opp) return {}

  const description = opp.summary || `${opp.title} from ${opp.funder_name}`
  const url = `https://grantlink.org/opportunity/${slug}`

  return {
    title: opp.title,
    description,
    openGraph: {
      title: `${opp.title} | GrantLink`,
      description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${opp.title} | GrantLink`,
      description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function OpportunityPage({ params }: PageProps) {
  const { slug } = await params
  const opp = await getOpportunityBySlug(slug)
  if (!opp) notFound()

  const amount = formatAmountRange(opp.amount_min, opp.amount_max, opp.amount_exact, opp.amount_display)

  // Fetch similar opportunities (same focus areas)
  const { opportunities: similar } = await searchOpportunities({
    focusAreas: opp.focus_area_slugs.slice(0, 2),
  })
  const similarFiltered = similar.filter((s) => s.id !== opp.id).slice(0, 3)

  const orgTypeLabels = (opp.eligible_org_types || []).map(
    (t) => ORG_TYPE_OPTIONS.find((o) => o.value === t)?.label || t
  )

  const populationLabels = (opp.eligible_populations || []).map(
    (p) => POPULATION_OPTIONS.find((o) => o.value === p)?.label || p
  )

  // JSON-LD structured data for search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MonetaryGrant',
    name: opp.title,
    description: opp.summary || opp.description,
    url: `https://grantlink.org/opportunity/${slug}`,
    funder: opp.funder_name
      ? {
          '@type': 'Organization',
          name: opp.funder_name,
        }
      : undefined,
    ...(opp.amount_max
      ? {
          amount: {
            '@type': 'MonetaryAmount',
            currency: 'USD',
            maxValue: opp.amount_max / 100,
            ...(opp.amount_min ? { minValue: opp.amount_min / 100 } : {}),
          },
        }
      : {}),
    ...(opp.deadline_date ? { applicationDeadline: opp.deadline_date } : {}),
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/search" className="transition-colors hover:text-foreground">
          Search
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{opp.title}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type]}
              </Badge>
              <DeadlineBadge
                deadlineDate={opp.deadline_date}
                deadlineType={opp.deadline_type}
                deadlineDisplay={opp.deadline_display}
              />
              {isFirstTimeFriendly(opp) && (
                <Badge className="bg-violet-50 text-violet-700 hover:bg-violet-50">
                  Good for First-Time Applicants
                </Badge>
              )}
              {opp.is_featured && (
                <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50">
                  Featured
                </Badge>
              )}
            </div>

            <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
              {opp.title}
            </h1>

            {opp.funder_name && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {opp.funder_slug ? (
                  <Link href={`/funder/${opp.funder_slug}`} className="transition-colors hover:text-foreground hover:underline">
                    {opp.funder_name}
                  </Link>
                ) : (
                  opp.funder_name
                )}
                {opp.funder_type && (
                  <span className="text-xs">
                    ({FUNDER_TYPE_LABELS[opp.funder_type]})
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Key facts cards */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                Amount
              </div>
              <p className="text-sm font-semibold text-foreground">{amount}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Deadline
              </div>
              <p className="text-sm font-semibold text-foreground">
                {opp.deadline_display || 'TBD'}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Geography
              </div>
              <p className="text-sm font-semibold text-foreground">
                {opp.geo_scope_display || 'Not specified'}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Complexity
              </div>
              <p className="text-sm font-semibold text-foreground">
                {COMPLEXITY_LABELS[opp.application_complexity]}
              </p>
            </div>
          </div>

          {/* Description */}
          {opp.summary && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">About This Opportunity</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{opp.summary}</p>
              {opp.description && (
                <div className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {opp.description}
                </div>
              )}
            </section>
          )}

          <Separator className="my-8" />

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Eligibility</h2>
            <div className="space-y-4">
              {orgTypeLabels.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Eligible Organization Types
                  </h3>
                  <div className="flex flex-wrap gap-2 pl-6">
                    {orgTypeLabels.map((label) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {populationLabels.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Target Populations
                  </h3>
                  <div className="flex flex-wrap gap-2 pl-6">
                    {populationLabels.map((label) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {opp.eligible_geography && opp.eligible_geography.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Globe className="h-4 w-4 text-primary" />
                    Geographic Eligibility
                  </h3>
                  <div className="flex flex-wrap gap-2 pl-6">
                    {opp.eligible_geography.map((geo) => (
                      <Badge key={geo} variant="outline" className="text-xs">
                        {geo}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {opp.eligibility_summary && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Additional Requirements
                  </h3>
                  <p className="pl-6 text-sm text-muted-foreground">{opp.eligibility_summary}</p>
                </div>
              )}

              {opp.requires_loi && (
                <div className="pl-6">
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                    Letter of Intent required
                  </Badge>
                </div>
              )}
              {opp.requires_fiscal_sponsor && (
                <div className="pl-6">
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                    Fiscal sponsor accepted
                  </Badge>
                </div>
              )}
            </div>
          </section>

          {/* Focus Areas */}
          {opp.focus_area_names.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Focus Areas</h2>
              <div className="flex flex-wrap gap-2">
                {opp.focus_area_names.map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Additional details */}
          {(opp.num_awards || opp.cycle_frequency) && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Additional Details</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                {opp.num_awards && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Number of awards: {opp.num_awards}</span>
                  </div>
                )}
                {opp.cycle_frequency && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Funding cycle: {opp.cycle_frequency}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-80">
          <div className="sticky top-20 space-y-4">
            {/* Apply CTA */}
            {opp.application_url && (
              <Button asChild size="lg" className="w-full text-base">
                <a href={opp.application_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Apply Now
                </a>
              </Button>
            )}

            {/* Add to Calendar */}
            {opp.deadline_date && (
              <div className="flex justify-center">
                <AddToCalendar
                  title={opp.title}
                  deadlineDate={opp.deadline_date}
                  applicationUrl={opp.application_url}
                  funderName={opp.funder_name}
                />
              </div>
            )}

            {/* Fit Assessment */}
            <FitAssessment
              eligibleOrgTypes={opp.eligible_org_types}
              eligibleGeography={opp.eligible_geography}
              eligiblePopulations={opp.eligible_populations}
              amountMin={opp.amount_min}
              amountMax={opp.amount_max}
              applicationComplexity={opp.application_complexity}
            />

            {/* Funder info card */}
            {opp.funder && (
              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-foreground">About the Funder</h3>
                <div className="space-y-2.5">
                  <p className="text-base font-semibold text-foreground">
                    <Link href={`/funder/${opp.funder.slug}`} className="transition-colors hover:text-primary">
                      {opp.funder.name}
                    </Link>
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {FUNDER_TYPE_LABELS[opp.funder.funder_type]}
                  </Badge>
                  {opp.funder.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
                      {opp.funder.description}
                    </p>
                  )}
                  {opp.funder.headquarters && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {opp.funder.headquarters}
                    </p>
                  )}
                  {opp.funder.website_url && (
                    <a
                      href={opp.funder.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Back to search */}
            <Link
              href="/search"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to search
            </Link>
          </div>
        </aside>
      </div>

      {/* Similar opportunities */}
      {similarFiltered.length > 0 && (
        <section className="mt-16">
          <Separator className="mb-8" />
          <h2 className="mb-6 text-xl font-bold text-foreground">Similar Opportunities</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {similarFiltered.map((s) => (
              <OpportunityCard key={s.id} opportunity={s} />
            ))}
          </div>
        </section>
      )}

      {/* Grant Alert CTA */}
      <section className="mt-8">
        <GrantAlertCTA focusAreaSlugs={opp.focus_area_slugs} />
      </section>
    </div>
  )
}
