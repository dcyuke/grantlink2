import type { ColumnDetection, ColumnType } from './types'
import { METRIC_FRAMEWORKS } from '@/lib/impact-metrics'

// ── Keyword dictionaries ──────────────────────────────────────────

const DATE_KEYWORDS = ['date', 'year', 'month', 'quarter', 'period', 'time', 'fiscal', 'fy']
const CURRENCY_KEYWORDS = ['revenue', 'budget', 'cost', 'funding', 'grant', 'amount', 'dollar', 'spent', 'income', 'expense', 'salary', 'wage', 'price', 'fee']
const PERCENTAGE_KEYWORDS = ['rate', 'percent', 'pct', 'ratio', 'completion', 'retention', 'satisfaction']
const ID_KEYWORDS = ['id', 'code', 'number', 'ref', 'identifier']
const CATEGORY_KEYWORDS = ['type', 'category', 'status', 'name', 'program', 'region', 'area', 'department', 'location', 'gender', 'race', 'ethnicity', 'age group']
const METRIC_KEYWORDS = ['count', 'total', 'served', 'enrolled', 'participants', 'hours', 'sessions', 'events', 'visits', 'clients', 'students', 'patients', 'units', 'meals', 'beds']

// ── Date patterns ──────────────────────────────────────────────────

const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,                  // 2024-01-15
  /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,          // 1/15/2024
  /^Q[1-4]\s*\d{4}$/i,                     // Q1 2024
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}$/i, // January 2024
  /^\d{4}$/,                               // 2024 (year only)
  /^FY\s*\d{2,4}$/i,                       // FY2024
  /^\d{4}-Q[1-4]$/i,                       // 2024-Q1
]

const CURRENCY_PATTERN = /^\$[\d,]+(\.\d{1,2})?$/
const PERCENTAGE_PATTERN = /^\d+(\.\d+)?%$/

/**
 * Detect the type of each column using keyword scoring + value pattern analysis.
 * Returns one ColumnDetection per header.
 */
