'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Printer,
  FileText,
  Users,
  Presentation,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getImpactConfig,
  getImpactData,
  saveNarrative,
  IMPACT_CONFIG_EVENT,
  IMPACT_DATA_EVENT,
  type ImpactConfig,
  type ImpactData,
  type PeriodData,
} from '@/lib/impact-storage'
import {
  getMetricDefinitions,
  CATEGORY_LABELS,
  type MetricDefinition,
  type MetricCategory,
} from '@/lib/impact-metrics'
import {
  generateExecutiveSummary,
  generateLookingAhead,
  generateDonorGreeting,
  generateImpactStory,
  generateThankYou,
  generateDiscussionPoints,
} from '@/lib/narrative-generator'

type Template = 'impact-report' | 'donor-update' | 'board-presentation'

const TEMPLATES: { id: Template; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  {
    id: 'impact-report',
    label: 'Impact Report',
    icon: FileText,
    desc: 'Comprehensive report with all metrics, charts, and narrative sections.',
  },
  {
    id: 'donor-update',
    label: 'Donor Update',
    icon: Users,
    desc: 'Concise summary highlighting key achievements for donor communications.',
  },
  {
    id: 'board-presentation',
    label: 'Board Presentation',
    icon: Presentation,
    desc: 'High-level overview with key stats and trends for board meetings.',
  },
]

// ── Editable narrative textarea ──────────────────────────────────

