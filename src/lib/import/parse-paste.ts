import type { ParseResult } from './types'

/**
 * Parse pasted text (from Excel, Google Sheets, or plain text).
 * Auto-detects delimiter: tab, comma, pipe, or multiple spaces.
 */
export function parsePaste(text: string): ParseResult {
  const errors: string[] = []
  const trimmed = text.trim()

  if (!trimmed) {
    return { headers: [], rows: [], errors: ['No data provided'] }
  }

  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0)

  if (lines.length < 2) {
    return { headers: [], rows: [], errors: ['Need at least a header row and one data row'] }
  }

  // Detect delimiter from first line
  const delimiter = detectDelimiter(lines[0])
  const headerLine = lines[0]
  const headers = splitLine(headerLine, delimiter).map((h) => h.trim())

  if (headers.length === 0) {
    return { headers: [], rows: [], errors: ['Could not detect columns'] }
  }

  const rows: Record<string, unknown>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i], delimiter)
    const row: Record<string, unknown> = {}
    for (let j = 0; j < headers.length; j++) {
      const val = values[j]?.trim() ?? null
      // Try to parse numbers
      if (val !== null && val !== '') {
        const num = Number(val.replace(/[$,]/g, ''))
        row[headers[j]] = isNaN(num) ? val : num
      } else {
        row[headers[j]] = null
      }
    }
    rows.push(row)
  }

  if (rows.length === 0) {
    errors.push('No data rows found')
  }

  return { headers, rows, errors }
}

function detectDelimiter(line: string): string {
  // Count occurrences of each delimiter candidate
  const candidates: [string, number][] = [
    ['\t', (line.match(/\t/g) || []).length],
    [',', (line.match(/,/g) || []).length],
    ['|', (line.match(/\|/g) || []).length],
  ]

  // Tab-separated is most common from spreadsheet paste
  const best = candidates.sort((a, b) => b[1] - a[1])[0]
  if (best[1] > 0) return best[0]

  // Fallback: multiple spaces
  if (/\s{2,}/.test(line)) return '  '

  // Single column
  return '\n'
}

function splitLine(line: string, delimiter: string): string[] {
  if (delimiter === '\n') return [line]
  if (delimiter === '  ') return line.split(/\s{2,}/)
  return line.split(delimiter)
}
