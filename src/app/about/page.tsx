import type { Metadata } from 'next'
import { Search, Heart, Mail, User, Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About | GrantLink',
  description:
    'GrantLink is the nonprofit back office — find funding, measure impact, and prove your worth, all in one place.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
          About GrantLink
        </h1>
        <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
          The nonprofit back office in a browser. GrantLink brings together grant discovery,
          impact measurement, partner matching, and organizational tools so your team can
          focus on the mission — not the admin.
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
              Small and mid-size nonprofits do extraordinary work with limited resources.
              We believe they deserve professional-grade tools without enterprise-grade
              price tags. GrantLink provides a connected suite of free tools — from funding
              discovery to impact reporting — so that a two-person team can operate like a
              well-staffed back office.
            </p>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">What We Offer</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1 shrink-0 text-primary">•</span>
                <span><strong className="text-foreground">Grant Discovery</strong> — Search thousands of grants, fellowships, prizes, and corporate giving programs. Filter by amount, deadline, focus area, and eligibility.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 shrink-0 text-primary">•</span>
                <span><strong className="text-foreground">Impact Measurement</strong> — Track outputs, outcomes, and impact with expert-informed frameworks for 20 issue areas.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 shrink-0 text-primary">•</span>
                <span><strong className="text-foreground">M&E Plan Builder</strong> — Build a monitoring and evaluation plan in minutes with our guided questionnaire.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 shrink-0 text-primary">•</span>
                <span><strong className="text-foreground">Partner Matcher</strong> — Find corporate funders aligned with your focus areas and partnership style.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 shrink-0 text-primary">•</span>
                <span><strong className="text-foreground">Readiness Assessment</strong> — A quick self-assessment to identify where your org stands for grant applications.</span>
              </li>
            </ul>
          </section>
        </div>

        <section className="mb-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Message from the Creator:{' '}
              <a
                href="https://www.linkedin.com/in/drewyukelson/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Drew Yukelson
              </a>
            </h2>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <p className="mb-4 text-muted-foreground leading-relaxed">
              Stretching every dollar has always been part of nonprofit work, but
              securing the right funding feels more critical than ever. That is why
              I built GrantLink.
            </p>
            <p className="mb-4 text-muted-foreground leading-relaxed">
              For the past four-plus years, I have worked as a strategy consultant
              at{' '}
              <a
                href="https://rocketsocialimpact.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Rocket Social Impact
              </a>
              , building funding strategies with nonprofit teams and designing
              community programs for corporate social impact teams. Before that, I
              worked in tech and managed nonprofit programs. Those experiences shaped
              how I approach practical tools that support mission-driven work.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              GrantLink is designed to be the back office that small nonprofits
              never had — a connected set of tools that help you find funding,
              prove your impact, and stay organized, all in one place.
            </p>
          </div>
        </section>

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
          <h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Ready to get started?</h2>
          <p className="mb-6 text-muted-foreground">
            Set up your organization profile and let every tool work for you.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/organization">
                <Building2 className="h-4 w-4" />
                Set Up Your Profile
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/search">
                <Search className="h-4 w-4" />
                Browse Grants
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
