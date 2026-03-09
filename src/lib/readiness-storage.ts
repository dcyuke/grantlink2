/**
 * Readiness Assessment History — localStorage persistence.
 *
 * Stores structured results from each readiness quiz completion,
 * enabling score comparison, progress tracking, and dashboard integration.
 *
 * Follows the same SSR-safe patterns as impact-storage.ts and org-profile-storage.ts.
 */

// ── Types ────────────────────────────────────────────────────────────

export type ReadinessLevel =
  | 'grant-ready'
  | 'getting-there'
  | 'building-foundations'
  | 'early-stage'

export interface ReadinessResult {
  id: string
  timestamp: string
  totalScore: number
  maxScore: number
  percentage: number
  level: ReadinessLevel
  answers: Record<string, number>
  tips: Record<string, string>
}

export interface ReadinessHistory {
  results: ReadinessResult[]
  updatedAt: string
}

// ── Constants ────────────────────────────────────────────────────────

const STORAGE_KEY = 'grantlink_readiness_history'
const LEGACY_FLAG = 'gl_readiness_completed'
const MAX_RESULTS = 20

export const READINESS_HISTORY_EVENT = 'readinessHistoryUpdated'

// ── Helpers ──────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readHistory(): ReadinessHistory | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ReadinessHistory
  } catch {
    return null
  }
}

function writeHistory(history: ReadinessHistory): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    // Maintain backward compatibility with dashboard checklist
    localStorage.setItem(LEGACY_FLAG, 'true')
    window.dispatchEvent(new Event(READINESS_HISTORY_EVENT))
  } catch {
    // localStorage full or unavailable
  }
}

// ── Public API ───────────────────────────────────────────────────────

/** Save a new readiness result (newest first, capped at MAX_RESULTS). */
export function saveReadinessResult(result: ReadinessResult): void {
  const existing = readHistory()
  const results = existing?.results ?? []
  results.unshift(result)
  if (results.length > MAX_RESULTS) results.length = MAX_RESULTS
  writeHistory({ results, updatedAt: new Date().toISOString() })
}

/** Get the full readiness history. */
export function getReadinessHistory(): ReadinessHistory | null {
  return readHistory()
}

/** Get the most recent result. */
export function getLatestResult(): ReadinessResult | null {
  const history = readHistory()
  return history?.results[0] ?? null
}

/** Get the second-most-recent result (for comparison). */
export function getPreviousResult(): ReadinessResult | null {
  const history = readHistory()
  return history?.results[1] ?? null
}

/** Clear all readiness history. */
export function clearReadinessHistory(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
