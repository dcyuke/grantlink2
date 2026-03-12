import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import type { OpportunityListItem } from '@/types/opportunity'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface FeaturedGridProps {
  opportunities: OpportunityListItem[]
}

export function FeaturedGrid({ opportunities }: FeaturedGridProps) {
  if (opportunities.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
            Featured
          </p>
          <h2 className="font-serif text-3xl font-extrabold text-foreground md:text-4xl">
            Featured Opportunities
          </h2>
          <p className="mt-2 text-muted-foreground">
            Timely funding opportunities updated daily
          </p>
        </div>
        <Link
          href="/search"
          className="hidden items-center gap-1.5 text-sm font-medium tracking-wide text-primary transition-colors hover:text-primary/80 md:flex"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.slice(0, 6).map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          View all opportunities
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
