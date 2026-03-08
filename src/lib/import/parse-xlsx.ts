import * as XLSX from 'xlsx'
import type { ParseResult } from './types'

/**
 * Parse an Excel file (.xlsx/.xls) into headers + rows.
 * Uses the first sheet by default; pass sheetName to pick a specific one.
 */
export async function parseXLSX(
  file: File,
  sheetName?: string
): Promise<ParseResult & { sheetNames: string[] }> {
  const errors: string[] = []

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
    const sheetNames = workbook.SheetNames

    if (sheetNames.length === 0) {
      return { headers: [], rows: [], errors: ['No sheets found in file'], sheetNames: [] }
    }

    const targetSheet = sheetName ?? sheetNames[0]
    const worksheet = workbook.Sheets[targetSheet]

    if (!worksheet) {
      return {
        headers: [],
        rows: [],
        errors: [`Sheet "${targetSheet}" not found`],
        sheetNames,
      }
    }

    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: null,
    })

    if (jsonData.length === 0) {
      return { headers: [], rows: [], errors: ['Sheet is empty'], sheetNames }
    }

    // Extract headers from first row keys
    const headers = Object.keys(jsonData[0])

    // Convert Date objects to ISO strings for consistency
    const rows = jsonData.map((row) => {
      const cleaned: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(row)) {
        cleaned[key] = val instanceof Date ? val.toISOString().split('T')[0] : val
      }
      return cleaned
    })

    return { headers, rows, errors, sheetNames }
  } catch (err) {
    return {
      headers: [],
      rows: [],
      errors: [(err as Error).message || 'Failed to parse Excel file'],
      sheetNames: [],
    }
  }
}
