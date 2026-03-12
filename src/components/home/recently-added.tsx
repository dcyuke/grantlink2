import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import { OpportunityGridSkeleton } from '@/components/opportunity/opportunity-card-skeleton'
import type { OpportunityListItem } from '@/types/opportunity'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RecentlyAddedProps {
  opportunities: OpportunityListItem[]
}

export function RecentlyAddedSection({ opportunities }: RecentlyAddedProps) {
  const isEmpty = opportunities.length === 0

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="font-serif text-xl font-extrabold text-foreground md:text-2xl">
                Just Added
              </h2>
              <p className="text-sm text-muted-foreground">
                New opportunities added this week
              </p>
            </div>
          </div>
          <Link
            href="/search?newThisWeek=true"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 md:flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isEmpty ? (
          <OpportunityGridSkeleton count={3} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/search?newThisWeek=true"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            View all new opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
