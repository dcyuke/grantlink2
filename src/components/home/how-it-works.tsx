import { Building2, Search, BarChart3, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    num: '01',
    icon: Building2,
    title: 'Set Up Your Profile',
    description:
      'Tell us about your nonprofit — mission, focus areas, team size — and every tool adapts to fit your organization.',
  },
  {
    num: '02',
    icon: Search,
    title: 'Find & Track Funding',
    description:
      'Search grants, fellowships, and prizes. Save opportunities, compare options, and track applications from research to award.',
  },
  {
    num: '03',
    icon: BarChart3,
    title: 'Measure Your Impact',
    description:
      'Collect outcome data using expert-curated frameworks for 20 issue areas. The data you gather today becomes the evidence that wins grants tomorrow.',
  },
  {
    num: '04',
    icon: FileText,
    title: 'Report to Stakeholders',
    description:
      'Generate polished donor updates, board presentations, and grant reports — even with a one-person team.',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
              How it works
            </p>
            <h2 className="font-serif text-3xl font-extrabold text-foreground md:text-4xl">
              From Setup to Funded
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              A connected workflow designed for lean nonprofit teams.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="group relative rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-serif text-4xl font-extrabold text-muted-foreground/10 tabular-nums leading-none">
                    {step.num}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/organization">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
