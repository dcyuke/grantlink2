import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ImpactCTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
              Impact
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Show Your Impact, Not Just Your Activities
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Funders want to see outcomes, not just outputs. GrantLink gives you the tools to track what matters and tell your story with data.
            </p>
          </div>

          {/* Full-width landscape image */}
          <div className="mb-16 overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80"
              alt="Nonprofit impact and community engagement"
              width={1200}
              height={500}
              className="h-auto w-full object-cover"
            />
          </div>

          {/* Features — clean grid with top borders */}
          <div className="mb-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Right Metrics',
                desc: 'Frameworks for 20 issue areas with outputs, outcomes, and impact indicators.',
              },
              {
                title: 'Visual Dashboard',
                desc: 'Track data over time. See trends and compare reporting periods at a glance.',
              },
              {
                title: 'Polished Reports',
                desc: 'Export donor updates, board presentations, and grant reports — print-ready.',
              },
            ].map((item, i) => (
              <div key={i} className="border-t border-border pt-5">
                <h3 className="mb-2 font-medium text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2 rounded-full px-6">
              <Link href="/impact">
                Start Measuring Impact
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 rounded-full px-6">
              <Link href="/impact/evaluation">
                <ClipboardList className="h-4 w-4" />
                Build an M&E Plan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
