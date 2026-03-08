/**
 * Impact Analytics Engine
 *
 * Pure functions that take metrics, periods, and targets as input
 * and return structured insights. No React, no side effects.
 */

import type { MetricDefinition } from '@/lib/impact-metrics'
import type { PeriodData } from '@/lib/impact-storage'
import type { MetricTarget } from '@/lib/impact-targets'

// ── Types ────────────────────────────────────────────────────────────

export type InsightType = 'performance' | 'readiness' | 'trend'
export type InsightSeverity = 'positive' | 'neutral' | 'warning' | 'critical'
export type OverallHealth = 'strong' | 'steady' | 'needs-attention'

export interface Insight {
  type: InsightType
  severity: InsightSeverity
  title: string
  description: string
  action?: string
  metricId?: string
  value?: number
  change?: number // percentage change
}

export interface TargetProgress {
  metricId: string
  metricLabel: string
  actual: number
  target: number
  pct: number // 0–100+
  note?: string
}

export interface AnalyticsSummary {
  // Program Performance
  topPerformers: Insight[]
  underperformers: Insight[]
  overallHealth: OverallHealth

  // Funder Readiness
  targetProgress: TargetProgress[]
  dataCompleteness: number // 0–100
  metricsWithTargets: number
  metricsOnTrack: number

  // Trends (3+ periods)
  trendingUp: Insight[]
  trendingDown: Insight[]

  // Period count for UI decisions
  periodCount: number
}

// ── Helpers ──────────────────────────────────────────────────────────

