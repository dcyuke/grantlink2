'use client'

import { type MetricDefinition } from '@/lib/impact-metrics'

interface MetricInputCardProps {
  metric: MetricDefinition
  value: number
  note: string
  onChange: (value: number, note: string) => void
}

export function MetricInputCard({ metric, value, note, onChange }: MetricInputCardProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{metric.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{metric.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {metric.unit}
        </span>
      </div>
      <div className="flex gap-3">
        <div className="w-32">
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
            Value
          </label>
          <input
            type="number"
            min={0}
            value={value || ''}
            placeholder="0"
            onChange={(e) => onChange(Number(e.target.value) || 0, note)}
            className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm tabular-nums text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            placeholder="Add context…"
            onChange={(e) => onChange(value, e.target.value)}
            className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>
    </div>
  )
}
