'use client'

import { useState } from 'react'
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FOCUS_AREAS } from '@/lib/constants'
import { emailSignupSchema } from '@/types/email-signup'
import { saveEmailSignup, isEmailAlreadySignedUp } from '@/lib/storage'

export function EmailSignup() {
  const [email, setEmail] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
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

    const result = emailSignupSchema.safeParse({
      email,
      focusAreas: selectedAreas.length > 0 ? selectedAreas : undefined,
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

    saveEmailSignup({ email, focusAreas })
    setStatus('success')

    // Send welcome email in the background (don't block UI)
    fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, focusAreas }),
    }).catch(() => {
      // Email send failure is non-blocking — signup still succeeds
    })
  }

  if (status === 'success') {
    return (
      <section className="bg-gradient-to-br from-primary/5 via-background to-emerald-50/30">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">You&apos;re signed up!</h2>
            <p className="text-muted-foreground">
              We&apos;ll send curated funding reports to <span className="font-medium text-foreground">{email}</span>
              {selectedAreas.length > 0 ? (
                <> focused on your selected interests.</>
              ) : (
                <> covering all funding areas.</>
              )}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-emerald-50/30">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>

          {/* Heading */}
          <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            Get Curated Funding Reports
          </h2>
          <p className="mb-8 text-muted-foreground">
            Receive personalized funding opportunities matching your interests, delivered to your inbox.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg">
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
                Subscribe
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Error message */}
            {errorMessage && (
              <p className="mt-2 text-left text-sm text-destructive">{errorMessage}</p>
            )}

            {/* Focus area interests */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-foreground">
                Select your interests <span className="font-normal text-muted-foreground">(optional)</span>
              </p>
              <div className="flex flex-wrap justify-center gap-2">
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
    </section>
  )
}
