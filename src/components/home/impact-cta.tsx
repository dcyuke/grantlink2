import Link from 'next/link'
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
              Data Wins Grants. Are You Collecting Yours?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              82% of funders say measurable outcomes influence their funding decisions. Small and mid-sized nonprofits that track their impact are 3× more likely to secure repeat funding — yet most lack the tools to do it. GrantLink changes that.
            </p>
          </div>

          {/* Features — clean grid with top borders */}
          <div className="mb-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Know What to Measure',
                desc: 'Expert-curated metrics for 20 issue areas tell you exactly what data to collect — no evaluation consultant needed.',
              },
              {
                title: 'See the Trends',
                desc: 'Track data over time to spot what\u2019s working. Funders want to see growth — now you can show it.',
              },
              {
                title: 'Prove It to Funders',
                desc: 'Turn your data into polished reports that demonstrate outcomes, not just activities.',
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
