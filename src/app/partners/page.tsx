import type { Metadata } from 'next'
import { PartnerMatcher } from './partner-matcher'

export const metadata: Metadata = {
  title: 'Funder & Partner Matching | GrantLink',
  description:
    'Find corporate partners, collaborative funds, and intermediary grantmakers for small and mid-sized nonprofits. Match your focus areas with funders who support organizations like yours.',
  openGraph: {
    title: 'Funder & Partner Matching | GrantLink',
    description:
      'Find corporate partners and grantmakers for small and mid-sized nonprofits.',
    url: 'https://grantlink.org/partners',
  },
}

export default function PartnersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Funder & Partner Matching
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Discover corporate partners, collaborative funds, and intermediary grantmakers
          who work with small and mid-sized nonprofits. Filter by focus area and partnership
          type to find the best fit.
        </p>
      </div>

      <PartnerMatcher />
    </div>
  )
}
