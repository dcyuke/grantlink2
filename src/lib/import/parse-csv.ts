import Papa from 'papaparse'
import type { ParseResult } from './types'

/**
 * Parse a CSV file or string into headers + rows.
 */
export function parseCSV(input: File | string): Promise<ParseResult> {
  return new Promise((resolve) => {
    const errors: string[] = []

    Papa.parse(input, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.errors.length > 0) {
          for (const err of results.errors) {
            errors.push(`Row ${err.row ?? '?'}: ${err.message}`)
          }
        }

        const headers = results.meta.fields ?? []
        const rows = results.data as Record<string, unknown>[]

        resolve({ headers, rows, errors })
      },
      error(err: Error) {
        resolve({ headers: [], rows: [], errors: [err.message] })
      },
    })
  })
}
