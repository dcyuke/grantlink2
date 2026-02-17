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
    <section className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Featured Opportunities
          </h2>
          <p className="mt-1 text-muted-foreground">
            Hand-picked funding opportunities worth exploring
          </p>
        </div>
        <Link
          href="/search"
          className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 md:flex"
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

      <div className="mt-6 text-center md:hidden">
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
