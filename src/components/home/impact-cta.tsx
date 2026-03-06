import Link from 'next/link'
import { BarChart3, ArrowRight, Target, FileText, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ImpactCTA() {
  return (
    <section className="border-t border-border/20 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Show Your Impact, Not Just Your Activities
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground">
            Funders want to see outcomes, not just outputs.
            GrantLink gives you the tools to track what matters and tell your story with data.
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

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/impact">
                Start Measuring Impact
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
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