export function detectColumns(
  headers: string[],
  rows: Record<string, unknown>[]
): ColumnDetection[] {
  // Build a flat lookup of all metric labels from all frameworks
  const metricLabelMap = new Map<string, { id: string; unit: string }>()
  for (const framework of METRIC_FRAMEWORKS) {
    for (const metric of framework.metrics) {
      metricLabelMap.set(metric.label.toLowerCase(), { id: metric.id, unit: metric.unit })
    }
  }

  return headers.map((header, index) => {
    const headerLower = header.toLowerCase().trim()
    const values = sampleValues(rows, header, 20)

    // Score each type
    const scores: Record<ColumnType, number> = {
      date: 0,
      currency: 0,
      percentage: 0,
      id: 0,
      category: 0,
      metric: 0,
      text: 0,
      unknown: 0,
    }

    // ── Header keyword matching (weight: 0.4) ──
    const HEADER_WEIGHT = 0.4

    if (matchesKeywords(headerLower, DATE_KEYWORDS)) scores.date += HEADER_WEIGHT
    if (matchesKeywords(headerLower, CURRENCY_KEYWORDS)) scores.currency += HEADER_WEIGHT
    if (headerLower.includes('%') || matchesKeywords(headerLower, PERCENTAGE_KEYWORDS)) scores.percentage += HEADER_WEIGHT
    if (matchesKeywords(headerLower, ID_KEYWORDS)) scores.id += HEADER_WEIGHT
    if (matchesKeywords(headerLower, CATEGORY_KEYWORDS)) scores.category += HEADER_WEIGHT
    if (matchesKeywords(headerLower, METRIC_KEYWORDS)) scores.metric += HEADER_WEIGHT

    // ── Value pattern analysis (weight: 0.6) ──
    const VALUE_WEIGHT = 0.6

    if (values.length > 0) {
      const dateCount = values.filter((v) => isDateValue(String(v))).length
      const currencyCount = values.filter((v) => CURRENCY_PATTERN.test(String(v))).length
      const percentageCount = values.filter((v) => PERCENTAGE_PATTERN.test(String(v))).length
      const numericCount = values.filter((v) => isNumeric(v)).length
      const uniqueValues = new Set(values.map((v) => String(v).toLowerCase()))

      const ratio = (count: number) => count / values.length

      if (ratio(dateCount) > 0.5) scores.date += VALUE_WEIGHT * ratio(dateCount)
      if (ratio(currencyCount) > 0.3) scores.currency += VALUE_WEIGHT * ratio(currencyCount)
      if (ratio(percentageCount) > 0.3) scores.percentage += VALUE_WEIGHT * ratio(percentageCount)

      if (ratio(numericCount) > 0.7) {
        // Numeric column — could be metric or currency
        if (scores.currency < 0.3) scores.metric += VALUE_WEIGHT * ratio(numericCount)
      }

      // Categorical: few unique values relative to total
      if (uniqueValues.size <= 20 && values.length > 5 && ratio(numericCount) < 0.5) {
        scores.category += VALUE_WEIGHT * (1 - uniqueValues.size / values.length)
      }

      // Text: long strings, high cardinality
      const avgLength = values.reduce((sum: number, v) => sum + String(v).length, 0) / values.length
      if (avgLength > 30 && uniqueValues.size > values.length * 0.8) {
        scores.text += VALUE_WEIGHT * 0.8
      }
    }

    // Find winning type
    let bestType: ColumnType = 'unknown'
    let bestScore = 0
    for (const [type, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score
        bestType = type as ColumnType
      }
    }

    // Check for direct metric label match
    let mappedMetricId: string | null = null
    let unit: string | null = null
    const metricMatch = metricLabelMap.get(headerLower)
    if (metricMatch) {
      mappedMetricId = metricMatch.id
      unit = metricMatch.unit
      if (bestType === 'unknown' || bestType === 'metric') {
        bestType = 'metric'
        bestScore = Math.max(bestScore, 0.8)
      }
    }

    // Infer unit from type
    if (!unit) {
      if (bestType === 'currency') unit = 'dollars'
      else if (bestType === 'percentage') unit = '%'
      else if (bestType === 'metric') unit = inferUnit(headerLower)
    }

    // Clean display name
    const displayName = cleanHeaderName(header)

    return {
      columnIndex: index,
      originalHeader: header,
      detectedType: bestType,
      displayName,
      unit,
      confidence: Math.min(bestScore, 1),
      mappedMetricId,
    }
  })
}

// ── Helpers ──────────────────────────────────────────────────────

function matchesKeywords(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => {
    // Match whole word or as part of compound word
    const regex = new RegExp(`\\b${kw}\\b|${kw}`, 'i')
    return regex.test(text)
  })
}

function sampleValues(rows: Record<string, unknown>[], header: string, maxSamples: number): unknown[] {
  const values: unknown[] = []
  for (let i = 0; i < Math.min(rows.length, maxSamples); i++) {
    const val = rows[i][header]
    if (val !== null && val !== undefined && val !== '') {
      values.push(val)
    }
  }
  return values
}

function isDateValue(val: string): boolean {
  return DATE_PATTERNS.some((p) => p.test(val.trim()))
}

function isNumeric(val: unknown): boolean {
  if (typeof val === 'number') return !isNaN(val)
  if (typeof val !== 'string') return false
  const cleaned = val.replace(/[$,%\s]/g, '')
  return cleaned !== '' && !isNaN(Number(cleaned))
}

function inferUnit(headerLower: string): string | null {
  if (/hour/.test(headerLower)) return 'hours'
  if (/student|people|client|patient|participant|volunteer/.test(headerLower)) return 'people'
  if (/session|class/.test(headerLower)) return 'sessions'
  if (/event|workshop/.test(headerLower)) return 'events'
  if (/visit/.test(headerLower)) return 'visits'
  if (/meal/.test(headerLower)) return 'meals'
  if (/acre|hectare/.test(headerLower)) return 'acres'
  if (/ton/.test(headerLower)) return 'tons'
  if (/tree/.test(headerLower)) return 'trees'
  return null
}

function cleanHeaderName(header: string): string {
  return header
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → camel Case
    .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize words
    .trim()
}
