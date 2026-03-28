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
      'Search thousands of grants, fellowships, and prizes. Save, compare, and track applications from research to award.',
  },
  {
    num: '03',
    icon: BarChart3,
    title: 'Measure Your Impact',
    description:
      'Start collecting outcome data with expert-curated frameworks for 20 issue areas. The data you gather today becomes the evidence that wins grants tomorrow.',
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
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
            How-to
          </p>
          <h2 className="font-serif text-3xl font-extrabold text-foreground md:text-4xl">
            How GrantLink Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            From setup to reporting — a connected workflow designed for lean nonprofit teams.
          </p>
        </div>

        {/* Steps — numbered list with descriptions */}
        <div className="mx-auto max-w-3xl">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-5 border-t border-border py-6">
              <span className="text-sm font-medium tabular-nums text-muted-foreground/50">{step.num}</span>
              <div>
                <h3 className="mb-1 font-medium text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
          <div className="pt-4">
            <Button asChild size="lg" className="rounded-full px-6" variant="default">
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
