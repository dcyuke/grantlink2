import type { Metadata } from 'next'
import { PartnerMatcher } from './partner-matcher'

export const metadata: Metadata = {
  title: 'Corporate Partner Matching | GrantLink',
  description:
    'Find corporate partners aligned with your nonprofit\'s mission. Match your focus areas with companies actively supporting causes like yours.',
  openGraph: {
    title: 'Corporate Partner Matching | GrantLink',
    description:
      'Find corporate partners aligned with your nonprofit\'s mission.',
    url: 'https://grantlink.org/partners',
  },
}

export default function PartnersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Corporate Partner Matching
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Select your focus areas to discover companies actively investing in causes
          like yours. Each match links directly to the company&apos;s giving page.
        </p>
      </div>

      <PartnerMatcher />
    </div>
  )
}
