import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number | null | undefined): string {
  if (cents == null) return 'Amount varies'
  const dollars = cents / 100
  if (dollars >= 1_000_000) {
    const millions = dollars / 1_000_000
    return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`
  }
  if (dollars >= 1_000) {
    const thousands = dollars / 1_000
    return `$${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`
  }
  return `$${dollars.toLocaleString()}`
}

export function formatAmountRange(
  min: number | null,
  max: number | null,
  exact: number | null,
  display: string | null
): string {
  if (display) return display
  if (exact != null) return formatCurrency(exact)
  if (min != null && max != null) return `${formatCurrency(min)} - ${formatCurrency(max)}`
  if (max != null) return `Up to ${formatCurrency(max)}`
  if (min != null) return `From ${formatCurrency(min)}`
  return 'Amount varies'
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const deadline = new Date(dateStr)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function getDeadlineUrgency(dateStr: string | null): 'urgent' | 'soon' | 'normal' | 'none' {
  const days = daysUntil(dateStr)
  if (days === null) return 'none'
  if (days < 0) return 'none'
  if (days <= 14) return 'urgent'
  if (days <= 45) return 'soon'
  return 'normal'
}

/**
 * Check if a date string is within the last 7 days.
 * Pre-computes the cutoff at module load to avoid calling Date.now() during render.
 */
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
let _weekAgoCutoff = Date.now() - SEVEN_DAYS_MS

export function isWithinLastWeek(dateStr: string): boolean {
  // Refresh cutoff if it's stale (older than 1 hour) to stay accurate over long sessions
  const now = Date.now()
  if (now - _weekAgoCutoff > SEVEN_DAYS_MS + 3600000) {
    _weekAgoCutoff = now - SEVEN_DAYS_MS
  }
  return new Date(dateStr).getTime() > _weekAgoCutoff
}

/**
 * Determine if a grant opportunity is good for first-time applicants.
 * Criteria: simple complexity, smaller amounts, no LOI required, standard org types.
 */
export function isFirstTimeFriendly(opp: {
  application_complexity: string
  amount_max: number | null
  amount_exact: number | null
  requires_loi?: boolean
}): boolean {
  // Complex applications are not first-time friendly
  if (opp.application_complexity === 'complex') return false

  // Very large grants (over $100K) are typically not beginner-friendly
  const maxAmount = opp.amount_max ?? opp.amount_exact ?? null
  if (maxAmount !== null && maxAmount > 10000000) return false // $100K in cents

  // Requiring an LOI is extra work for first-timers
  if (opp.requires_loi) return false

  // Simple complexity is always first-time friendly
  if (opp.application_complexity === 'simple') return true

  // Moderate complexity with smaller amounts is also friendly
  if (opp.application_complexity === 'moderate') {
    if (maxAmount === null) return false
    return maxAmount <= 5000000 // $50K in cents
  }

  return false
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
