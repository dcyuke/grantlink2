/**
 * M&E (Monitoring & Evaluation) Plan — localStorage persistence
 */

// ── Types ──────────────────────────────────────────────────────────

export interface MEPlanIndicator {
  description: string
  method: string
  frequency: string
}

export interface MEPlan {
  // Step 1: Mission
  mission: string
  targetPopulation: string
  intendedChange: string
  // Step 2: Activities
  activities: string[]
  resources: string[]
  // Step 3: Results
  outputs: MEPlanIndicator[]
  outcomes: MEPlanIndicator[]
  longTermImpact: string
  // Step 4: Implementation
  dataResponsible: string
  reviewFrequency: string
  trainingNeeds: string
  challenges: string
  // Meta
  createdAt: string
  updatedAt: string
}

// ── Constants ──────────────────────────────────────────────────────

const STORAGE_KEY = 'grantlink_me_plan'
export const ME_PLAN_EVENT = 'mePlanUpdated'

// ── CRUD ───────────────────────────────────────────────────────────

export function saveMEPlan(plan: MEPlan): void {
  if (typeof window === 'undefined') return
  const withTimestamp: MEPlan = { ...plan, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp))
  window.dispatchEvent(new Event(ME_PLAN_EVENT))
}

export function getMEPlan(): MEPlan | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as MEPlan
  } catch {
    return null
  }
}

export function clearMEPlan(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(ME_PLAN_EVENT))
}

export function createEmptyPlan(): MEPlan {
  const now = new Date().toISOString()
  return {
    mission: '',
    targetPopulation: '',
    intendedChange: '',
    activities: [''],
    resources: [],
    outputs: [{ description: '', method: '', frequency: '' }],
    outcomes: [{ description: '', method: '', frequency: '' }],
    longTermImpact: '',
    dataResponsible: '',
    reviewFrequency: '',
    trainingNeeds: '',
    challenges: '',
    createdAt: now,
    updatedAt: now,
  }
}
