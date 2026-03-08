import type { ColumnMapping } from './types'

/**
 * Clean and normalize a raw value based on its detected column type.
 */
export function cleanValue(value: unknown, type: string): unknown {
  if (value === null || value === undefined || value === '') return null

  const str = String(value).trim()

  switch (type) {
    case 'metric':
    case 'currency':
      return cleanNumber(str)
    case 'percentage':
      return cleanPercentage(str)
    case 'date':
      return cleanDate(str)
    default:
      return str
  }
}

/**
 * Clean an entire row using column mappings.
 */
export function cleanRow(
  row: Record<string, unknown>,
  headers: string[],
  mappings: ColumnMapping[]
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {}

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]
    const mapping = mappings.find((m) => m.columnIndex === i)
    const rawVal = row[header]

    if (mapping && !mapping.isIncluded) continue

    const type = mapping?.detectedType ?? 'unknown'
    const key = `col_${i}`
    cleaned[key] = cleanValue(rawVal, type)
  }

  return cleaned
}

/**
 * Strip currency symbols and commas, parse to number.
 */
export function cleanNumber(val: string): number | null {
  const cleaned = val.replace(/[$,\s]/g, '')
  const num = Number(cleaned)
  return isNaN(num) ? null : num
}

/**
 * Normalize percentage values.
 * "45%" → 45, "0.45" → 45 (if looks like decimal ratio)
 */
export function cleanPercentage(val: string): number | null {
  const stripped = val.replace(/%/g, '').trim()
  const num = Number(stripped)
  if (isNaN(num)) return null

  // If value is between 0 and 1 (exclusive), treat as decimal ratio
  if (num > 0 && num < 1) return Math.round(num * 100 * 100) / 100
  return num
}

/**
 * Normalize date strings to ISO format (YYYY-MM-DD).
 */
export function cleanDate(val: string): string | null {
  const trimmed = val.trim()

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  // Year only: 2024 → 2024-01-01
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`

  // Quarter: Q1 2024 or 2024-Q1
  const quarterMatch = trimmed.match(/Q([1-4])\s*(\d{4})/i) || trimmed.match(/(\d{4})-Q([1-4])/i)
  if (quarterMatch) {
    const year = quarterMatch[2]?.length === 4 ? quarterMatch[2] : quarterMatch[1]
    const quarter = quarterMatch[2]?.length === 4 ? quarterMatch[1] : quarterMatch[2]
    const month = String((Number(quarter) - 1) * 3 + 1).padStart(2, '0')
    return `${year}-${month}-01`
  }

  // FY2024 → 2024-01-01
  const fyMatch = trimmed.match(/FY\s*(\d{2,4})/i)
  if (fyMatch) {
    const year = fyMatch[1].length === 2 ? `20${fyMatch[1]}` : fyMatch[1]
    return `${year}-01-01`
  }

  // Month name: January 2024, Jan 2024
  const monthNames: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  }
  const monthMatch = trimmed.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})$/i)
  if (monthMatch) {
    const month = monthNames[monthMatch[1].toLowerCase().slice(0, 3)]
    return `${monthMatch[2]}-${month}-01`
  }

  // MM/DD/YYYY or M/D/YYYY
  const usDateMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (usDateMatch) {
    const year = usDateMatch[3].length === 2 ? `20${usDateMatch[3]}` : usDateMatch[3]
    const month = usDateMatch[1].padStart(2, '0')
    const day = usDateMatch[2].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Excel serial date (number)
  const serial = Number(trimmed)
  if (!isNaN(serial) && serial > 30000 && serial < 60000) {
    // Excel serial date → JS date
    const jsDate = new Date((serial - 25569) * 86400 * 1000)
    return jsDate.toISOString().split('T')[0]
  }

  // Try native Date parsing as fallback
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
    return parsed.toISOString().split('T')[0]
  }

  return trimmed // Return as-is if we can't parse
}
