import { notFound } from 'next/navigation'
import Link from 'next/link'
import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import { GrantAlertCTA } from '@/components/opportunity/grant-alert-cta'
import { searchOpportunities } from '@/lib/data'
import { OPPORTUNITY_TYPE_LABELS, FOCUS_AREAS } from '@/lib/constants'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import type { OpportunityType } from '@/types/opportunity'

interface PageProps {
  params: Promise<{ type: string }>
}

const VALID_TYPES = Object.keys(OPPORTUNITY_TYPE_LABELS) as OpportunityType[]

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params
  const label = OPPORTUNITY_TYPE_LABELS[type as OpportunityType]
  if (!label) return {}

  const title = `${label} Opportunities`
  const description = `Browse ${label.toLowerCase()} opportunities on GrantLink. Find open funding from foundations, corporations, and government agencies.`
  const url = `https://grantlink.org/grants-by-type/${type}`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | GrantLink`,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${title} | GrantLink`,
      description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function GrantsByTypePage({ params }: PageProps) {
  const { type } = await params
  const label = OPPORTUNITY_TYPE_LABELS[type as OpportunityType]
  if (!label) notFound()

  const { opportunities, totalCount } = await searchOpportunities({
    types: [type],
    page: 1,
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} Opportunities`,
    description: `${label} funding opportunities on GrantLink`,
    url: `https://grantlink.org/grants-by-type/${type}`,
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="mb-8 rounded-xl bg-primary/5 px-6 py-10 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
          {label} Opportunities
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          Browse {totalCount.toLocaleString()} {label.toLowerCase()} opportunit{totalCount === 1 ? 'y' : 'ies'} from
          foundations, corporations, and government agencies.
        </p>
      </div>

      {/* Results */}
      {opportunities.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No open {label.toLowerCase()} opportunities right now.
          </p>
        </div>
      )}

      {totalCount > 12 && (
        <div className="mt-6 text-center">
          <Link
            href={`/search?types=${type}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
          >
            View all {totalCount.toLocaleString()} opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Browse by focus area */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Browse by Focus Area</h2>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map((area) => (
            <Link
              key={area.slug}
              href={`/grants-for/${area.slug}`}
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {area.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Other types */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Other Funding Types</h2>
        <div className="flex flex-wrap gap-2">
          {VALID_TYPES.filter((t) => t !== type).map((t) => (
            <Link
              key={t}
              href={`/grants-by-type/${t}`}
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {OPPORTUNITY_TYPE_LABELS[t]}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <GrantAlertCTA focusAreaSlugs={[]} />
      </section>
    </div>
  )
}
