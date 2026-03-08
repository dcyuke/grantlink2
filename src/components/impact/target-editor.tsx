'use client'

import { useState, useEffect } from 'react'
import { X, Target, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MetricDefinition } from '@/lib/impact-metrics'
import type { PeriodData } from '@/lib/impact-storage'
import {
  getImpactTargets,
  saveAllTargets,
  type MetricTarget,
} from '@/lib/impact-targets'

interface TargetEditorProps {
  metrics: MetricDefinition[]
  latestPeriod: PeriodData | null
  onClose: () => void
}

export function TargetEditor({ metrics, latestPeriod, onClose }: TargetEditorProps) {
  const [drafts, setDrafts] = useState<Record<string, { value: string; note: string }>>({})
  const [saved, setSaved] = useState(false)

  // Initialize drafts from existing targets stored in localStorage on mount
  useEffect(() => {
    const existing = getImpactTargets()
    const initial: Record<string, { value: string; note: string }> = {}
    for (const m of metrics) {
      const t = existing?.targets.find((tgt) => tgt.metricId === m.id)
      initial[m.id] = {
        value: t?.targetValue ? String(t.targetValue) : '',
        note: t?.note ?? '',
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-fill from localStorage targets on mount
    setDrafts(initial)
  }, [metrics])

  const handleSave = () => {
    const targets: MetricTarget[] = []
    for (const m of metrics) {
      const draft = drafts[m.id]
      if (!draft) continue
      const numVal = parseInt(draft.value, 10)
      if (!isNaN(numVal) && numVal > 0) {
        targets.push({
          metricId: m.id,
          targetValue: numVal,
          note: draft.note || undefined,
        })
      }
    }
    saveAllTargets(targets)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 1200)
  }

  const getLatestValue = (metricId: string): number => {
    if (!latestPeriod) return 0
    return latestPeriod.entries.find((e) => e.metricId === metricId)?.value ?? 0
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Set Metric Targets</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="border-b border-border/20 px-5 py-3 text-xs text-muted-foreground">
        Set targets to track grant milestones and measure progress. Leave blank to skip a metric.
      </p>

      {/* Metrics list */}
      <div className="max-h-[60vh] overflow-y-auto px-5 py-3">
        <div className="space-y-3">
          {metrics.map((m) => {
            const current = getLatestValue(m.id)
            const draft = drafts[m.id]
            return (
              <div
                key={m.id}
                className="flex flex-col gap-2 rounded-lg border border-border/30 bg-background p-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Current: {current > 0 ? current.toLocaleString() : '—'} {m.unit}
                    {m.exampleTarget && (
                      <span className="ml-2 text-muted-foreground/50">
                        (example: {m.exampleTarget})
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={draft?.value ?? ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [m.id]: { ...prev[m.id], value: e.target.value },
                      }))
                    }
                    placeholder="Target"
                    className="w-24 rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-sm tabular-nums text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">{m.unit}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-border/40 px-5 py-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" className="gap-1.5" onClick={handleSave}>
          {saved ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Save Targets
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
