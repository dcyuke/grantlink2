import { cn } from '@/lib/utils'
import { daysUntil, getDeadlineUrgency } from '@/lib/utils'
import { Clock, RotateCw } from 'lucide-react'
import type { DeadlineType } from '@/types/opportunity'

interface DeadlineBadgeProps {
  deadlineDate: string | null
  deadlineType: DeadlineType
  deadlineDisplay: string | null
  className?: string
}

export function DeadlineBadge({
  deadlineDate,
  deadlineType,
  deadlineDisplay,
  className,
}: DeadlineBadgeProps) {
  if (deadlineType === 'rolling' || deadlineType === 'continuous') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700',
          className
        )}
      >
        <RotateCw className="h-3 w-3" />
        Rolling
      </span>
    )
  }

  if (deadlineType === 'by_invitation') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground',
          className
        )}
      >
        By Invitation
      </span>
    )
  }

  const days = daysUntil(deadlineDate)
  const urgency = getDeadlineUrgency(deadlineDate)

  if (days !== null && days < 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground',
          className
        )}
      >
        Closed
      </span>
    )
  }

  const urgencyStyles = {
    urgent: 'bg-rose-500/10 text-rose-600',
    soon: 'bg-amber-50 text-amber-600',
    normal: 'bg-emerald-50 text-emerald-700',
    none: 'bg-muted text-muted-foreground',
  }

  const label =
    days !== null
      ? days === 0
        ? 'Due today'
        : days === 1
          ? '1 day left'
          : `${days} days left`
      : deadlineDisplay || 'Deadline TBD'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        urgencyStyles[urgency],
        className
      )}
    >
      <Clock className="h-3 w-3" />
      {label}
    </span>
  )
}
