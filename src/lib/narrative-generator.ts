/**
 * Narrative Generator — rule-based first-draft text for impact reports
 *
 * Analyses metric data to produce human-readable summaries for each
 * report template section. Users can edit the generated text.
 */

import { type MetricDefinition, type MetricCategory, CATEGORY_LABELS } from './impact-metrics'
import { type PeriodData } from './impact-storage'

// ── Helpers ──────────────────────────────────────────────────────

function getVal(period: PeriodData | undefined, metricId: string): number {
  if (!period) return 0
  return period.entries.find((e) => e.metricId === metricId)?.value ?? 0
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

function formatNum(n: number): string {
  return n.toLocaleString()
}

interface MetricSummary {
  metric: MetricDefinition
  current: number
  previous: number
  change: number | null
}

function buildSummaries(
  metrics: MetricDefinition[],
  latest: PeriodData,
  previous?: PeriodData,
): MetricSummary[] {
  return metrics
    .map((m) => {
      const current = getVal(latest, m.id)
      const prev = getVal(previous, m.id)
      return { metric: m, current, previous: prev, change: pctChange(current, prev) }
    })
    .filter((s) => s.current > 0)
}

function topN(summaries: MetricSummary[], n: number): MetricSummary[] {
  return [...summaries].sort((a, b) => b.current - a.current).slice(0, n)
}

function biggestGains(summaries: MetricSummary[]): MetricSummary[] {
  return summaries
    .filter((s) => s.change !== null && s.change > 0)
    .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))
}

function declines(summaries: MetricSummary[]): MetricSummary[] {
  return summaries
    .filter((s) => s.change !== null && s.change < 0)
    .sort((a, b) => (a.change ?? 0) - (b.change ?? 0))
}

function byCategory(summaries: MetricSummary[], cat: MetricCategory): MetricSummary[] {
  return summaries.filter((s) => s.metric.category === cat)
}

function notesFromPeriod(period: PeriodData): string[] {
  return period.entries
    .filter((e) => e.note && e.note.trim().length > 0)
    .map((e) => e.note as string)
}

// ── Impact Report Narratives ─────────────────────────────────────

export function generateExecutiveSummary(
  orgName: string,
  issueArea: string,
  metrics: MetricDefinition[],
  periodsWithData: PeriodData[],
): string {
  if (periodsWithData.length === 0) return ''
  const latest = periodsWithData[0]
  const previous = periodsWithData[1]
  const summaries = buildSummaries(metrics, latest, previous)
  if (summaries.length === 0) return ''

  const top = topN(summaries, 3)
  const outputs = byCategory(summaries, 'output')
  const outcomes = byCategory(summaries, 'outcome')
  const gains = biggestGains(summaries)
  const notes = notesFromPeriod(latest)

  const lines: string[] = []

  // Opening
  lines.push(
    `During ${latest.label}, ${orgName} continued its ${issueArea.toLowerCase()} work, serving the community across ${summaries.length} tracked indicators.`,
  )

  // Highlights
  if (top.length > 0) {
    lines.push('')
    lines.push('Key highlights for this period:')
    for (const s of top) {
      const changeNote = s.change !== null && s.change !== 0
        ? `, ${s.change > 0 ? 'up' : 'down'} ${Math.abs(s.change)}% from the prior period`
        : ''
      lines.push(`• ${s.metric.label}: ${formatNum(s.current)} ${s.metric.unit}${changeNote}`)
    }
  }

  // Outcomes focus
  if (outcomes.length > 0) {
    lines.push('')
    const outcomeTop = topN(outcomes, 2)
    lines.push(
      `On the outcomes front, ${outcomeTop.map((s) => `${formatNum(s.current)} ${s.metric.unit} in ${s.metric.label.toLowerCase()}`).join(' and ')}.`,
    )
  }

  // Growth areas
  if (gains.length > 0) {
    lines.push('')
    const topGain = gains[0]
    lines.push(
      `The strongest growth area was ${topGain.metric.label.toLowerCase()}, which increased ${topGain.change}% compared to the prior period.`,
    )
  }

  // Context from notes
  if (notes.length > 0) {
    lines.push('')
    lines.push(`Additional context: ${notes[0]}`)
  }

  // Output count
  if (outputs.length > 0) {
    const totalOutputValue = outputs.reduce((sum, s) => sum + s.current, 0)
    lines.push('')
    lines.push(
      `Across all ${CATEGORY_LABELS.output.toLowerCase()}, ${orgName} recorded a combined ${formatNum(totalOutputValue)} units of direct service delivery.`,
    )
  }

  return lines.join('\n')
}

