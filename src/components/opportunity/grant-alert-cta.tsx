'use client'

import { useState } from 'react'
import { Bell, CheckCircle2, ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FOCUS_AREAS } from '@/lib/constants'
import { emailSignupSchema } from '@/types/email-signup'
import type { AlertPreference } from '@/types/email-signup'
import { saveEmailSignup, isEmailAlreadySignedUp, getEmailSignups } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface GrantAlertCTAProps {
  focusAreaSlugs?: string[]
}

function getInitialStatus(): 'idle' | 'success' | 'error' | 'already_signed_up' {
  const signups = getEmailSignups()
  return signups.length > 0 ? 'already_signed_up' : 'idle'
}

export function GrantAlertCTA({ focusAreaSlugs }: GrantAlertCTAProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [alertPref, setAlertPref] = useState<AlertPreference>('similar_only')
  const [selectedAreas, setSelectedAreas] = useState<string[]>(focusAreaSlugs ?? [])
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already_signed_up'>(getInitialStatus)
  const [errorMessage, setErrorMessage] = useState('')

  const toggleArea = (slug: string) => {
    setSelectedAreas((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (alertPref === 'similar_only' && selectedAreas.length === 0) {
      setErrorMessage('Please select at least one focus area to receive similar grant alerts.')
      setStatus('error')
      return
    }

    const result = emailSignupSchema.safeParse({
      email,
      focusAreas: selectedAreas.length > 0 ? selectedAreas : undefined,
      alertPreference: alertPref,
    })

    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? 'Invalid email')
      setStatus('error')
      return
    }

    if (isEmailAlreadySignedUp(email)) {
      setStatus('success')
      return
    }

    const focusAreas = selectedAreas.length > 0 ? selectedAreas : undefined

    // Save to localStorage
    saveEmailSignup({ email, focusAreas, alertPreference: alertPref })
    setStatus('success')

    // Persist to database
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, focusAreas, alertPreference: alertPref }),
    }).catch(() => {})

    // Send welcome email in the background
    fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, focusAreas, alertPreference: alertPref }),
    }).catch(() => {})
  }

  // Already signed up state
  if (status === 'already_signed_up') {
    return (
      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">You&apos;re signed up for grant alerts!</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll notify you when new grants are posted.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">You&apos;re all set!</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll send grant alerts to <span className="font-medium text-foreground">{email}</span>
          {alertPref === 'similar_only' ? (
            <> for grants similar to your interests.</>
          ) : (
            <> covering all new grants.</>
          )}
        </p>
      </div>
    )
  }

  // Collapsed CTA state
  if (!isExpanded) {
    return (
      <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-50/30 p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              Don&apos;t miss new grants like this one
            </h3>
            <p className="text-sm text-muted-foreground">
              Sign up for our curated alert system and we&apos;ll notify you when similar opportunities are posted.
            </p>
          </div>
          <Button onClick={() => setIsExpanded(true)} className="shrink-0">
            Get Alerts
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  // Expanded form state
  return (
    <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-50/30 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Get Grant Alerts</h3>
          <p className="text-sm text-muted-foreground">
            We&apos;ll notify you when new matching grants are posted.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage('')
                if (status === 'error') setStatus('idle')
              }}
              placeholder="Enter your email address"
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary/40"
            />
          </div>
          <Button type="submit" className="shrink-0">
            Sign Up
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        {/* Alert preference toggles */}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Alert preference:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAlertPref('similar_only')}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm transition-all',
                alertPref === 'similar_only'
                  ? 'border-primary bg-primary/10 font-medium text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              )}
            >
              Similar grants only
            </button>
            <button
              type="button"
              onClick={() => setAlertPref('all_grants')}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm transition-all',
                alertPref === 'all_grants'
                  ? 'border-primary bg-primary/10 font-medium text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              )}
            >
              All new grants
            </button>
          </div>
        </div>

        {/* Focus area selection */}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Focus areas{' '}
            <span className="font-normal text-muted-foreground">
              {alertPref === 'similar_only' ? '(required)' : '(optional)'}
            </span>
          </p>
          {alertPref === 'similar_only' && selectedAreas.length === 0 && (
            <p className="mb-2 text-xs text-amber-600">
              Select at least one focus area to receive similar grant alerts.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {FOCUS_AREAS.map((area) => {
              const isSelected = selectedAreas.includes(area.slug)
              return (
                <button
                  key={area.slug}
                  type="button"
                  onClick={() => toggleArea(area.slug)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 font-medium text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  {area.name}
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </div>
  )
}
