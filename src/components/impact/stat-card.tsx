'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  previousValue?: number
  unit?: string
}

export function StatCard({ label, value, previousValue, unit }: StatCardProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(value)
  const hasComparison = previousValue !== undefined && !isNaN(numValue)

  let trend: 'up' | 'down' | 'flat' = 'flat'
  let changePercent = 0

  if (hasComparison && previousValue > 0) {
    changePercent = Math.round(((numValue - previousValue) / previousValue) * 100)
    if (changePercent > 0) trend = 'up'
    else if (changePercent < 0) trend = 'down'
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <p className="mb-1 text-xs tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <p className="font-serif text-2xl font-bold tabular-nums text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {unit && (
          <span className="text-xs text-muted-foreground">{unit}</span>
        )}
      </div>
      {hasComparison && (
        <div className="mt-1.5 flex items-center gap-1">
          {trend === 'up' && (
            <TrendingUp className="h-3 w-3 text-emerald-600" />
          )}
          {trend === 'down' && (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          {trend === 'flat' && (
            <Minus className="h-3 w-3 text-muted-foreground" />
          )}
          <span
            className={`text-xs font-medium ${
              trend === 'up'
                ? 'text-emerald-600'
                : trend === 'down'
                  ? 'text-red-500'
                  : 'text-muted-foreground'
            }`}
          >
            {changePercent > 0 ? '+' : ''}
            {changePercent}% vs prior
          </span>
        </div>
      )}
    </div>
  )
}
