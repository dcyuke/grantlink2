import type { Metadata } from 'next'
import { PartnerMatcher } from './partner-matcher'

export const metadata: Metadata = {
  title: 'Funder & Partner Matching | GrantLink',
  description:
    'Find corporate partners, collaborative funds, and intermediary grantmakers aligned with your nonprofit\'s mission. Match your focus areas with funders actively supporting causes like yours.',
  openGraph: {
    title: 'Funder & Partner Matching | GrantLink',
    description:
      'Find corporate partners, collaborative funds, and intermediary grantmakers aligned with your mission.',
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
          aligned with your mission. Filter by focus area and partnership type to find the
          best fit.
        </p>
      </div>

      <PartnerMatcher />
    </div>
  )
}
