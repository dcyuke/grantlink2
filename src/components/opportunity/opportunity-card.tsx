import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { DeadlineBadge } from './deadline-badge'
import { FitBadge } from '@/components/search/fit-badge'
import { formatAmountRange, isWithinLastWeek, isFirstTimeFriendly } from '@/lib/utils'
import { OPPORTUNITY_TYPE_LABELS } from '@/lib/constants'
import { MapPin, ArrowRight, DollarSign, Building2 } from 'lucide-react'
import type { OpportunityListItem } from '@/types/opportunity'

interface OpportunityCardProps {
  opportunity: OpportunityListItem
  fitScore?: { score: number; label: string; color: string }
}

export function OpportunityCard({ opportunity, fitScore }: OpportunityCardProps) {
  const amount = formatAmountRange(
    opportunity.amount_min,
    opportunity.amount_max,
    opportunity.amount_exact,
    opportunity.amount_display
  )

  const isNewThisWeek = isWithinLastWeek(opportunity.created_at)
  const firstTimeFriendly = isFirstTimeFriendly(opportunity)

  return (
    <Link href={`/opportunity/${opportunity.slug}`} className="group block">
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
        {/* Top row: type badge + fit badge + bookmark + deadline */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {OPPORTUNITY_TYPE_LABELS[opportunity.opportunity_type]}
            </Badge>
            {isNewThisWeek && (
              <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold hover:bg-emerald-50">
                NEW
              </Badge>
            )}
            {firstTimeFriendly && (
              <Badge className="bg-violet-50 text-violet-700 text-[10px] font-semibold hover:bg-violet-50">
                First-Time Friendly
              </Badge>
            )}
            {opportunity.is_featured && (
              <Badge className="bg-amber-50 text-amber-600 text-xs font-medium hover:bg-amber-50">
                Featured
              </Badge>
            )}
            {fitScore && (
              <FitBadge score={fitScore.score} label={fitScore.label} color={fitScore.color} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <DeadlineBadge
              deadlineDate={opportunity.deadline_date}
              deadlineType={opportunity.deadline_type}
              deadlineDisplay={opportunity.deadline_display}
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1 text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {opportunity.title}
        </h3>

        {/* Funder */}
        {opportunity.funder_name && (
          <p className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {opportunity.funder_name}
          </p>
        )}

        {/* Summary */}
        {opportunity.summary && (
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {opportunity.summary}
          </p>
        )}

        {/* Key facts row */}
        <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            {amount}
          </span>
          {opportunity.geo_scope_display && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {opportunity.geo_scope_display}
            </span>
          )}
        </div>

        {/* Focus area tags + apply arrow */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {opportunity.focus_area_names?.slice(0, 3).map((area) => (
              <span
                key={area}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {area}
              </span>
            ))}
            {(opportunity.focus_area_names?.length ?? 0) > 3 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                +{opportunity.focus_area_names.length - 3}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
