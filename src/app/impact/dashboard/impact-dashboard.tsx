'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Settings,
  Save,
  CheckCircle2,
  Trash2,
  BarChart3,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PeriodSelector } from '@/components/impact/period-selector'
import { MetricInputCard } from '@/components/impact/metric-input-card'
import { BarChart } from '@/components/impact/bar-chart'
import { StatCard } from '@/components/impact/stat-card'
import {
  getImpactConfig,
  getImpactData,
  savePeriod,
  deletePeriod,
  saveOrgName,
  exportAllImpactData,
  importAllImpactData,
  exportImpactCSV,
  IMPACT_CONFIG_EVENT,
  IMPACT_DATA_EVENT,
  type ImpactConfig,
  type ImpactData,
  type PeriodData,
  type MetricEntry,
} from '@/lib/impact-storage'
import {
  getMetricDefinitions,
  CATEGORY_LABELS,
  type MetricDefinition,
  type MetricCategory,
} from '@/lib/impact-metrics'

type View = 'overview' | 'entry'

export function ImpactDashboard() {
  const [config, setConfig] = useState<ImpactConfig | null>(null)
  const [data, setData] = useState<ImpactData | null>(null)
  const [view, setView] = useState<View>('overview')
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null)
  const [draftEntries, setDraftEntries] = useState<Record<string, { value: number; note: string }>>({})
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [orgNameInput, setOrgNameInput] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Refs for auto-save and beforeunload
  const saveRef = useRef<() => void>(() => {})
  const dirtyRef = useRef(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Load config & data
  const refresh = useCallback(() => {
    setConfig(getImpactConfig())
    const d = getImpactData()
    setData(d)
    setOrgNameInput(d?.orgName ?? '')
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener(IMPACT_CONFIG_EVENT, refresh)
    window.addEventListener(IMPACT_DATA_EVENT, refresh)
    return () => {
      window.removeEventListener(IMPACT_CONFIG_EVENT, refresh)
      window.removeEventListener(IMPACT_DATA_EVENT, refresh)
    }
  }, [refresh])

  // Close export menu when clicking outside (must be before early returns for hook ordering)
  useEffect(() => {
    if (!showExportMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  // Redirect if no config
  if (config === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BarChart3 className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
        <h2 className="mb-2 font-serif text-xl font-semibold text-foreground">
          No Impact Tracking Set Up
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Choose your issue area and metrics to get started.
        </p>
        <Button asChild>
          <Link href="/impact/setup">Set Up Now</Link>
        </Button>
      </div>
    )
  }

  const metrics: MetricDefinition[] = getMetricDefinitions(
    config.issueAreaSlug,
    config.selectedMetricIds,
  )
  const periods = data?.periods ?? []

  // Group metrics by category
  const grouped: Record<MetricCategory, MetricDefinition[]> = {
    output: [],
    outcome: [],
    impact: [],
  }
  for (const m of metrics) {
    grouped[m.category].push(m)
  }

  // ── Data entry view ──────────────────────────────────────────
  const openEntry = (periodId: string) => {
    const period = periods.find((p) => p.id === periodId)
    const entries: Record<string, { value: number; note: string }> = {}
    for (const m of metrics) {
      const existing = period?.entries.find((e) => e.metricId === m.id)
      entries[m.id] = {
        value: existing?.value ?? 0,
        note: existing?.note ?? '',
      }
    }
    setDraftEntries(entries)
    setActivePeriodId(periodId)
    setView('entry')
    setSaved(false)
    setDirty(false)
  }

  const handleSaveEntry = () => {
    if (!activePeriodId) return
    const period = periods.find((p) => p.id === activePeriodId)
    if (!period) return

    const entries: MetricEntry[] = metrics.map((m) => ({
      metricId: m.id,
      value: draftEntries[m.id]?.value ?? 0,
      note: draftEntries[m.id]?.note || undefined,
    }))

    savePeriod({ ...period, entries })
    setSaved(true)
    setDirty(false)
    setTimeout(() => setSaved(false), 2000)
  }

  // Keep refs in sync for auto-save / beforeunload callbacks
  saveRef.current = handleSaveEntry
  dirtyRef.current = dirty

  const handleDeletePeriod = (id: string) => {
    const period = periods.find((p) => p.id === id)
    if (!window.confirm(`Delete "${period?.label ?? 'this period'}" and all its data? This cannot be undone.`)) return
    deletePeriod(id)
    if (activePeriodId === id) {
      setView('overview')
      setActivePeriodId(null)
    }
  }

  const handleAddPeriod = (p: Pick<PeriodData, 'id' | 'label' | 'type'>) => {
    const newPeriod: PeriodData = {
      ...p,
      entries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    savePeriod(newPeriod)
    openEntry(newPeriod.id)
  }

  const handleOrgNameBlur = () => {
    if (orgNameInput.trim() !== (data?.orgName ?? '')) {
      saveOrgName(orgNameInput.trim())
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const csv = exportImpactCSV(metrics, periods)
    const datestamp = new Date().toISOString().slice(0, 10)
    downloadFile(csv, `impact-data-${datestamp}.csv`, 'text/csv')
    setShowExportMenu(false)
  }

  const handleExportJSON = () => {
    const json = exportAllImpactData()
    const datestamp = new Date().toISOString().slice(0, 10)
    downloadFile(json, `grantlink-impact-backup-${datestamp}.json`, 'application/json')
    setShowExportMenu(false)
  }

  const handleExportPDF = () => {
    setShowExportMenu(false)
    // Brief delay so menu closes before print dialog
    setTimeout(() => window.print(), 100)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (re) => {
        const text = re.target?.result as string
        if (importAllImpactData(text)) {
          refresh()
        } else {
          alert('Invalid backup file. Please try again with a valid GrantLink backup.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // ── Entry view ───────────────────────────────────────────────
  const activePeriod = (view === 'entry' && activePeriodId)
    ? periods.find((p) => p.id === activePeriodId)
    : undefined

  if (view === 'entry' && activePeriod) {
    return (
      <EntryView
        period={activePeriod}
        metrics={metrics}
        grouped={grouped}
        draftEntries={draftEntries}
        saved={saved}
        dirty={dirty}
        onBack={() => {
          if (dirtyRef.current) saveRef.current()
          setView('overview')
        }}
        onSave={handleSaveEntry}
        onChange={(metricId, value, note) => {
          setDraftEntries((prev) => ({
            ...prev,
            [metricId]: { value, note },
          }))
          setDirty(true)
        }}
        saveRef={saveRef}
        dirtyRef={dirtyRef}
      />
    )
  }

  // ── Overview ─────────────────────────────────────────────────
  const latestPeriod = periods[0] ?? null
  const previousPeriod = periods[1] ?? null

  const getTotalForPeriod = (
    period: PeriodData | null,
    metricId: string,
  ): number => {
    if (!period) return 0
    return period.entries.find((e) => e.metricId === metricId)?.value ?? 0
  }

  const chartPeriods = [...periods].reverse()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/impact"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Impact
          </Link>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Impact Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {config.issueAreaName} · {metrics.length} metrics tracked
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/impact/report">
              <FileText className="h-3.5 w-3.5" />
              Reports
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/impact/setup">
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
          </Button>
          {/* Export dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowExportMenu((v) => !v)}
            >
              <Download className="h-3.5 w-3.5" />
              Export
              <ChevronDown className="h-3 w-3" />
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 z-50 mt-1 w-56 rounded-lg border border-border/60 bg-card py-1 shadow-lg print:hidden">
                <button
                  onClick={handleExportCSV}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted/50"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-medium">CSV for Excel / Sheets</p>
                    <p className="text-xs text-muted-foreground">Open in Excel or Google Sheets</p>
                  </div>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted/50"
                >
                  <Printer className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Print / Save as PDF</p>
                    <p className="text-xs text-muted-foreground">Print or save to PDF via browser</p>
                  </div>
                </button>
                <div className="my-1 border-t border-border/30" />
                <button
                  onClick={handleExportJSON}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted/50"
                >
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">JSON Backup</p>
                    <p className="text-xs text-muted-foreground">Full data backup for import later</p>
                  </div>
                </button>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleImport}>
            <Upload className="h-3.5 w-3.5" />
            Import
          </Button>
        </div>
      </div>

      {/* Org name */}
      <div className="mb-8 print:hidden">
        <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
          Organization Name (for reports)
        </label>
        <input
          type="text"
          value={orgNameInput}
          onChange={(e) => setOrgNameInput(e.target.value)}
          onBlur={handleOrgNameBlur}
          placeholder="Enter your organization name…"
          className="w-full max-w-md rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* Period selector + list */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Reporting Periods
          </h2>
          <PeriodSelector
            existingPeriods={periods}
            onAddPeriod={handleAddPeriod}
          />
        </div>

        {periods.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-12 text-center">
            <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              No periods yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Add a reporting period to start entering data.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {periods.map((period) => {
              const filledCount = period.entries.filter((e) => e.value > 0).length
              return (
                <div
                  key={period.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {period.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {filledCount} of {metrics.length} metrics filled ·{' '}
                      {period.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEntry(period.id)}
                    >
                      {filledCount > 0 ? 'Edit' : 'Enter Data'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-red-500"
                      onClick={() => handleDeletePeriod(period.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stat cards — latest period highlights */}
      {latestPeriod && latestPeriod.entries.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
            Latest: {latestPeriod.label}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {metrics.slice(0, 8).map((m) => {
              const val = getTotalForPeriod(latestPeriod, m.id)
              const prev = previousPeriod
                ? getTotalForPeriod(previousPeriod, m.id)
                : undefined
              return (
                <StatCard
                  key={m.id}
                  label={m.label}
                  value={val}
                  previousValue={prev}
                  unit={m.unit}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Charts — one per metric across periods */}
      {chartPeriods.length > 0 && (
        <div className="space-y-10">
          {(['output', 'outcome', 'impact'] as MetricCategory[]).map((cat) => {
            const catMetrics = grouped[cat]
            if (catMetrics.length === 0) return null
            return (
              <div key={cat}>
                <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  {catMetrics.map((m) => {
                    const chartData = chartPeriods.map((p) => ({
                      label: p.label,
                      value:
                        p.entries.find((e) => e.metricId === m.id)?.value ?? 0,
                    }))
                    const hasData = chartData.some((d) => d.value > 0)
                    if (!hasData) return null
                    return (
                      <div
                        key={m.id}
                        className="rounded-lg border border-border/40 bg-card p-5"
                      >
                        <h3 className="mb-1 text-sm font-medium text-foreground">
                          {m.label}
                        </h3>
                        <p className="mb-4 text-xs text-muted-foreground">
                          {m.unit}
                        </p>
                        <BarChart data={chartData} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty chart state */}
      {periods.length > 0 &&
        periods.every((p) => p.entries.length === 0) && (
          <div className="rounded-lg border border-dashed border-border/60 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Enter data for at least one period to see charts and trends.
            </p>
          </div>
        )}

      {/* Print styles for PDF export */}
      <style jsx global>{`
        @media print {
          .print\\:hidden,
          nav,
          header,
          footer {
            display: none !important;
          }
          body {
            background: white !important;
          }
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  )
}

// ── Entry View (extracted to avoid hook ordering issues) ──────────

function EntryView({
  period,
  metrics,
  grouped,
  draftEntries,
  saved,
  dirty,
  onBack,
  onSave,
  onChange,
  saveRef,
  dirtyRef,
}: {
  period: PeriodData
  metrics: MetricDefinition[]
  grouped: Record<MetricCategory, MetricDefinition[]>
  draftEntries: Record<string, { value: number; note: string }>
  saved: boolean
  dirty: boolean
  onBack: () => void
  onSave: () => void
  onChange: (metricId: string, value: number, note: string) => void
  saveRef: React.RefObject<(() => void) | null>
  dirtyRef: React.RefObject<boolean | null>
}) {
  // Auto-save with 3s debounce
  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(() => {
      saveRef.current?.()
    }, 3000)
    return () => clearTimeout(timer)
  }, [dirty, draftEntries, saveRef])

  // Beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirtyRef])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                {period.label}
              </h1>
              <p className="text-sm text-muted-foreground">
                {dirty ? (
                  <span className="text-amber-600">Auto-saving in a moment…</span>
                ) : saved ? (
                  <span className="text-emerald-600">All changes saved</span>
                ) : (
                  'Enter your data for this period'
                )}
              </p>
            </div>
            <Button onClick={onSave} className="gap-2">
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Metric inputs by category */}
        <div className="space-y-8">
          {(['output', 'outcome', 'impact'] as MetricCategory[]).map((cat) => {
            const catMetrics = grouped[cat]
            if (catMetrics.length === 0) return null
            return (
              <div key={cat}>
                <h2 className="mb-3 font-serif text-lg font-semibold text-foreground">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <div className="space-y-3">
                  {catMetrics.map((m) => (
                    <MetricInputCard
                      key={m.id}
                      metric={m}
                      value={draftEntries[m.id]?.value ?? 0}
                      note={draftEntries[m.id]?.note ?? ''}
                      onChange={(value, note) => onChange(m.id, value, note)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom save */}
        <div className="mt-8 flex justify-end border-t border-border/30 pt-6">
          <Button onClick={onSave} size="lg" className="gap-2">
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Data
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
