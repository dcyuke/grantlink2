import { METRIC_FRAMEWORKS, type IssueAreaFramework } from '@/lib/impact-metrics'
import type { IssueAreaMatch } from './types'

/**
 * Attempt to match column headers against the 20 impact issue area frameworks.
 * Uses fuzzy keyword matching + metric label comparison.
 * Returns the best match if confidence > threshold, else null.
 */
export function detectIssueArea(
  headers: string[],
  sampleValues: Record<string, unknown>[]
): IssueAreaMatch | null {
  const headersLower = headers.map((h) => h.toLowerCase().trim())
  let bestMatch: IssueAreaMatch | null = null
  let bestScore = 0

  for (const framework of METRIC_FRAMEWORKS) {
    const { score, matchedMetrics } = scoreFramework(framework, headersLower, sampleValues)

    if (score > bestScore) {
      bestScore = score
      bestMatch = {
        slug: framework.slug,
        name: framework.name,
        confidence: Math.min(score, 1),
        matchedMetrics,
      }
    }
  }

  // Only return if confidence > 0.3
  if (bestMatch && bestMatch.confidence > 0.3) {
    return bestMatch
  }

  return null
}

function scoreFramework(
  framework: IssueAreaFramework,
  headersLower: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _sampleValues: Record<string, unknown>[]
): { score: number; matchedMetrics: { metricId: string; columnHeader: string }[] } {
  const matchedMetrics: { metricId: string; columnHeader: string }[] = []
  let totalScore = 0

  for (const metric of framework.metrics) {
    const metricLabel = metric.label.toLowerCase()
    const metricWords = metricLabel.split(/\s+/)

    for (const header of headersLower) {
      // Direct match (exact or contains)
      if (header === metricLabel || header.includes(metricLabel) || metricLabel.includes(header)) {
        matchedMetrics.push({ metricId: metric.id, columnHeader: header })
        totalScore += 1
        break
      }

      // Word overlap score
      const headerWords = header.split(/[\s_-]+/)
      const overlap = metricWords.filter((w) =>
        headerWords.some((hw) => hw === w || (w.length > 3 && hw.includes(w)))
      ).length

      if (overlap >= 2 || (overlap === 1 && metricWords.length <= 2)) {
        const wordScore = overlap / metricWords.length
        if (wordScore >= 0.5) {
          matchedMetrics.push({ metricId: metric.id, columnHeader: header })
          totalScore += wordScore
          break
        }
      }

      // Check metric ID in header (e.g., "edu-students-served")
      if (header.replace(/[\s_]/g, '-') === metric.id) {
        matchedMetrics.push({ metricId: metric.id, columnHeader: header })
        totalScore += 1
        break
      }
    }
  }

  // Normalize: ratio of matched metrics to total metrics in framework
  const normalizedScore = framework.metrics.length > 0
    ? totalScore / framework.metrics.length
    : 0

  return { score: normalizedScore, matchedMetrics }
}
