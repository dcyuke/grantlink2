import { Building2, Search, BarChart3, FileText } from 'lucide-react'

const STEPS = [
  {
    icon: Building2,
    title: 'Set Up Your Profile',
    description:
      'Tell us about your nonprofit — mission, focus areas, budget — and every tool becomes personalized to your work.',
  },
  {
    icon: Search,
    title: 'Find & Track Funding',
    description:
      'Search thousands of grants, fellowships, and prizes. Save, compare, and track applications from research to award.',
  },
  {
    icon: BarChart3,
    title: 'Measure Your Impact',
    description:
      'Choose from 20 issue-area frameworks. Enter data, track trends over time, and see your progress at a glance.',
  },
  {
    icon: FileText,
    title: 'Report to Stakeholders',
    description:
      'Generate polished donor updates, board presentations, and grant reports — ready to share or print.',
  },
]

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">How GrantLink Works</h2>
        <p className="mt-1 text-muted-foreground">
          From setup to reporting — a connected workflow for your whole team
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative text-center">
            {/* Connector line (desktop only) */}
            {i < STEPS.length - 1 && (
              <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/30 to-transparent md:block" />
            )}

            <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20">
              <step.icon className="h-6 w-6 text-primary" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {i + 1}
              </span>
            </div>
            <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
