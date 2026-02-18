import { notFound } from 'next/navigation'
import Link from 'next/link'
import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import { GrantAlertCTA } from '@/components/opportunity/grant-alert-cta'
import { searchOpportunities } from '@/lib/data'
import { FOCUS_AREAS } from '@/lib/constants'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const area = FOCUS_AREAS.find((a) => a.slug === slug)
  if (!area) return {}

  const title = `Grants for ${area.name}`
  const description = `Discover grants, fellowships, and funding opportunities for ${area.name.toLowerCase()}. Browse open opportunities from foundations, corporations, and government agencies.`
  const url = `https://grantlink.org/grants-for/${slug}`

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

export default async function GrantsForPage({ params }: PageProps) {
  const { slug } = await params
  const area = FOCUS_AREAS.find((a) => a.slug === slug)
  if (!area) notFound()

  const { opportunities, totalCount } = await searchOpportunities({
    focusAreas: [slug],
    page: 1,
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Grants for ${area.name}`,
    description: `Funding opportunities focused on ${area.name.toLowerCase()}`,
    url: `https://grantlink.org/grants-for/${slug}`,
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
          Grants for {area.name}
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          Discover {totalCount.toLocaleString()} funding opportunit{totalCount === 1 ? 'y' : 'ies'} focused on{' '}
          {area.name.toLowerCase()} from foundations, corporations, and government agencies.
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
            No open opportunities in this category right now.
          </p>
        </div>
      )}

      {totalCount > 12 && (
        <div className="mt-6 text-center">
          <Link
            href={`/search?focusAreas=${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
          >
            View all {totalCount.toLocaleString()} opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Other focus areas */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Explore Other Focus Areas</h2>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.filter((a) => a.slug !== slug).map((a) => (
            <Link
              key={a.slug}
              href={`/grants-for/${a.slug}`}
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {a.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Alert CTA */}
      <section className="mt-8">
        <GrantAlertCTA focusAreaSlugs={[slug]} />
      </section>
    </div>
  )
}