function getValueForMetric(period: PeriodData, metricId: string): number {
  return period.entries.find((e) => e.metricId === metricId)?.value ?? 0
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function formatPct(n: number): string {
  return `${n > 0 ? '+' : ''}${n}%`
}

// Simple linear slope across an array of numbers
function linearSlope(values: number[]): number {
  if (values.length < 2) return 0
  const n = values.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return 0
  return (n * sumXY - sumX * sumY) / denom
}

// ── Performance Insights ─────────────────────────────────────────────

function computePerformanceInsights(
  metrics: MetricDefinition[],
  periods: PeriodData[],
): { topPerformers: Insight[]; underperformers: Insight[] } {
  const topPerformers: Insight[] = []
  const underperformers: Insight[] = []

  if (periods.length < 2) {
    // With only one period, report on which metrics have data vs don't
    if (periods.length === 1) {
      const period = periods[0]
      const withData = metrics.filter((m) => getValueForMetric(period, m.id) > 0)
      const withoutData = metrics.filter((m) => getValueForMetric(period, m.id) === 0)

      if (withData.length > 0) {
        const top = withData
          .map((m) => ({ m, val: getValueForMetric(period, m.id) }))
          .sort((a, b) => b.val - a.val)[0]

        topPerformers.push({
          type: 'performance',
          severity: 'positive',
          title: `${top.m.label}: ${top.val.toLocaleString()} ${top.m.unit}`,
          description: `Your highest-value metric this period.`,
          action: 'Highlight this result in your next funder report.',
          metricId: top.m.id,
          value: top.val,
        })
      }

      if (withoutData.length > 0) {
        underperformers.push({
          type: 'performance',
          severity: 'warning',
          title: `${withoutData.length} metric${withoutData.length === 1 ? '' : 's'} with no data`,
          description: `You haven't entered data for ${withoutData.length} of ${metrics.length} metrics.`,
          action: 'Entering data regularly strengthens your reporting and funder applications.',
        })
      }
    }

    return { topPerformers, underperformers }
  }

  // Compare latest (periods[0]) to previous (periods[1])
  const latest = periods[0]
  const previous = periods[1]

  const changes = metrics
    .map((m) => {
      const cur = getValueForMetric(latest, m.id)
      const prev = getValueForMetric(previous, m.id)
      const change = pctChange(cur, prev)
      return { metric: m, cur, prev, change }
    })
    .filter((c) => c.cur > 0 || c.prev > 0) // only metrics with any data

  // Sort by change descending for top, ascending for under
  const sorted = [...changes].sort((a, b) => b.change - a.change)

  // Top 3 performers
  for (const c of sorted.slice(0, 3)) {
    if (c.change > 0) {
      topPerformers.push({
        type: 'performance',
        severity: 'positive',
        title: `${c.metric.label} up ${formatPct(c.change)}`,
        description: `Increased from ${c.prev.toLocaleString()} to ${c.cur.toLocaleString()} ${c.metric.unit}.`,
        action: c.change >= 20
          ? `Strong result. Consider highlighting ${c.metric.label.toLowerCase()} in your next funder report.`
          : undefined,
        metricId: c.metric.id,
        value: c.cur,
        change: c.change,
      })
    } else if (c.change === 0 && c.cur > 0) {
      topPerformers.push({
        type: 'performance',
        severity: 'neutral',
        title: `${c.metric.label} holding steady`,
        description: `Remained at ${c.cur.toLocaleString()} ${c.metric.unit}.`,
        metricId: c.metric.id,
        value: c.cur,
        change: 0,
      })
    }
  }

  // Bottom performers (declining or stalled at 0)
  const declining = sorted.filter((c) => c.change < 0).reverse()
  for (const c of declining.slice(0, 3)) {
    underperformers.push({
      type: 'performance',
      severity: c.change <= -20 ? 'critical' : 'warning',
      title: `${c.metric.label} down ${formatPct(c.change)}`,
      description: `Decreased from ${c.prev.toLocaleString()} to ${c.cur.toLocaleString()} ${c.metric.unit}.`,
      action: `Consider reviewing program delivery for ${c.metric.label.toLowerCase()}. Is there a staffing or resource gap?`,
      metricId: c.metric.id,
      value: c.cur,
      change: c.change,
    })
  }

  return { topPerformers, underperformers }
}

// ── Funder Readiness ─────────────────────────────────────────────────

function computeReadiness(
  metrics: MetricDefinition[],
  periods: PeriodData[],
  targets: MetricTarget[],
): {
  targetProgress: TargetProgress[]
  dataCompleteness: number
  metricsWithTargets: number
  metricsOnTrack: number
} {
  const latest = periods[0] ?? null

  // Data completeness: % of metrics with data > 0 in latest period
  const filled = latest
    ? metrics.filter((m) => getValueForMetric(latest, m.id) > 0).length
    : 0
  const dataCompleteness = metrics.length > 0
    ? Math.round((filled / metrics.length) * 100)
    : 0

  // Target progress
  const targetProgressRaw = targets
    .map((t) => {
      const metric = metrics.find((m) => m.id === t.metricId)
      if (!metric) return null
      const actual = latest ? getValueForMetric(latest, t.metricId) : 0
      const pct = t.targetValue > 0 ? Math.round((actual / t.targetValue) * 100) : 0
      return {
        metricId: t.metricId,
        metricLabel: metric.label,
        actual,
        target: t.targetValue,
        pct,
        note: t.note,
      } as TargetProgress
    })
    .filter((tp): tp is TargetProgress => tp !== null)
  const targetProgress = targetProgressRaw.sort((a, b) => a.pct - b.pct) // lowest progress first

  const metricsOnTrack = targetProgress.filter((tp) => tp.pct >= 100).length

  return {
    targetProgress,
    dataCompleteness,
    metricsWithTargets: targetProgress.length,
    metricsOnTrack,
  }
}

// ── Trend Detection ──────────────────────────────────────────────────

function computeTrends(
  metrics: MetricDefinition[],
  periods: PeriodData[],
): { trendingUp: Insight[]; trendingDown: Insight[] } {
  const trendingUp: Insight[] = []
  const trendingDown: Insight[] = []

  if (periods.length < 3) return { trendingUp, trendingDown }

  // Periods are newest-first; reverse for chronological analysis
  const chronological = [...periods].reverse()

  for (const m of metrics) {
    const values = chronological.map((p) => getValueForMetric(p, m.id))
    const hasData = values.some((v) => v > 0)
    if (!hasData) continue

    const slope = linearSlope(values)
    const first = values[0]
    const last = values[values.length - 1]
    const overallChange = pctChange(last, first)

    // Require meaningful slope + overall change
    if (slope > 0 && overallChange > 5) {
      trendingUp.push({
        type: 'trend',
        severity: 'positive',
        title: `${m.label} trending upward`,
        description: `Grew ${formatPct(overallChange)} across ${periods.length} periods (${chronological[0].label} → ${chronological[chronological.length - 1].label}).`,
        action: overallChange >= 30
          ? `Exceptional growth. Use this trend in grant applications to demonstrate momentum.`
          : undefined,
        metricId: m.id,
        value: last,
        change: overallChange,
      })
    } else if (slope < 0 && overallChange < -5) {
      trendingDown.push({
        type: 'trend',
        severity: overallChange <= -20 ? 'critical' : 'warning',
        title: `${m.label} trending downward`,
        description: `Declined ${formatPct(overallChange)} across ${periods.length} periods.`,
        action: `Investigate what's driving the decline in ${m.label.toLowerCase()}. Check if external factors, funding, or staffing have changed.`,
        metricId: m.id,
        value: last,
        change: overallChange,
      })
    }
  }

  // Sort by magnitude of change
  trendingUp.sort((a, b) => (b.change ?? 0) - (a.change ?? 0))
  trendingDown.sort((a, b) => (a.change ?? 0) - (b.change ?? 0))

  // Limit to top 5 each
  return {
    trendingUp: trendingUp.slice(0, 5),
    trendingDown: trendingDown.slice(0, 5),
  }
}

// ── Overall Health ───────────────────────────────────────────────────

function computeOverallHealth(
  topPerformers: Insight[],
  underperformers: Insight[],
  trendingDown: Insight[],
  dataCompleteness: number,
  targetProgress: TargetProgress[],
): OverallHealth {
  const criticalCount = [
    ...underperformers.filter((i) => i.severity === 'critical'),
    ...trendingDown.filter((i) => i.severity === 'critical'),
  ].length

  const behindTargets = targetProgress.filter((tp) => tp.pct < 50).length

  if (criticalCount >= 2 || dataCompleteness < 30 || behindTargets >= 3) {
    return 'needs-attention'
  }

  if (
    topPerformers.length >= 2 &&
    underperformers.filter((i) => i.severity === 'critical').length === 0 &&
    dataCompleteness >= 70
  ) {
    return 'strong'
  }

  return 'steady'
}

// ── Main Entry Point ─────────────────────────────────────────────────

export function generateAnalytics(
  metrics: MetricDefinition[],
  periods: PeriodData[],
  targets: MetricTarget[],
): AnalyticsSummary {
  const { topPerformers, underperformers } = computePerformanceInsights(metrics, periods)
  const { targetProgress, dataCompleteness, metricsWithTargets, metricsOnTrack } =
    computeReadiness(metrics, periods, targets)
  const { trendingUp, trendingDown } = computeTrends(metrics, periods)

  const overallHealth = computeOverallHealth(
    topPerformers,
    underperformers,
    trendingDown,
    dataCompleteness,
    targetProgress,
  )

  return {
    topPerformers,
    underperformers,
    overallHealth,
    targetProgress,
    dataCompleteness,
    metricsWithTargets,
    metricsOnTrack,
    trendingUp,
    trendingDown,
    periodCount: periods.length,
  }
}
