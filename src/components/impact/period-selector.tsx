'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'
import {
  makeQuarterlyId,
  makeQuarterlyLabel,
  makeMonthlyId,
  makeMonthlyLabel,
  makeAnnualId,
  makeAnnualLabel,
  type PeriodData,
} from '@/lib/impact-storage'

interface PeriodSelectorProps {
  existingPeriods: PeriodData[]
  onAddPeriod: (period: Pick<PeriodData, 'id' | 'label' | 'type'>) => void
}

type PeriodType = 'monthly' | 'quarterly' | 'annual'

export function PeriodSelector({ existingPeriods, onAddPeriod }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [periodType, setPeriodType] = useState<PeriodType>('quarterly')
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [quarter, setQuarter] = useState(() => Math.ceil((new Date().getMonth() + 1) / 3))
  const [month, setMonth] = useState(() => new Date().getMonth() + 1)

  const existingIds = new Set(existingPeriods.map((p) => p.id))

  const generateId = () => {
    if (periodType === 'quarterly') return makeQuarterlyId(year, quarter)
    if (periodType === 'monthly') return makeMonthlyId(year, month)
    return makeAnnualId(year)
  }

  const generateLabel = () => {
    if (periodType === 'quarterly') return makeQuarterlyLabel(year, quarter)
    if (periodType === 'monthly') return makeMonthlyLabel(year, month)
    return makeAnnualLabel(year)
  }

  const id = generateId()
  const alreadyExists = existingIds.has(id)

  const handleAdd = () => {
    if (alreadyExists) return
    onAddPeriod({ id, label: generateLabel(), type: periodType })
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Period
      </Button>
    )
  }

  const years = Array.from({ length: 5 }, (_, i) => year - i + 2)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <Calendar className="h-4 w-4 text-primary" />
        Add a Reporting Period
      </div>

      {/* Period type tabs */}
      <div className="mb-4 flex rounded-lg bg-muted/50 p-0.5">
        {(['quarterly', 'monthly', 'annual'] as PeriodType[]).map((t) => (
          <button
            key={t}
            onClick={() => setPeriodType(t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              periodType === t
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-3">
        {/* Year select */}
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Quarter select */}
        {periodType === 'quarterly' && (
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Quarter</label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(Number(e.target.value))}
              className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground"
            >
              {[1, 2, 3, 4].map((q) => (
                <option key={q} value={q}>Q{q}</option>
              ))}
            </select>
          </div>
        )}

        {/* Month select */}
        {periodType === 'monthly' && (
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground"
            >
              {months.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {alreadyExists && (
        <p className="mb-3 text-xs text-amber-600">
          You already have data for {generateLabel()}.
        </p>
      )}

      <div className="flex gap-2">
        <Button size="sm" disabled={alreadyExists} onClick={handleAdd} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add {generateLabel()}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
