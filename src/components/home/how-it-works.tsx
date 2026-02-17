import { Search, Filter, ExternalLink } from 'lucide-react'

const STEPS = [
  {
    icon: Search,
    title: 'Search',
    description:
      'Enter keywords, focus areas, or browse by category to discover relevant funding opportunities.',
  },
  {
    icon: Filter,
    title: 'Filter & Compare',
    description:
      'Narrow results by amount, deadline, eligibility, population served, and more to find the best fit.',
  },
  {
    icon: ExternalLink,
    title: 'Apply Directly',
    description:
      'Click through to the funder\'s website and apply directly. No middlemen, no fees.',
  },
]

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">How It Works</h2>
        <p className="mt-1 text-muted-foreground">
          Three simple steps to find your next funding opportunity
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative text-center">
            {/* Connector line (desktop only) */}
            {i < STEPS.length - 1 && (
              <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/30 to-transparent md:block" />
            )}

            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <step.icon className="h-7 w-7 text-primary" />
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
