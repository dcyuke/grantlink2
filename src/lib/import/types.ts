/**
 * Shared types for the Impact Data Import feature.
 */

/** Result of parsing a file or pasted text */
export interface ParseResult {
  headers: string[]
  rows: Record<string, unknown>[]
  errors: string[]
}

/** Detected column type */
export type ColumnType =
  | 'metric'
  | 'date'
  | 'category'
  | 'currency'
  | 'percentage'
  | 'text'
  | 'id'
  | 'unknown'

/** Detection result for a single column */
export interface ColumnDetection {
  columnIndex: number
  originalHeader: string
  detectedType: ColumnType
  displayName: string
  unit: string | null
  confidence: number
  mappedMetricId: string | null
}

/** Issue area detection result */
export interface IssueAreaMatch {
  slug: string
  name: string
  confidence: number
  matchedMetrics: { metricId: string; columnHeader: string }[]
}

/** Column mapping as confirmed by user (mirrors DB schema) */
export interface ColumnMapping {
  columnIndex: number
  originalHeader: string
  detectedType: ColumnType
  mappedMetricId: string | null
  displayName: string
  unit: string | null
  confidence: number
  isIncluded: boolean
}

/** Dataset record (mirrors DB schema) */
export interface Dataset {
  id: string
  user_id: string
  name: string
  source_type: 'csv' | 'xlsx' | 'paste'
  original_filename: string | null
  row_count: number
  column_count: number
  detected_issue_area: string | null
  status: 'draft' | 'complete'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

/** Data row record (mirrors DB schema) */
export interface DataRow {
  id: string
  dataset_id: string
  row_index: number
  values: Record<string, unknown>
  created_at: string
}
