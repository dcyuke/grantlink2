import type { Metadata } from 'next'
import { Search, Shield, Heart, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About',
  description:
    'GrantLink helps nonprofit professionals and social entrepreneurs discover funding opportunities.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
          About GrantLink
        </h1>
        <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
          Finding the right funding shouldn&apos;t be the hardest part of doing good.
          GrantLink makes it simple for nonprofits and social entrepreneurs to discover
          opportunities that match their mission.
        </p>

        <div className="mb-16 space-y-12">
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We believe that mission-driven organizations should spend their time creating
              impact, not searching through dozens of websites and databases to find funding.
              GrantLink aggregates opportunities from foundations, corporations, government
              agencies, and impact investors into one clean, searchable platform.
            </p>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">How It Works</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We gather funding opportunities from public sources including foundation websites,
              government grant portals, and corporate giving programs. Every listing links
              directly to the funder&apos;s application page &mdash; no middlemen, no fees.
              Our filters let you narrow by amount, deadline, focus area, population served,
              eligibility requirements, and more.
            </p>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Our Commitment</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Always free to search and browse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Direct links to application pages &mdash; no gateways</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Transparent about our data sources and coverage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Regularly updated opportunity listings</span>
              </li>
            </ul>
          </section>
        </div>

        <section className="mb-16">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Get in Touch</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Have feedback, suggestions, or want to submit a funding opportunity?
              Reach us at{' '}
              <a
                href="mailto:grantlinkfeedback@gmail.com"
                className="font-medium text-primary hover:underline"
              >
                grantlinkfeedback@gmail.com
              </a>. We&apos;d love to hear from you.
            </p>
          </section>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-foreground">Ready to find funding?</h2>
          <p className="mb-4 text-muted-foreground">
            Start exploring thousands of opportunities for your organization.
          </p>
          <Button asChild size="lg">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Browse Opportunities
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
