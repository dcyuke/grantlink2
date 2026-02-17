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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
