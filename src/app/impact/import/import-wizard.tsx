'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  ClipboardPaste,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseCSV } from '@/lib/import/parse-csv'
import { parseXLSX } from '@/lib/import/parse-xlsx'
import { parsePaste } from '@/lib/import/parse-paste'
import { detectColumns } from '@/lib/import/detect-columns'
import { detectIssueArea } from '@/lib/import/detect-issue-area'
import { cleanRow } from '@/lib/import/clean-data'
import type { ParseResult, ColumnDetection, ColumnMapping, IssueAreaMatch, ColumnType } from '@/lib/import/types'

type InputMethod = 'file' | 'paste' | 'append'
type Step = 1 | 2 | 3 | 4

const TYPE_LABELS: Record<ColumnType, { label: string; color: string }> = {
  metric: { label: 'Metric', color: 'bg-blue-100 text-blue-700' },
  date: { label: 'Date', color: 'bg-purple-100 text-purple-700' },
  category: { label: 'Category', color: 'bg-amber-100 text-amber-700' },
  currency: { label: 'Currency', color: 'bg-emerald-100 text-emerald-700' },
  percentage: { label: 'Percent', color: 'bg-pink-100 text-pink-700' },
  text: { label: 'Text', color: 'bg-gray-100 text-gray-700' },
  id: { label: 'ID', color: 'bg-slate-100 text-slate-600' },
  unknown: { label: 'Unknown', color: 'bg-gray-50 text-gray-500' },
}

const COLUMN_TYPES: ColumnType[] = ['metric', 'date', 'category', 'currency', 'percentage', 'text', 'id', 'unknown']

