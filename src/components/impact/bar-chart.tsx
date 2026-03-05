'use client'

interface BarChartProps {
  data: { label: string; value: number }[]
  maxValue?: number
  color?: string // tailwind bg class
  height?: number // px per bar
}

/**
 * Pure-CSS horizontal bar chart.
 * No chart library needed — just styled divs.
 */
export function BarChart({
  data,
  maxValue: maxOverride,
  color = 'bg-primary',
  height = 28,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No data yet. Add a reporting period to get started.
      </p>
    )
  }

  const max = maxOverride ?? Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const pct = max > 0 ? (d.value / max) * 100 : 0
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
              {d.label}
            </span>
            <div className="relative flex-1 overflow-hidden rounded-full bg-muted/50" style={{ height }}>
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${color} transition-all duration-700 ease-out`}
                style={{ width: `${Math.max(pct, 0)}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
              {d.value.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
