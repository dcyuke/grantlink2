'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Activity,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MetricDefinition } from '@/lib/impact-metrics'
import type { PeriodData } from '@/lib/impact-storage'
import {
  generateAnalytics,
  type AnalyticsSummary,
  type Insight,
  type InsightSeverity,
  type OverallHealth,
  type TargetProgress,
} from '@/lib/impact-analytics'
import {
  getImpactTargets,
  IMPACT_TARGETS_EVENT,
  type MetricTarget,
} from '@/lib/impact-targets'
import { TargetEditor } from '@/components/impact/target-editor'

// ── Props ─────────────────────────────────────────────────────────────

interface AnalyticsPanelProps {
  metrics: MetricDefinition[]
  periods: PeriodData[]
}

// ── Health badge config ───────────────────────────────────────────────

const HEALTH_CONFIG: Record<
  OverallHealth,
  { label: string; description: string; bg: string; text: string; icon: typeof CheckCircle2 }
> = {
  strong: {
    label: 'Strong',
    description: 'Your impact data shows healthy progress across key metrics.',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: CheckCircle2,
  },
  steady: {
    label: 'Steady',
    description: 'Your program is progressing — keep tracking to build momentum.',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: Activity,
  },
  'needs-attention': {
    label: 'Needs Attention',
    description: 'Some metrics are declining or missing data. Review areas flagged below.',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: AlertTriangle,
  },
}

// ── Severity colors ───────────────────────────────────────────────────

function severityBorder(s: InsightSeverity): string {
  switch (s) {
    case 'positive':
      return 'border-l-emerald-500'
    case 'neutral':
      return 'border-l-blue-400'
    case 'warning':
      return 'border-l-amber-400'
    case 'critical':
      return 'border-l-red-500'
  }
}

function severityIcon(s: InsightSeverity) {
  switch (s) {
    case 'positive':
      return <TrendingUp className="h-4 w-4 text-emerald-600" />
    case 'neutral':
      return <Info className="h-4 w-4 text-blue-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
  }
}

function progressColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}

function progressLabel(pct: number): string {
  if (pct >= 100) return 'text-emerald-700'
  if (pct >= 50) return 'text-amber-700'
  return 'text-red-600'
}

// ── Component ─────────────────────────────────────────────────────────

type TabView = 'snapshot' | 'trends'