export function generateLookingAhead(
  orgName: string,
  metrics: MetricDefinition[],
  periodsWithData: PeriodData[],
): string {
  if (periodsWithData.length === 0) return ''
  const latest = periodsWithData[0]
  const previous = periodsWithData[1]
  const summaries = buildSummaries(metrics, latest, previous)
  const declining = declines(summaries)
  const gains = biggestGains(summaries)

  const lines: string[] = []

  lines.push(`Looking ahead, ${orgName} plans to build on the momentum of ${latest.label}.`)

  if (gains.length > 0) {
    lines.push('')
    lines.push('Areas of strength to continue:')
    for (const s of gains.slice(0, 3)) {
      lines.push(`• ${s.metric.label} — grew ${s.change}% and we aim to sustain this trajectory`)
    }
  }

  if (declining.length > 0) {
    lines.push('')
    lines.push('Areas to focus on improving:')
    for (const s of declining.slice(0, 2)) {
      lines.push(`• ${s.metric.label} — declined ${Math.abs(s.change ?? 0)}%, which we plan to address through targeted efforts`)
    }
  }

  if (gains.length === 0 && declining.length === 0) {
    lines.push('')
    lines.push('With continued investment, we expect to see growth across our key indicators in the coming period.')
  }

  return lines.join('\n')
}

// ── Donor Update Narratives ──────────────────────────────────────

export function generateDonorGreeting(
  orgName: string,
  issueArea: string,
  metrics: MetricDefinition[],
  periodsWithData: PeriodData[],
): string {
  if (periodsWithData.length === 0) return ''
  const latest = periodsWithData[0]
  const summaries = buildSummaries(metrics, latest)
  const top = topN(summaries, 2)

  const lines: string[] = []

  lines.push(
    `Thank you for your continued support of ${orgName}. Your generosity makes our ${issueArea.toLowerCase()} work possible, and we're excited to share what we've accomplished during ${latest.label}.`,
  )

  if (top.length > 0) {
    lines.push('')
    lines.push(
      `Thanks to supporters like you, we reached ${top.map((s) => `${formatNum(s.current)} ${s.metric.unit} in ${s.metric.label.toLowerCase()}`).join(' and ')} this period.`,
    )
  }

  return lines.join('\n')
}

export function generateImpactStory(
  metrics: MetricDefinition[],
  periodsWithData: PeriodData[],
): string {
  if (periodsWithData.length === 0) return ''
  const latest = periodsWithData[0]
  const summaries = buildSummaries(metrics, latest)
  const notes = notesFromPeriod(latest)
  const outcomes = byCategory(summaries, 'outcome')

  const lines: string[] = []

  if (notes.length > 0) {
    lines.push(`From our team's notes: "${notes[0]}"`)
    lines.push('')
  }

  if (outcomes.length > 0) {
    const topOutcome = topN(outcomes, 1)[0]
    lines.push(
      `Behind the numbers, each of the ${formatNum(topOutcome.current)} ${topOutcome.metric.unit} in ${topOutcome.metric.label.toLowerCase()} represents a real person whose life was touched by this work.`,
    )
    lines.push('')
  }

  lines.push('[Tip: Replace or expand this section with a specific story about someone your programs helped — with their permission. Personal stories bring data to life for donors.]')

  return lines.join('\n')
}

export function generateThankYou(orgName: string): string {
  return `We are deeply grateful for your partnership. Every contribution — of time, resources, or funding — directly supports the communities we serve.\n\nIf you'd like to learn more, visit us or reach out to discuss how your support is making a difference. Together, we're building something lasting.\n\nWith gratitude,\nThe ${orgName} Team`
}

// ── Board Presentation Narratives ────────────────────────────────

export function generateDiscussionPoints(
  metrics: MetricDefinition[],
  periodsWithData: PeriodData[],
): string {
  if (periodsWithData.length === 0) return ''
  const latest = periodsWithData[0]
  const previous = periodsWithData[1]
  const summaries = buildSummaries(metrics, latest, previous)
  const gains = biggestGains(summaries)
  const declining = declines(summaries)
  const top = topN(summaries, 1)

  const lines: string[] = []

  if (top.length > 0) {
    lines.push(`• Milestone: ${top[0].metric.label} reached ${formatNum(top[0].current)} ${top[0].metric.unit} this period`)
  }

  if (gains.length > 0) {
    lines.push(`• Growth: ${gains[0].metric.label} increased ${gains[0].change}% — what's driving this and how can we sustain it?`)
  }

  if (declining.length > 0) {
    lines.push(`• Attention needed: ${declining[0].metric.label} declined ${Math.abs(declining[0].change ?? 0)}% — what resources or changes are needed?`)
  }

  lines.push('• Strategic question: Are our current metrics capturing the full picture of our impact?')
  lines.push('• Resource needs: [Add any upcoming budget, staffing, or partnership needs]')

  return lines.join('\n')
}
