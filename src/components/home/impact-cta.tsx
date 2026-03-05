import Link from 'next/link'
import { BarChart3, ArrowRight, Target, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ImpactCTA() {
  return (
    <section className="border-t border-border/20 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <BarChart3 className="h-3.5 w-3.5" />
            New: Impact Measurement
          </div>
          <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Show Your Impact, Not Just Your Activities
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground">
            Track the metrics that matter to your funders and stakeholders.
            Generate polished reports with data you already have.
          </p>

          <div className="mb-10 grid gap-4 text-left sm:grid-cols-3">
            {[
              {
                icon: Target,
                title: 'Right Metrics',
                desc: 'Frameworks for 20 issue areas with outputs, outcomes, and impact indicators.',
              },
              {
                icon: BarChart3,
                title: 'Visual Dashboard',
                desc: 'Track data over time. See trends and compare reporting periods at a glance.',
              },
              {
                icon: FileText,
                title: 'Polished Reports',
                desc: 'Export donor updates, board presentations, and grant reports — print-ready.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/30 bg-card p-5"
              >
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-1 text-sm font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <Button asChild size="lg" className="gap-2">
            <Link href="/impact">
              Start Measuring Impact
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