export function AnalyticsPanel({ metrics, periods }: AnalyticsPanelProps) {
  const [targets, setTargets] = useState<MetricTarget[]>([])
  const [tab, setTab] = useState<TabView>('snapshot')
  const [showTargetEditor, setShowTargetEditor] = useState(false)

  // Load targets from localStorage
  useEffect(() => {
    const load = () => {
      const stored = getImpactTargets()
      setTargets(stored?.targets ?? [])
    }
    load()
    window.addEventListener(IMPACT_TARGETS_EVENT, load)
    return () => window.removeEventListener(IMPACT_TARGETS_EVENT, load)
  }, [])

  // Generate analytics
  const analytics: AnalyticsSummary = useMemo(
    () => generateAnalytics(metrics, periods, targets),
    [metrics, periods, targets],
  )

  // Nothing to show if there's no data at all
  const hasAnyData = periods.some((p) => p.entries.some((e) => e.value > 0))
  if (periods.length === 0 || !hasAnyData) return null

  const hasTrendData = analytics.periodCount >= 3
  const latestPeriod = periods[0] ?? null

  // Combine insights for display
  const snapshotInsights: Insight[] = [
    ...analytics.topPerformers,
    ...analytics.underperformers,
  ]

  const trendInsights: Insight[] = [
    ...analytics.trendingUp,
    ...analytics.trendingDown,
  ]

  const health = HEALTH_CONFIG[analytics.overallHealth]
  const HealthIcon = health.icon

  return (
    <div className="mb-10 space-y-4">
      {/* Section heading */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Analytics &amp; Insights
        </h2>
      </div>

      {/* Overall health badge */}
      <div className={`flex items-start gap-3 rounded-lg ${health.bg} px-4 py-3`}>
        <HealthIcon className={`mt-0.5 h-5 w-5 shrink-0 ${health.text}`} />
        <div>
          <p className={`text-sm font-semibold ${health.text}`}>
            Program Health: {health.label}
          </p>
          <p className={`text-xs ${health.text} opacity-80`}>
            {health.description} Based on {analytics.periodCount}{' '}
            {analytics.periodCount === 1 ? 'period' : 'periods'} and{' '}
            {metrics.length} metrics.
          </p>
        </div>
      </div>

      {/* Snapshot / Trends toggle (only if 3+ periods) */}
      {hasTrendData && (
        <div className="flex gap-1 rounded-full border border-border/60 bg-card/80 p-1 w-fit">
          <button
            onClick={() => setTab('snapshot')}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              tab === 'snapshot'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Latest Period
          </button>
          <button
            onClick={() => setTab('trends')}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              tab === 'trends'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Trends Over Time
          </button>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Funder Readiness card */}
        <FunderReadinessCard
          analytics={analytics}
          showTargetEditor={showTargetEditor}
          onToggleTargetEditor={() => setShowTargetEditor((v) => !v)}
        />

        {/* Insights card */}
        <div className="rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="border-b border-border/40 px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              {tab === 'trends' ? 'Trend Insights' : 'Key Insights'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tab === 'trends'
                ? `Patterns across ${analytics.periodCount} reporting periods`
                : 'Performance highlights from your latest data'}
            </p>
          </div>
          <div className="divide-y divide-border/20 px-2 py-1">
            {(tab === 'trends' ? trendInsights : snapshotInsights).length === 0 ? (
              <div className="px-3 py-6 text-center">
                <Info className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  {tab === 'trends'
                    ? 'Need 3+ periods with data to detect trends. Keep entering data!'
                    : 'Enter data for more metrics to generate insights.'}
                </p>
              </div>
            ) : (
              (tab === 'trends' ? trendInsights : snapshotInsights).map(
                (insight, idx) => (
                  <InsightRow key={`${insight.metricId ?? ''}-${idx}`} insight={insight} />
                ),
              )
            )}
          </div>
        </div>
      </div>

      {/* Target editor (slides in below when open) */}
      {showTargetEditor && (
        <TargetEditor
          metrics={metrics}
          latestPeriod={latestPeriod}
          onClose={() => setShowTargetEditor(false)}
        />
      )}
    </div>
  )
}

// ── Funder Readiness Card ─────────────────────────────────────────────

function FunderReadinessCard({
  analytics,
  showTargetEditor,
  onToggleTargetEditor,
}: {
  analytics: AnalyticsSummary
  showTargetEditor: boolean
  onToggleTargetEditor: () => void
}) {
  const hasTargets = analytics.metricsWithTargets > 0

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Funder Readiness</h3>
          <p className="text-xs text-muted-foreground">
            Data completeness and target progress
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={onToggleTargetEditor}
        >
          <Target className="h-3 w-3" />
          {showTargetEditor ? 'Close' : hasTargets ? 'Edit Targets' : 'Set Targets'}
        </Button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Data completeness */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Data Completeness</span>
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {analytics.dataCompleteness}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                analytics.dataCompleteness >= 80
                  ? 'bg-emerald-500'
                  : analytics.dataCompleteness >= 50
                    ? 'bg-amber-400'
                    : 'bg-red-400'
              }`}
              style={{ width: `${analytics.dataCompleteness}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            {analytics.dataCompleteness < 100
              ? 'Fill in more metrics to strengthen your funder reports.'
              : 'All metrics have data — great for reporting!'}
          </p>
        </div>

        {/* Target progress */}
        {hasTargets ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Target Progress</span>
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{analytics.metricsOnTrack}</span>{' '}
                of {analytics.metricsWithTargets} on track
              </span>
            </div>
            {analytics.targetProgress.map((tp) => (
              <TargetProgressRow key={tp.metricId} progress={tp} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/40 px-4 py-5 text-center">
            <Target className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              No targets set yet
            </p>
            <p className="mb-3 text-[11px] text-muted-foreground/70">
              Set targets to track grant milestones and measure progress toward funder commitments.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={onToggleTargetEditor}
            >
              <Target className="h-3 w-3" />
              Set Targets
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Target Progress Row ───────────────────────────────────────────────

function TargetProgressRow({ progress }: { progress: TargetProgress }) {
  const cappedPct = Math.min(progress.pct, 100)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-foreground">{progress.metricLabel}</span>
        <span className={`text-xs font-medium tabular-nums ${progressLabel(progress.pct)}`}>
          {progress.actual.toLocaleString()} / {progress.target.toLocaleString()}
          <span className="ml-1 text-muted-foreground">({progress.pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor(progress.pct)}`}
          style={{ width: `${cappedPct}%` }}
        />
      </div>
      {progress.note && (
        <p className="mt-0.5 text-[11px] text-muted-foreground/60 italic">{progress.note}</p>
      )}
    </div>
  )
}

// ── Insight Row ───────────────────────────────────────────────────────

function InsightRow({ insight }: { insight: Insight }) {
  return (
    <div
      className={`border-l-[3px] ${severityBorder(insight.severity)} rounded-r-lg px-3 py-2.5 mx-1 my-1`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{severityIcon(insight.severity)}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{insight.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {insight.description}
          </p>
          {insight.action && (
            <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-muted/40 px-2 py-1.5">
              <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/80">Suggested Action:</span>{' '}
                {insight.action}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
