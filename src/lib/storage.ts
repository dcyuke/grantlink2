import type { StoredSignup } from '@/types/email-signup'
import type { StoredFeedback, FeedbackType } from '@/types/feedback'

const SIGNUPS_KEY = 'grantlink_email_signups'
const FEEDBACK_KEY = 'grantlink_feedback'

// --- Email Signups ---

export function saveEmailSignup(data: { email: string; focusAreas?: string[]; alertPreference?: 'similar_only' | 'all_grants' }): StoredSignup {
  const stored: StoredSignup = {
    email: data.email,
    focusAreas: data.focusAreas,
    alertPreference: data.alertPreference ?? 'all_grants',
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const existing = getEmailSignups()
  existing.push(stored)
  localStorage.setItem(SIGNUPS_KEY, JSON.stringify(existing))
  return stored
}

export function getEmailSignups(): StoredSignup[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(SIGNUPS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function isEmailAlreadySignedUp(email: string): boolean {
  return getEmailSignups().some(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  )
}

// --- Feedback ---

export function saveFeedback(data: {
  name?: string
  email?: string
  type: FeedbackType
  message: string
}): StoredFeedback {
  const stored: StoredFeedback = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const existing = getFeedbackItems()
  existing.push(stored)
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(existing))
  return stored
}

export function getFeedbackItems(): StoredFeedback[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(FEEDBACK_KEY)
  return raw ? JSON.parse(raw) : []
}