function NarrativeTextarea({
  sectionKey,
  placeholder,
  narratives,
  generatedText,
}: {
  sectionKey: string
  placeholder: string
  narratives: Record<string, string>
  generatedText?: string
}) {
  const existing = narratives[sectionKey] ?? ''
  const [value, setValue] = useState(existing)
  const [didAutoGenerate, setDidAutoGenerate] = useState(false)

  // Auto-generate on first render if the field is empty and generated text is available
  useEffect(() => {
    if (!didAutoGenerate && value === '' && generatedText && generatedText.length > 0) {
      setValue(generatedText)
      saveNarrative(sectionKey, generatedText)
      setDidAutoGenerate(true)
    }
  }, [didAutoGenerate, value, generatedText, sectionKey])

  const handleGenerate = () => {
    if (!generatedText) return
    setValue(generatedText)
    saveNarrative(sectionKey, generatedText)
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => saveNarrative(sectionKey, value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-md border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground placeholder:italic placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 print:placeholder:text-transparent"
        rows={Math.max(4, (value || '').split('\n').length + 1)}
      />
      {generatedText && generatedText.length > 0 && (
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 print:hidden"
        >
          <Sparkles className="h-3 w-3" />
          {value ? 'Regenerate Draft' : 'Generate Draft'}
        </button>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────

export function ImpactReport() {
  const [config, setConfig] = useState<ImpactConfig | null>(null)
  const [data, setData] = useState<ImpactData | null>(null)
  const [template, setTemplate] = useState<Template>('impact-report')
  const [showPreview, setShowPreview] = useState(false)

  const refresh = useCallback(() => {
    setConfig(getImpactConfig())
    setData(getImpactData())
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

  if (!config) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BarChart3 className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
        <h2 className="mb-2 font-serif text-xl font-semibold text-foreground">
          No Impact Data
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Set up impact tracking and enter data before generating reports.
        </p>
        <Button asChild>
          <Link href="/impact/setup">Get Started</Link>
        </Button>
      </div>
    )
  }

  const metrics = getMetricDefinitions(config.issueAreaSlug, config.selectedMetricIds)
  const periods = data?.periods ?? []
  const orgName = data?.orgName || 'Your Organization'
  const narratives = data?.narratives ?? {}

  const periodsWithData = periods.filter((p) =>
    p.entries.some((e) => e.value > 0),
  )

  if (!showPreview) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/impact/dashboard"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <h1 className="mb-2 font-serif text-3xl font-bold tracking-tight text-foreground">
            Generate Report
          </h1>
          <p className="mb-8 text-muted-foreground">
            Choose a template and preview your report before printing or saving as PDF.
          </p>

          {/* Template picker */}
          <div className="mb-8 space-y-3">
            {TEMPLATES.map((t) => {
              const isSelected = template === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border/60 bg-card hover:border-primary/30'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted/60 text-muted-foreground'
                    }`}
                  >
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {periodsWithData.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Enter data for at least one period to generate a report.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/impact/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => setShowPreview(true)}
            >
              Preview Report
              <FileText className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // ── Report preview ───────────────────────────────────────────
  const handlePrint = () => {
    window.print()
  }

  const grouped: Record<MetricCategory, MetricDefinition[]> = {
    output: [],
    outcome: [],
    impact: [],
  }
  for (const m of metrics) {
    grouped[m.category].push(m)
  }

  const latestPeriod = periodsWithData[0]
  const prevPeriod = periodsWithData[1]

  const getVal = (period: PeriodData | undefined, metricId: string): number => {
    if (!period) return 0
    return period.entries.find((e) => e.metricId === metricId)?.value ?? 0
  }

  const getNote = (period: PeriodData | undefined, metricId: string): string | undefined => {
    if (!period) return undefined
    return period.entries.find((e) => e.metricId === metricId)?.note
  }

  return (
    <div>
      {/* Toolbar — hidden in print */}
      <div className="border-b border-border/40 bg-background print:hidden">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Templates
          </button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Printable report */}
      <div className="report-content container mx-auto max-w-3xl px-4 py-10 print:max-w-none print:px-8">
        {/* Report header */}
        <div className="mb-10 border-b border-border/30 pb-8 text-center" style={{ breakInside: 'avoid' }}>
          <h1 className="mb-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
            {template === 'impact-report' && 'Impact Report'}
            {template === 'donor-update' && 'Donor Update'}
            {template === 'board-presentation' && 'Board Presentation'}
          </h1>
          <p className="text-lg text-muted-foreground">{orgName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {config.issueAreaName} ·{' '}
            {periodsWithData.length > 1
              ? `${periodsWithData[periodsWithData.length - 1].label} – ${periodsWithData[0].label}`
              : periodsWithData[0]?.label ?? ''}
          </p>
        </div>

        {/* ── Impact Report template ────────────────────────────── */}
        {template === 'impact-report' && (
          <div className="space-y-10">
            {/* Executive Summary */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-6 print:border-0 print:bg-transparent print:p-0" style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                Executive Summary
              </h2>
              <NarrativeTextarea
                sectionKey="impact-report:executive-summary"
                placeholder="Add a brief narrative about your organization's work during this period — your mission, key achievements, and the communities you served."
                narratives={narratives}
                generatedText={generateExecutiveSummary(orgName, config.issueAreaName, metrics, periodsWithData)}
              />
            </div>

            {/* Metrics by category */}
            {(['output', 'outcome', 'impact'] as MetricCategory[]).map((cat) => {
              const catMetrics = grouped[cat]
              if (catMetrics.length === 0) return null
              return (
                <div key={cat} style={{ breakInside: 'avoid' }}>
                  <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <div className="overflow-x-auto rounded-lg border border-border/40">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 bg-muted/30">
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                            Metric
                          </th>
                          {periodsWithData.map((p) => (
                            <th
                              key={p.id}
                              className="px-4 py-3 text-right font-medium text-muted-foreground"
                            >
                              {p.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {catMetrics.map((m, i) => {
                          const latestNote = getNote(periodsWithData[0], m.id)
                          return (
                            <tr
                              key={m.id}
                              className={
                                i < catMetrics.length - 1
                                  ? 'border-b border-border/20'
                                  : ''
                              }
                            >
                              <td className="px-4 py-3 text-foreground">
                                {m.label}
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({m.unit})
                                </span>
                                {latestNote && (
                                  <p className="mt-0.5 text-xs italic text-muted-foreground/70">
                                    {latestNote}
                                  </p>
                                )}
                              </td>
                              {periodsWithData.map((p) => (
                                <td
                                  key={p.id}
                                  className="px-4 py-3 text-right tabular-nums text-foreground"
                                >
                                  {getVal(p, m.id).toLocaleString()}
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}

            {/* Looking ahead */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-6 print:border-0 print:bg-transparent print:p-0" style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                Looking Ahead
              </h2>
              <NarrativeTextarea
                sectionKey="impact-report:looking-ahead"
                placeholder="Add your goals and targets for the next period. What do you aim to achieve?"
                narratives={narratives}
                generatedText={generateLookingAhead(orgName, metrics, periodsWithData)}
              />
            </div>
          </div>
        )}

        {/* ── Donor Update template ─────────────────────────────── */}
        {template === 'donor-update' && latestPeriod && (
          <div className="space-y-10">
            <div className="rounded-lg border border-border/40 bg-muted/20 p-6 print:border-0 print:bg-transparent print:p-0" style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                Dear Supporters,
              </h2>
              <NarrativeTextarea
                sectionKey="donor-update:greeting"
                placeholder="Open with a warm greeting and brief update about your mission and recent milestones."
                narratives={narratives}
                generatedText={generateDonorGreeting(orgName, config.issueAreaName, metrics, periodsWithData)}
              />
            </div>

            {/* Key highlights — top 6 metrics */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
                Key Highlights — {latestPeriod.label}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {metrics
                  .filter((m) => getVal(latestPeriod, m.id) > 0)
                  .slice(0, 6)
                  .map((m) => {
                    const val = getVal(latestPeriod, m.id)
                    const prev = prevPeriod
                      ? getVal(prevPeriod, m.id)
                      : undefined
                    const pctChange =
                      prev && prev > 0
                        ? Math.round(((val - prev) / prev) * 100)
                        : undefined
                    return (
                      <div
                        key={m.id}
                        className="rounded-lg border border-border/40 p-4 text-center"
                      >
                        <p className="font-serif text-3xl font-bold text-foreground">
                          {val.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {m.label}
                        </p>
                        {pctChange !== undefined && (
                          <p
                            className={`mt-1 text-xs font-medium ${
                              pctChange > 0
                                ? 'text-emerald-600'
                                : pctChange < 0
                                  ? 'text-red-500'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {pctChange > 0 ? '+' : ''}
                            {pctChange}% vs prior period
                          </p>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Impact story */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-6 print:border-0 print:bg-transparent print:p-0" style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                Impact Story
              </h2>
              <NarrativeTextarea
                sectionKey="donor-update:impact-story"
                placeholder="Share a specific story that illustrates the difference your organization is making. Use real examples (with permission) to bring the data to life."
                narratives={narratives}
                generatedText={generateImpactStory(metrics, periodsWithData)}
              />
            </div>

            {/* Thank you */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-6 print:border-0 print:bg-transparent print:p-0" style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                Thank You
              </h2>
              <NarrativeTextarea
                sectionKey="donor-update:thank-you"
                placeholder="Close with gratitude and a call-to-action — continued support, sharing the update, or connecting."
                narratives={narratives}
                generatedText={generateThankYou(orgName)}
              />
            </div>
          </div>
        )}

        {/* ── Board Presentation template ───────────────────────── */}
        {template === 'board-presentation' && latestPeriod && (
          <div className="space-y-10">
            {/* Dashboard view — stat cards */}
            <div style={{ breakInside: 'avoid' }}>
              <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
                Performance Overview — {latestPeriod.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {metrics
                  .filter((m) => getVal(latestPeriod, m.id) > 0)
                  .slice(0, 8)
                  .map((m) => {
                    const val = getVal(latestPeriod, m.id)
                    return (
                      <div
                        key={m.id}
                        className="rounded-lg border border-border/40 p-4"
                      >
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {m.label}
                        </p>
                        <p className="mt-1 font-serif text-2xl font-bold tabular-nums text-foreground">
                          {val.toLocaleString()}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                          {m.unit}
                        </p>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Trend table */}
            {periodsWithData.length > 1 && (
              <div style={{ breakInside: 'avoid' }}>
                <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
                  Trends Over Time
                </h2>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/30">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Metric
                        </th>
                        {periodsWithData.map((p) => (
                          <th
                            key={p.id}
                            className="px-4 py-3 text-right font-medium text-muted-foreground"
                          >
                            {p.label}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics
                        .filter((m) => getVal(latestPeriod, m.id) > 0)
                        .map((m, i, arr) => {
                          const latest = getVal(latestPeriod, m.id)
                          const oldest = getVal(
                            periodsWithData[periodsWithData.length - 1],
                            m.id,
                          )
                          const pct =
                            oldest > 0
                              ? Math.round(((latest - oldest) / oldest) * 100)
                              : 0
                          return (
                            <tr
                              key={m.id}
                              className={
                                i < arr.length - 1
                                  ? 'border-b border-border/20'
                                  : ''
                              }
                            >
                              <td className="px-4 py-3 text-foreground">
                                {m.label}
                              </td>
                              {periodsWithData.map((p) => (
                                <td
                                  key={p.id}
                                  className="px-4 py-3 text-right tabular-nums text-foreground"
                                >
                                  {getVal(p, m.id).toLocaleString()}
                                </td>
                              ))}
                              <td
                                className={`px-4 py-3 text-right text-xs font-medium ${
                                  pct > 0
                                    ? 'text-emerald-600'
                                    : pct < 0
                                      ? 'text-red-500'
                                      : 'text-muted-foreground'
                                }`}
                              >
                                {pct > 0 ? '+' : ''}
                                {pct}%
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Discussion prompts */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-6 print:border-0 print:bg-transparent print:p-0" style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                Discussion Points
              </h2>
              <NarrativeTextarea
                sectionKey="board-presentation:discussion"
                placeholder={"• Key achievement or milestone to celebrate\n• Challenge or area needing board input\n• Strategic question or decision point\n• Resource needs or upcoming opportunities"}
                narratives={narratives}
                generatedText={generateDiscussionPoints(metrics, periodsWithData)}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
          <p>
            Generated by{' '}
            <span className="font-medium text-foreground">GrantLink</span> ·
            Impact Measurement Tools for Nonprofits
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .report-content,
          .report-content * {
            visibility: visible !important;
          }
          .report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .report-content textarea {
            border: none !important;
            resize: none !important;
            overflow: visible !important;
            height: auto !important;
          }
          .report-content textarea:empty,
          .report-content textarea:placeholder-shown {
            display: none !important;
          }
          table {
            break-inside: avoid;
          }
          @page {
            margin: 0.75in;
          }
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