export function ImportWizard() {
  const [step, setStep] = useState<Step>(1)
  const [method, setMethod] = useState<InputMethod>('file')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [sourceType, setSourceType] = useState<'csv' | 'xlsx' | 'paste'>('csv')
  const [filename, setFilename] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [detections, setDetections] = useState<ColumnDetection[]>([])
  const [issueAreaMatch, setIssueAreaMatch] = useState<IssueAreaMatch | null>(null)
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [datasetName, setDatasetName] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedDatasetId, setSavedDatasetId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Step 1: Parse input ──

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large (max 5 MB)')
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    let result: ParseResult

    if (ext === 'csv' || ext === 'tsv') {
      result = await parseCSV(file)
      setSourceType('csv')
    } else if (ext === 'xlsx' || ext === 'xls') {
      result = await parseXLSX(file)
      setSourceType('xlsx')
    } else {
      setError('Unsupported file type. Use .csv, .xlsx, or .xls')
      return
    }

    if (result.errors.length > 0 && result.rows.length === 0) {
      setError(result.errors.join('; '))
      return
    }

    setFilename(file.name)
    setParseResult(result)
    setDatasetName(file.name.replace(/\.(csv|xlsx|xls|tsv)$/i, ''))
  }, [])

  const handlePaste = useCallback(() => {
    if (!pasteText.trim()) return
    const result = parsePaste(pasteText)
    if (result.errors.length > 0 && result.rows.length === 0) {
      setError(result.errors.join('; '))
      return
    }
    setSourceType('paste')
    setParseResult(result)
    setDatasetName(`Imported Data ${new Date().toLocaleDateString()}`)
  }, [pasteText])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const goToStep2 = useCallback(() => {
    if (!parseResult) return
    const detected = detectColumns(parseResult.headers, parseResult.rows)
    setDetections(detected)
    const issueArea = detectIssueArea(parseResult.headers, parseResult.rows)
    setIssueAreaMatch(issueArea)
    setStep(2)
  }, [parseResult])

  // ── Step 2 → 3: Initialize mappings ──

  const goToStep3 = useCallback(() => {
    const initialMappings: ColumnMapping[] = detections.map((d) => ({
      columnIndex: d.columnIndex,
      originalHeader: d.originalHeader,
      detectedType: d.detectedType,
      mappedMetricId: d.mappedMetricId,
      displayName: d.displayName,
      unit: d.unit,
      confidence: d.confidence,
      isIncluded: true,
    }))
    setMappings(initialMappings)
    setStep(3)
  }, [detections])

  const updateMapping = useCallback((index: number, updates: Partial<ColumnMapping>) => {
    setMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...updates } : m))
    )
  }, [])

  // ── Step 4: Save to Supabase ──

  const handleSave = useCallback(async () => {
    if (!parseResult) return
    setSaving(true)
    setError(null)

    try {
      const includedMappings = mappings.filter((m) => m.isIncluded)
      const cleanedRows = parseResult.rows.map((row) =>
        cleanRow(row, parseResult.headers, mappings)
      )

      const response = await fetch('/api/impact-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: datasetName || 'Imported Data',
          sourceType,
          originalFilename: filename,
          columnMappings: includedMappings,
          dataRows: cleanedRows,
          detectedIssueArea: issueAreaMatch?.slug ?? null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      setSavedDatasetId(data.datasetId)
      setStep(4)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }, [parseResult, mappings, datasetName, sourceType, filename, issueAreaMatch])

  // ── Render ──

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/impact"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Impact
        </Link>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Import Data
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload your existing data and we&apos;ll organize it for you.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div>
          <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
            Step 1: Upload Your Data
          </h2>

          {/* Method tabs */}
          <div className="mb-6 flex gap-2">
            {[
              { id: 'file' as InputMethod, icon: Upload, label: 'Upload File' },
              { id: 'paste' as InputMethod, icon: ClipboardPaste, label: 'Paste Data' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setMethod(tab.id); setParseResult(null); setError(null) }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  method === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {method === 'file' && (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/60 p-12 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40" />
                <div>
                  <p className="font-medium text-foreground">
                    {filename || 'Drop your file here or click to browse'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    CSV, Excel (.xlsx, .xls) — Max 5 MB
                  </p>
                </div>
                {parseResult && (
                  <p className="text-sm text-primary">
                    {parseResult.rows.length} rows, {parseResult.headers.length} columns detected
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.tsv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>
          )}

          {method === 'paste' && (
            <div>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your data here (from Excel, Google Sheets, etc.)"
                className="h-48 w-full resize-none rounded-xl border border-border bg-card p-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <div className="mt-3 flex items-center gap-3">
                <Button onClick={handlePaste} disabled={!pasteText.trim()}>
                  Parse Data
                </Button>
                {parseResult && (
                  <p className="text-sm text-primary">
                    {parseResult.rows.length} rows, {parseResult.headers.length} columns detected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Parse warnings */}
          {parseResult && parseResult.errors.length > 0 && parseResult.rows.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              {parseResult.errors.length} warning(s) — data was still parsed successfully
            </div>
          )}

          {/* Next button */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={goToStep2}
              disabled={!parseResult || parseResult.rows.length === 0}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Detect */}
      {step === 2 && parseResult && (
        <div>
          <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
            Step 2: Preview Your Data
          </h2>

          <p className="mb-4 text-sm text-muted-foreground">
            {parseResult.rows.length} rows and {parseResult.headers.length} columns detected.
            Each column has been automatically classified.
          </p>

          {/* Issue area detection banner */}
          {issueAreaMatch && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <Layers className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  This looks like <span className="text-primary">{issueAreaMatch.name}</span> data
                </p>
                <p className="text-xs text-muted-foreground">
                  {issueAreaMatch.matchedMetrics.length} metric(s) matched — {Math.round(issueAreaMatch.confidence * 100)}% confidence
                </p>
              </div>
            </div>
          )}

          {/* Preview table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {detections.map((det) => (
                    <th key={det.columnIndex} className="px-3 py-2.5 text-left font-medium text-foreground">
                      <div className="flex flex-col gap-1">
                        <span className="truncate max-w-[140px]">{det.originalHeader}</span>
                        <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_LABELS[det.detectedType].color}`}>
                          {TYPE_LABELS[det.detectedType].label}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parseResult.rows.slice(0, 10).map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-border/40 last:border-0">
                    {parseResult.headers.map((header, colIdx) => (
                      <td key={colIdx} className="px-3 py-2 text-muted-foreground truncate max-w-[160px]">
                        {row[header] != null ? String(row[header]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parseResult.rows.length > 10 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Showing first 10 of {parseResult.rows.length} rows
            </p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={goToStep3} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm Mappings */}
      {step === 3 && (
        <div>
          <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
            Step 3: Confirm Column Mappings
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Review and adjust how each column was classified. Uncheck columns you don&apos;t want to include.
          </p>

          <div className="space-y-3">
            {mappings.map((mapping, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 transition-colors ${
                  mapping.isIncluded ? 'border-border bg-card' : 'border-border/30 bg-muted/20 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-start gap-3">
                  {/* Include checkbox */}
                  <label className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={mapping.isIncluded}
                      onChange={(e) => updateMapping(i, { isIncluded: e.target.checked })}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </label>

                  {/* Original header */}
                  <div className="min-w-[120px]">
                    <p className="text-xs text-muted-foreground">Original Column</p>
                    <p className="text-sm font-medium text-foreground">{mapping.originalHeader}</p>
                  </div>

                  {/* Type dropdown */}
                  <div className="min-w-[120px]">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <select
                      value={mapping.detectedType}
                      onChange={(e) => updateMapping(i, { detectedType: e.target.value as ColumnType })}
                      className="mt-0.5 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                    >
                      {COLUMN_TYPES.map((type) => (
                        <option key={type} value={type}>{TYPE_LABELS[type].label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Display name */}
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-xs text-muted-foreground">Display Name</p>
                    <input
                      type="text"
                      value={mapping.displayName}
                      onChange={(e) => updateMapping(i, { displayName: e.target.value })}
                      className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                    />
                  </div>

                  {/* Unit */}
                  <div className="min-w-[80px]">
                    <p className="text-xs text-muted-foreground">Unit</p>
                    <input
                      type="text"
                      value={mapping.unit || ''}
                      onChange={(e) => updateMapping(i, { unit: e.target.value || null })}
                      placeholder="—"
                      className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setStep(4)} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Save */}
      {step === 4 && !savedDatasetId && (
        <div>
          <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
            Step 4: Save Your Data
          </h2>

          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-foreground">
                Dataset Name
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="e.g., FY2024 Program Data"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground">Rows</p>
                <p className="text-lg font-semibold text-foreground">{parseResult?.rows.length ?? 0}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground">Columns</p>
                <p className="text-lg font-semibold text-foreground">
                  {mappings.filter((m) => m.isIncluded).length}
                </p>
              </div>
              {issueAreaMatch && (
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-muted-foreground">Issue Area</p>
                  <p className="text-lg font-semibold text-primary">{issueAreaMatch.name}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Data
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success state */}
      {step === 4 && savedDatasetId && (
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-2 font-serif text-2xl font-semibold text-foreground">
            Data Imported Successfully
          </h2>
          <p className="mb-6 text-muted-foreground">
            {parseResult?.rows.length} rows saved across {mappings.filter((m) => m.isIncluded).length} columns.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="gap-2 rounded-full px-6">
              <Link href={`/impact/data?dataset=${savedDatasetId}`}>
                View Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-full px-6"
              onClick={() => {
                setStep(1)
                setParseResult(null)
                setDetections([])
                setMappings([])
                setIssueAreaMatch(null)
                setSavedDatasetId(null)
                setFilename(null)
                setPasteText('')
                setDatasetName('')
                setError(null)
              }}
            >
              <Upload className="h-4 w-4" />
              Import Another
            </Button>
            <Button asChild variant="ghost" className="gap-2 rounded-full px-6">
              <Link href="/impact">
                Back to Impact
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
