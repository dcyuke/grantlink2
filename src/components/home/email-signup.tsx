'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FOCUS_AREAS } from '@/lib/constants'
import { emailSignupSchema } from '@/types/email-signup'
import type { AlertPreference } from '@/types/email-signup'
import { saveEmailSignup, isEmailAlreadySignedUp } from '@/lib/storage'
import { cn } from '@/lib/utils'

export function EmailSignup() {
  const [email, setEmail] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [alertPref, setAlertPref] = useState<AlertPreference>('all_grants')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
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

    saveEmailSignup({ email, focusAreas, alertPreference: alertPref })
    setStatus('success')

    fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, focusAreas, alertPreference: alertPref }),
    }).catch(() => {})
  }

  if (status === 'success') {
    const confettiColors = ['bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-pink-500', 'bg-emerald-400', 'bg-amber-400']
    return (
      <section>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl text-center">
            <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
              <div className="flex h-14 w-14 animate-[success-pop_0.5s_ease-out] items-center justify-center rounded-2xl bg-primary/10">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              {confettiColors.map((color, i) => (
                <span
                  key={i}
                  className={`absolute h-2 w-2 rounded-full ${color}`}
                  style={{
                    animationName: `confetti-fly-${i + 1}`,
                    animationDuration: '0.6s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards',
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
            <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">You&apos;re signed up!</h2>
            <p className="text-muted-foreground">
              We&apos;ll send grant alerts to <span className="font-medium text-foreground">{email}</span>
              {alertPref === 'similar_only' ? (
                <> focused on grants similar to your selected interests.</>
              ) : selectedAreas.length > 0 ? (
                <> covering all new grants, with a focus on your selected interests.</>
              ) : (
                <> covering all new grant opportunities.</>
              )}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          {/* Image side */}
          <div className="hidden overflow-hidden rounded-3xl md:block">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
              alt="Team working together at a nonprofit"
              width={800}
              height={600}
              className="h-auto w-full object-cover"
            />
          </div>

          {/* Form side */}
          <div>
            <p className="mb-3 text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
              Stay Updated
            </p>
            <h2 className="mb-3 font-serif text-3xl font-bold text-foreground">
              Get New Grant Alerts
            </h2>
            <p className="mb-8 text-muted-foreground">
              Be the first to know when new grants matching your interests are posted.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errorMessage) setErrorMessage('')
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder="Enter your email address"
                    className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary/40"
                  />
                </div>
                <Button type="submit" className="shrink-0 rounded-full">
                  Get Alerts
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>

              {errorMessage && (
                <p className="mt-2 text-left text-sm text-destructive">{errorMessage}</p>
              )}

              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-foreground">
                  What grants do you want to hear about?
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAlertPref('similar_only')}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm transition-all',
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
                      'rounded-full border px-4 py-2 text-sm transition-all',
                      alertPref === 'all_grants'
                        ? 'border-primary bg-primary/10 font-medium text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30'
                    )}
                  >
                    All new grants
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-foreground">
                  Select your interests{' '}
                  <span className="font-normal text-muted-foreground">
                    {alertPref === 'similar_only' ? '(required)' : '(optional)'}
                  </span>
                </p>
                {alertPref === 'similar_only' && selectedAreas.length === 0 && (
                  <p className="mb-3 text-xs text-amber-600">
                    Select at least one focus area to receive similar grant alerts.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map((area) => {
                    const isSelected = selectedAreas.includes(area.slug)
                    return (
                      <button
                        key={area.slug}
                        type="button"
                        onClick={() => toggleArea(area.slug)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
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
        </div>
      </div>
    </section>
  )
}
