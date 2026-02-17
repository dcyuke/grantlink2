import type { OrgProfile } from './fit-scoring'

const ORG_PROFILE_KEY = 'grantlink_org_profile'

/**
 * Save the user's org profile to localStorage and dispatch a
 * custom event so other components on the same page can react.
 */
export function saveOrgProfile(profile: OrgProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ORG_PROFILE_KEY, JSON.stringify(profile))
  window.dispatchEvent(new Event('orgProfileUpdated'))
}

/**
 * Read the saved org profile from localStorage.
 * Returns null if no profile is saved or running on the server.
 */
export function getOrgProfile(): OrgProfile | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(ORG_PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OrgProfile
  } catch {
    return null
  }
}

/**
 * Clear the saved org profile and notify listeners.
 */
export function clearOrgProfile(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ORG_PROFILE_KEY)
  window.dispatchEvent(new Event('orgProfileUpdated'))
}
