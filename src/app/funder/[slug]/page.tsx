import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import { getFunderBySlug } from '@/lib/data'
import { formatCurrency } from '@/lib/utils'
import { FUNDER_TYPE_LABELS } from '@/lib/constants'
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  MapPin,
  DollarSign,
  Mail,
  Globe,
} from 'lucide-react'
import type { Metadata } from 'next'
import type { FunderType } from '@/types/opportunity'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getFunderBySlug(slug)
  if (!result) return {}

  const { funder } = result
  const description = funder.description
    || `Browse grants and funding opportunities from ${funder.name} on GrantLink.`
  const url = `https://grantlink.org/funder/${slug}`

  return {
    title: funder.name,
    description,
    openGraph: {
      title: `${funder.name} | GrantLink`,
      description,
      url,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${funder.name} | GrantLink`,
      description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function FunderPage({ params }: PageProps) {
  const { slug } = await params
  const result = await getFunderBySlug(slug)
  if (!result) notFound()

  const { funder, opportunities } = result

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: funder.name,
    description: funder.description,
    url: funder.website_url || `https://grantlink.org/funder/${slug}`,
    ...(funder.headquarters ? { address: { '@type': 'PostalAddress', addressLocality: funder.headquarters } } : {}),
  }

  return (
    <div className="container mx-auto px-4 py-6">
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
        <span className="truncate text-foreground">{funder.name}</span>
      </nav>

      {/* Funder header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {FUNDER_TYPE_LABELS[funder.funder_type as FunderType] ?? funder.funder_type}
          </Badge>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
          {funder.name}
        </h1>

        {funder.description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {funder.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main: opportunities grid */}
        <div className="min-w-0 flex-1">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {opportunities.length > 0
              ? `${opportunities.length} Funding Opportunit${opportunities.length === 1 ? 'y' : 'ies'}`
              : 'No Current Opportunities'}
          </h2>

          {opportunities.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No open opportunities from this funder right now.
              </p>
              <Link
                href="/search"
                className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary/80"
              >
                Browse all opportunities
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar: funder info card */}
        <aside className="w-full shrink-0 lg:w-72">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Funder Details</h3>
              <div className="space-y-3">
                {funder.headquarters && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{funder.headquarters}</span>
                  </div>
                )}
                {funder.total_giving != null && funder.total_giving > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Giving</p>
                      <p className="font-medium text-foreground">{formatCurrency(funder.total_giving)}</p>
                    </div>
                  </div>
                )}
                {funder.assets != null && funder.assets > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assets</p>
                      <p className="font-medium text-foreground">{formatCurrency(funder.assets)}</p>
                    </div>
                  </div>
                )}
                {funder.website_url && (
                  <div className="flex items-start gap-2 text-sm">
                    <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={funder.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
                    >
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {funder.contact_email && (
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={`mailto:${funder.contact_email}`}
                      className="text-primary hover:text-primary/80"
                    >
                      {funder.contact_email}
                    </a>
                  </div>
                )}
                {funder.ein && (
                  <p className="text-xs text-muted-foreground">
                    EIN: {funder.ein}
                  </p>
                )}
              </div>
            </div>

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
    </div>
  )
}
