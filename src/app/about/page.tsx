import type { Metadata } from 'next'
import { Search, Heart, Mail, User, Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About | GrantLink',
  description:
    'GrantLink is the nonprofit back office — find funding, measure impact, and tell your story, all in one place.',
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="container mx-auto px-4 pb-16 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
            About
          </p>
          <h1 className="mb-6 font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
            About GrantLink
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            The nonprofit back office in a browser. GrantLink brings together grant discovery,
            impact measurement, partner matching, and organizational tools so your team can
            focus on the mission — not the admin.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-16">
            <section>
              <div className="mb-4 flex items-center gap-3">
                <Heart className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl font-semibold text-foreground">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To celebrate, serve, and empower small and mid-sized nonprofits to achieve extraordinary impact.
              </p>
            </section>

            <section>
              <div className="mb-6 flex items-center gap-3">
                <Search className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl font-semibold text-foreground">What We Offer</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  { title: 'Grant Discovery', desc: 'Search thousands of grants, fellowships, prizes, and corporate giving programs. Filter by amount, deadline, focus area, and eligibility.' },
                  { title: 'Impact Measurement', desc: 'Track outputs, outcomes, and impact with expert-informed frameworks for 20 issue areas.' },
                  { title: 'M&E Plan Builder', desc: 'Build a monitoring and evaluation plan in minutes with our guided questionnaire.' },
                  { title: 'Partner Matcher', desc: 'Find corporate funders aligned with your focus areas and partnership style.' },
                  { title: 'Readiness Assessment', desc: 'A quick self-assessment to identify where your org stands for grant applications.' },
                ].map((item) => (
                  <div key={item.title} className="border-t border-border pt-4">
                    <h3 className="mb-1 font-medium text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-16">
            <div className="mb-4 flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                A Note from the Creator:{' '}
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
            <div className="rounded-2xl border border-border/60 bg-card p-8">
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Stretching every dollar has always defined nonprofit work, but
                demonstrating effectiveness and securing funding is now more critical
                than ever.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Small and mid-sized nonprofits often have a deep understanding of the
                challenges they address, but not always the budget or bandwidth to
                maximize their impact. GrantLink supports these organizations by
                delivering a connected suite of solutions that enable even the smallest
                teams to operate with the effectiveness and capacity of a much larger
                organization.
              </p>
            </div>
          </section>

          <section className="mt-16">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl font-semibold text-foreground">Get in Touch</h2>
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

          <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center">
            <h2 className="mb-2 font-serif text-2xl font-semibold text-foreground">Ready to get started?</h2>
            <p className="mb-6 text-muted-foreground">
              Set up your organization profile and let every tool work for you.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="gap-2 rounded-full px-6">
                <Link href="/organization">
                  <Building2 className="h-4 w-4" />
                  Set Up Your Profile
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 rounded-full px-6">
                <Link href="/search">
                  <Search className="h-4 w-4" />
                  Browse Grants
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
