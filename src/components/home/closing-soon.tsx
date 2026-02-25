import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import type { OpportunityListItem } from '@/types/opportunity'
import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ClosingSoonProps {
  opportunities: OpportunityListItem[]
}

export function ClosingSoonSection({ opportunities }: ClosingSoonProps) {
  if (opportunities.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              Closing Soon
            </h2>
            <p className="text-sm text-muted-foreground">
              Don&apos;t miss these upcoming deadlines
            </p>
          </div>
        </div>
        <Link
          href="/search?deadline=30days&sort=deadline_asc"
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
          href="/search?deadline=30days&sort=deadline_asc"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          View all closing soon
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
