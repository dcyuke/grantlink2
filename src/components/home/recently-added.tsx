import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import type { OpportunityListItem } from '@/types/opportunity'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RecentlyAddedProps {
  opportunities: OpportunityListItem[]
}

export function RecentlyAddedSection({ opportunities }: RecentlyAddedProps) {
  if (opportunities.length === 0) return null

  return (
    <section className="bg-muted/10 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground md:text-2xl">
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>

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
