/**
 * Impact Measurement — localStorage persistence layer
 *
 * Two storage keys:
 *   grantlink_impact_config  → which issue area & metrics the org selected
 *   grantlink_impact_data    → period-by-period metric values
 *
 * Mirrors the pattern in org-profile-storage.ts:
 *   • SSR-safe (typeof window check)
 *   • Custom events for cross-component reactivity
 *   • JSON round-trip with try/catch
 */

// ── Types ──────────────────────────────────────────────────────────

export interface ImpactConfig {
  issueAreaSlug: string
  issueAreaName: string
  selectedMetricIds: string[]
  createdAt: string   // ISO date
  updatedAt: string   // ISO date
}

export interface MetricEntry {
  metricId: string
  value: number
  note?: string       // optional annotation
}

export interface PeriodData {
  id: string           // e.g. "2024-Q1" or "2024-01"
  label: string        // e.g. "Q1 2024" or "Jan 2024"
  type: 'monthly' | 'quarterly' | 'annual'
  entries: MetricEntry[]
  createdAt: string
  updatedAt: string
}

export interface ImpactData {
  orgName?: string
  periods: PeriodData[]
  narratives?: Record<string, string>
}

// ── Constants ──────────────────────────────────────────────────────

const CONFIG_KEY = 'grantlink_impact_config'
const DATA_KEY = 'grantlink_impact_data'

export const IMPACT_CONFIG_EVENT = 'impactConfigUpdated'
export const IMPACT_DATA_EVENT = 'impactDataUpdated'

// ── Config helpers ─────────────────────────────────────────────────

export function saveImpactConfig(config: ImpactConfig): void {
  if (typeof window === 'undefined') return
  const withTimestamp: ImpactConfig = { ...config, updatedAt: new Date().toISOString() }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(withTimestamp))
  window.dispatchEvent(new Event(IMPACT_CONFIG_EVENT))
}

export function getImpactConfig(): ImpactConfig | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(CONFIG_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ImpactConfig
  } catch {
    return null
  }
}

export function clearImpactConfig(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CONFIG_KEY)
  window.dispatchEvent(new Event(IMPACT_CONFIG_EVENT))
}

// ── Data helpers ───────────────────────────────────────────────────

export function saveImpactData(data: ImpactData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event(IMPACT_DATA_EVENT))
}

export function getImpactData(): ImpactData | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(DATA_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ImpactData
  } catch {
    return null
  }
}

export function clearImpactData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DATA_KEY)
  window.dispatchEvent(new Event(IMPACT_DATA_EVENT))
}

// ── Period CRUD ────────────────────────────────────────────────────

/** Add or update a period's data. Merges by period id. */
export function savePeriod(period: PeriodData): void {
  const data = getImpactData() ?? { periods: [] }
  const idx = data.periods.findIndex((p) => p.id === period.id)
  const withTimestamp: PeriodData = { ...period, updatedAt: new Date().toISOString() }
  if (idx >= 0) {
    data.periods[idx] = withTimestamp
  } else {
    data.periods.push(withTimestamp)
  }
  // Sort newest first
  data.periods.sort((a, b) => b.id.localeCompare(a.id))
  saveImpactData(data)
}

/** Remove a period by id. */
export function deletePeriod(periodId: string): void {
  const data = getImpactData()
  if (!data) return
  data.periods = data.periods.filter((p) => p.id !== periodId)
  saveImpactData(data)
}

/** Get a single period by id. */
export function getPeriod(periodId: string): PeriodData | undefined {
  const data = getImpactData()
  if (!data) return undefined
  return data.periods.find((p) => p.id === periodId)
}

// ── Org name helper ────────────────────────────────────────────────

export function saveOrgName(name: string): void {
  const data = getImpactData() ?? { periods: [] }
  data.orgName = name
  saveImpactData(data)
}

// ── Narrative helpers ──────────────────────────────────────────────

export function saveNarrative(key: string, value: string): void {
  const data = getImpactData() ?? { periods: [] }
  if (!data.narratives) data.narratives = {}
  data.narratives[key] = value
  saveImpactData(data)
}

// ── Export / Import ───────────────────────────────────────────────

export function exportAllImpactData(): string {
  const config = getImpactConfig()
  const data = getImpactData()
  return JSON.stringify(
    { version: 1, config, data, exportedAt: new Date().toISOString() },
    null,
    2,
  )
}

export function importAllImpactData(json: string): boolean {
  try {
    const parsed = JSON.parse(json)
    if (parsed.config) saveImpactConfig(parsed.config)
    if (parsed.data) saveImpactData(parsed.data)
    return true
  } catch {
    return false
  }
}

// ── CSV Export ────────────────────────────────────────────────────

/** Build a CSV string from metric data. Columns: Metric, Category, Unit, then one column per period. */
export function exportImpactCSV(
  metrics: { id: string; label: string; category: string; unit: string }[],
  periods: PeriodData[],
): string {
  const escape = (s: string) => {
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  // Sort periods oldest-first for spreadsheet readability
  const sorted = [...periods].sort((a, b) => a.id.localeCompare(b.id))

  // Header row
  const header = ['Metric', 'Category', 'Unit', ...sorted.map((p) => p.label)]
  const rows = [header.map(escape).join(',')]

  // Data rows
  for (const m of metrics) {
    const cells = [m.label, m.category, m.unit]
    for (const p of sorted) {
      const entry = p.entries.find((e) => e.metricId === m.id)
      cells.push(String(entry?.value ?? 0))
    }
    rows.push(cells.map(escape).join(','))
  }

  // Notes section
  rows.push('')
  rows.push('Notes')
  const noteHeader = ['Metric', ...sorted.map((p) => p.label)]
  rows.push(noteHeader.map(escape).join(','))
  for (const m of metrics) {
    const cells = [m.label]
    for (const p of sorted) {
      const entry = p.entries.find((e) => e.metricId === m.id)
      cells.push(entry?.note ?? '')
    }
    // Only include row if there are any notes
    if (cells.some((c, i) => i > 0 && c !== '')) {
      rows.push(cells.map(escape).join(','))
    }
  }

  return rows.join('\n')
}

// ── Reset everything ───────────────────────────────────────────────

export function resetAllImpactData(): void {
  clearImpactConfig()
  clearImpactData()
}

// ── Period ID helpers ──────────────────────────────────────────────

export function makeQuarterlyId(year: number, quarter: number): string {
  return `${year}-Q${quarter}`
}

export function makeMonthlyId(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function makeAnnualId(year: number): string {
  return `${year}`
}

export function makeQuarterlyLabel(year: number, quarter: number): string {
  return `Q${quarter} ${year}`
}

export function makeMonthlyLabel(year: number, month: number): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${monthNames[month - 1]} ${year}`
}

export function makeAnnualLabel(year: number): string {
  return `${year}`
}
