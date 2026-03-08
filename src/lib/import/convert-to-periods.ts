import type { PeriodData, MetricEntry } from '@/lib/impact-storage'
import type { ColumnMapping, DataRow } from './types'

/**
 * Convert imported dataset rows into PeriodData format
 * compatible with the existing Impact Dashboard.
 *
 * - If a date column exists, groups rows by date → one period per unique date
 * - If no date column, creates a single "Imported Data" period
 * - Only includes columns mapped as metric/currency/percentage
 */
export function convertImportToPeriods(
  columns: ColumnMapping[],
  rows: DataRow[]
): PeriodData[] {
  const dateCol = columns.find((c) => c.detectedType === 'date' && c.isIncluded)
  const metricCols = columns.filter(
    (c) => ['metric', 'currency', 'percentage'].includes(c.detectedType) && c.isIncluded
  )

  if (metricCols.length === 0) return []

  if (dateCol) {
    // Group rows by date value
    const groups = new Map<string, DataRow[]>()
    for (const row of rows) {
      const dateVal = String(row.values[`col_${dateCol.columnIndex}`] ?? 'Unknown')
      if (!groups.has(dateVal)) groups.set(dateVal, [])
      groups.get(dateVal)!.push(row)
    }

    // Convert each group to a PeriodData
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateLabel, groupRows]) => {
        const entries: MetricEntry[] = metricCols.map((col) => {
          // Aggregate values for this metric across all rows in the group
          let total = 0
          for (const row of groupRows) {
            const val = row.values[`col_${col.columnIndex}`]
            if (typeof val === 'number') total += val
          }
          return {
            metricId: col.mappedMetricId || `import-${col.columnIndex}`,
            value: total,
          }
        })

        const periodId = `import-${dateLabel.replace(/\s+/g, '-').toLowerCase()}`

        return {
          id: periodId,
          label: dateLabel,
          type: detectPeriodType(dateLabel),
          entries,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })
  }

  // No date column — single period with aggregated values
  const entries: MetricEntry[] = metricCols.map((col) => {
    let total = 0
    for (const row of rows) {
      const val = row.values[`col_${col.columnIndex}`]
      if (typeof val === 'number') total += val
    }
    return {
      metricId: col.mappedMetricId || `import-${col.columnIndex}`,
      value: total,
    }
  })

  return [{
    id: 'import-aggregate',
    label: 'Imported Data',
    type: 'annual',
    entries,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }]
}

function detectPeriodType(dateLabel: string): 'monthly' | 'quarterly' | 'annual' {
  if (/Q[1-4]/i.test(dateLabel)) return 'quarterly'
  if (/^\d{4}$/.test(dateLabel.trim())) return 'annual'
  return 'monthly'
}
