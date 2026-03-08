/**
 * Target storage for Impact Analytics.
 * Stores user-defined targets per metric in localStorage.
 */

const STORAGE_KEY = 'grantlink_impact_targets'
export const IMPACT_TARGETS_EVENT = 'impactTargetsUpdated'

export interface MetricTarget {
  metricId: string
  targetValue: number
  note?: string // e.g. "Grant milestone: 200 by Q4"
}

export interface ImpactTargets {
  targets: MetricTarget[]
  updatedAt: string
}

function emit() {
  window.dispatchEvent(new Event(IMPACT_TARGETS_EVENT))
}

export function getImpactTargets(): ImpactTargets | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ImpactTargets
  } catch {
    return null
  }
}

function save(data: ImpactTargets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  emit()
}

export function saveMetricTarget(
  metricId: string,
  targetValue: number,
  note?: string,
): void {
  const existing = getImpactTargets() ?? { targets: [], updatedAt: '' }
  const idx = existing.targets.findIndex((t) => t.metricId === metricId)
  const entry: MetricTarget = { metricId, targetValue, note: note || undefined }

  if (idx >= 0) {
    existing.targets[idx] = entry
  } else {
    existing.targets.push(entry)
  }

  existing.updatedAt = new Date().toISOString()
  save(existing)
}

export function removeMetricTarget(metricId: string): void {
  const existing = getImpactTargets()
  if (!existing) return
  existing.targets = existing.targets.filter((t) => t.metricId !== metricId)
  existing.updatedAt = new Date().toISOString()
  save(existing)
}

export function getTargetForMetric(metricId: string): MetricTarget | undefined {
  return getImpactTargets()?.targets.find((t) => t.metricId === metricId)
}

export function saveAllTargets(targets: MetricTarget[]): void {
  save({
    targets,
    updatedAt: new Date().toISOString(),
  })
}
