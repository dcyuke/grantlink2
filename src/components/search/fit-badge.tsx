import { cn } from '@/lib/utils'

interface FitBadgeProps {
  score: number
  label: string
  color: string
}

export function FitBadge({ label, color }: FitBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        color === 'emerald' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
        color === 'amber' && 'border-amber-200 bg-amber-50 text-amber-600',
        color === 'orange' && 'border-orange-200 bg-orange-50 text-orange-600',
        color === 'rose' && 'border-rose-200 bg-rose-50 text-rose-600'
      )}
    >
      {label}
    </span>
  )
}
