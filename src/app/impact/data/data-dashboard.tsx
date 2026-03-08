'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Database,
  Columns3,
  Calendar,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { Dataset, DataRow } from '@/lib/import/types'

/** Column type matching the snake_case format returned by Supabase API */
interface DbColumn {
  id: string
  dataset_id: string
  column_index: number
  original_header: string
  detected_type: string
  mapped_metric_id: string | null
  display_name: string
  unit: string | null
  confidence: number
  is_included: boolean
}

interface DatasetFull {
  dataset: Dataset
  columns: DbColumn[]
  rows: DataRow[]
}

const CHART_COLORS = [
  'oklch(0.52 0.08 145)',  // primary green
  'oklch(0.55 0.12 250)',  // blue
  'oklch(0.60 0.15 30)',   // orange
  'oklch(0.50 0.10 310)',  // purple
  'oklch(0.58 0.10 180)',  // teal
  'oklch(0.55 0.12 350)',  // pink
]

const ROWS_PER_PAGE = 20

export function DataDashboard() {
  const searchParams = useSearchParams()
  const datasetId = searchParams.get('dataset')

  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(datasetId)
  const [datasetFull, setDatasetFull] = useState<DatasetFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const [searchTerm, setSearchTerm] = useState('')

  // Load datasets list
  useEffect(() => {
    async function loadList() {
      try {
        const res = await fetch('/api/impact-data?list=true')
        const data = await res.json()
        setDatasets(data.datasets ?? [])
        // Auto-select first dataset if none specified
        if (!selectedId && data.datasets?.length > 0) {
          setSelectedId(data.datasets[0].id)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadList()
  }, [selectedId])

  // Load selected dataset
  useEffect(() => {
    if (!selectedId) return
    async function loadDataset() {
      setLoading(true)
      try {
        const res = await fetch(`/api/impact-data?id=${selectedId}`)
        const data = await res.json()
        setDatasetFull(data)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadDataset()
  }, [selectedId])

  // Get included columns
  const includedColumns = useMemo(() => {
    if (!datasetFull) return []
    return datasetFull.columns
      .filter((c) => c.is_included !== false)
      .sort((a, b) => a.column_index - b.column_index)
  }, [datasetFull])

  // Numeric columns for charts
  const numericColumns = useMemo(() =>
    includedColumns.filter((c) =>
      ['metric', 'currency', 'percentage'].includes(c.detected_type)
    ),
  [includedColumns])

  // Date column (first one found)
  const dateColumn = useMemo(() =>
    includedColumns.find((c) => c.detected_type === 'date'),
  [includedColumns])

  // Category columns
  const categoryColumns = useMemo(() =>
    includedColumns.filter((c) => c.detected_type === 'category'),
  [includedColumns])

  // Processed rows for display
  const displayRows = useMemo(() => {
    if (!datasetFull) return []
    let rows = [...datasetFull.rows]

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      rows = rows.filter((row) =>
        Object.values(row.values).some((v) =>
          v != null && String(v).toLowerCase().includes(lower)
        )
      )
    }

    // Sort
    if (sortCol !== null) {
      const key = `col_${sortCol}`
      rows.sort((a, b) => {
        const va = a.values[key]
        const vb = b.values[key]
        if (va == null && vb == null) return 0
        if (va == null) return 1
        if (vb == null) return -1
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortAsc ? va - vb : vb - va
        }
        return sortAsc
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va))
      })
    }

    return rows
  }, [datasetFull, searchTerm, sortCol, sortAsc])

  // Paginated rows
  const pagedRows = useMemo(() => {
    const start = page * ROWS_PER_PAGE
    return displayRows.slice(start, start + ROWS_PER_PAGE)
  }, [displayRows, page])

  const totalPages = Math.ceil(displayRows.length / ROWS_PER_PAGE)

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!datasetFull || numericColumns.length === 0) return []

    if (dateColumn) {
      // Group by date
      const dateKey = `col_${dateColumn.column_index}`
      const grouped = new Map<string, Record<string, number>>()

      for (const row of datasetFull.rows) {
        const date = String(row.values[dateKey] ?? 'Unknown')
        if (!grouped.has(date)) grouped.set(date, {})
        const group = grouped.get(date)!
        for (const col of numericColumns) {
          const val = row.values[`col_${col.column_index}`]
          if (typeof val === 'number') {
            group[col.display_name] = (group[col.display_name] ?? 0) + val
          }
        }
      }

      return Array.from(grouped.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, vals]) => ({ name: date, ...vals }))
    }

    // No date — aggregate per row
    return datasetFull.rows.slice(0, 50).map((row, i) => {
      const entry: Record<string, unknown> = { name: `Row ${i + 1}` }
      for (const col of numericColumns) {
        entry[col.display_name] = row.values[`col_${col.column_index}`] ?? 0
      }
      return entry
    })
  }, [datasetFull, numericColumns, dateColumn])

  // Pie data (for first category column)
  const pieData = useMemo(() => {
    if (!datasetFull || categoryColumns.length === 0 || numericColumns.length === 0) return []
    const catCol = categoryColumns[0]
    const numCol = numericColumns[0]
    const catKey = `col_${catCol.column_index}`
    const numKey = `col_${numCol.column_index}`

    const grouped = new Map<string, number>()
    for (const row of datasetFull.rows) {
      const cat = String(row.values[catKey] ?? 'Other')
      const val = typeof row.values[numKey] === 'number' ? (row.values[numKey] as number) : 0
      grouped.set(cat, (grouped.get(cat) ?? 0) + val)
    }

    return Array.from(grouped.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }))
  }, [datasetFull, categoryColumns, numericColumns])

  // Summary stats
  const stats = useMemo(() => {
    if (!datasetFull) return null
    const totalRows = datasetFull.rows.length
    const numMetrics = numericColumns.length
    let totalCells = 0
    let filledCells = 0

    for (const row of datasetFull.rows) {
      for (const col of includedColumns) {
        totalCells++
        if (row.values[`col_${col.column_index}`] != null) filledCells++
      }
    }

    const completeness = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0

    // Date range
    let dateRange: string | null = null
    if (dateColumn) {
      const dates = datasetFull.rows
        .map((r) => String(r.values[`col_${dateColumn.column_index}`] ?? ''))
        .filter(Boolean)
        .sort()
      if (dates.length > 0) {
        dateRange = `${dates[0]} — ${dates[dates.length - 1]}`
      }
    }

    return { totalRows, numMetrics, completeness, dateRange }
  }, [datasetFull, numericColumns, includedColumns, dateColumn])

  // Export CSV
  const handleExport = useCallback(() => {
    if (!datasetFull) return
    const headers = includedColumns.map((c) => c.display_name)
    const csvRows = [headers.join(',')]

    for (const row of datasetFull.rows) {
      const values = includedColumns.map((col) => {
        const val = row.values[`col_${col.column_index}`]
        if (val == null) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
      })
      csvRows.push(values.join(','))
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${datasetFull.dataset.name || 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [datasetFull, includedColumns])

  const handleSort = (colIndex: number) => {
    if (sortCol === colIndex) {
      setSortAsc(!sortAsc)
    } else {
      setSortCol(colIndex)
      setSortAsc(true)
    }
    setPage(0)
  }

  // ── Empty / Loading states ──

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your data...</p>
      </div>
    )
  }

  if (datasets.length === 0) {
    return (
      <div className="mx-auto max-w-lg text-center py-20">
        <Database className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
        <h2 className="mb-2 font-serif text-xl font-semibold text-foreground">
          No Data Yet
        </h2>
        <p className="mb-6 text-muted-foreground">
          Import your first dataset to see it visualized here.
        </p>
        <Button asChild className="gap-2 rounded-full px-6">
          <Link href="/impact/import">
            <Upload className="h-4 w-4" />
            Import Data
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/impact"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Impact
          </Link>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Impact Data
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Dataset selector */}
          {datasets.length > 1 && (
            <select
              value={selectedId ?? ''}
              onChange={(e) => { setSelectedId(e.target.value); setPage(0) }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
          )}

          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button asChild size="sm" className="gap-2">
            <Link href="/impact/import">
              <Upload className="h-4 w-4" />
              Import
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="h-4 w-4" />
              <span className="text-xs">Total Rows</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-foreground">{stats.totalRows.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Columns3 className="h-4 w-4" />
              <span className="text-xs">Metrics Tracked</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-foreground">{stats.numMetrics}</p>
          </div>
          {stats.dateRange && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Date Range</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">{stats.dateRange}</p>
            </div>
          )}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Data Completeness</span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-foreground">{stats.completeness}%</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && numericColumns.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-foreground">Charts</h2>
            <div className="flex gap-1 rounded-full border border-border p-0.5">
              <button
                onClick={() => setChartType('bar')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  chartType === 'line' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Line
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Main chart */}
            <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
              <ResponsiveContainer width="100%" height={320}>
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {numericColumns.slice(0, 6).map((col, i) => (
                      <Bar key={col.column_index} dataKey={col.display_name} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {numericColumns.slice(0, 6).map((col, i) => (
                      <Line key={col.column_index} type="monotone" dataKey={col.display_name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Pie chart (if category data) */}
            {pieData.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-medium text-foreground">
                  {categoryColumns[0]?.display_name ?? 'Category'} Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data table */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">Data Table</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
            placeholder="Search..."
            className="w-48 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {includedColumns.map((col) => (
                  <th
                    key={col.column_index}
                    onClick={() => handleSort(col.column_index)}
                    className="cursor-pointer select-none px-3 py-2.5 text-left font-medium text-foreground hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[140px]">{col.display_name}</span>
                      <ArrowUpDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                  {includedColumns.map((col) => (
                    <td key={col.column_index} className="px-3 py-2 text-muted-foreground truncate max-w-[180px]">
                      {formatCellValue(row.values[`col_${col.column_index}`], col.detected_type)}
                    </td>
                  ))}
                </tr>
              ))}
              {pagedRows.length === 0 && (
                <tr>
                  <td colSpan={includedColumns.length} className="px-3 py-8 text-center text-muted-foreground">
                    {searchTerm ? 'No matching rows found' : 'No data'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, displayRows.length)} of {displayRows.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatCellValue(value: unknown, type: string): string {
  if (value == null) return '—'
  if (type === 'currency' && typeof value === 'number') {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }
  if (type === 'percentage' && typeof value === 'number') {
    return `${value}%`
  }
  if (type === 'metric' && typeof value === 'number') {
    return value.toLocaleString()
  }
  return String(value)
}
