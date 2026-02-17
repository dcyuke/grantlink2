'use client'

import { useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { emailSignupSchema } from '@/types/email-signup'
import { saveEmailSignup, isEmailAlreadySignedUp } from '@/lib/storage'

export function FooterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const result = emailSignupSchema.safeParse({ email })

    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? 'Invalid email')
      setStatus('error')
      return
    }

    if (isEmailAlreadySignedUp(email)) {
      setStatus('success')
      return
    }

    saveEmailSignup({ email, alertPreference: 'all_grants' })
    setStatus('success')

    // Send welcome email in the background (don't block UI)
    fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, alertPreference: 'all_grants' }),
    }).catch(() => {
      // Email send failure is non-blocking — signup still succeeds
    })
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle2 className="h-4 w-4" />
        <span className="font-medium">Subscribed!</span>
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">Get Grant Alerts</h3>
      <p className="mb-3 text-sm text-muted-foreground">Get notified about new grants in your inbox.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errorMessage) setErrorMessage('')
            if (status === 'error') setStatus('idle')
          }}
          placeholder="Your email"
          className="w-full min-w-0 rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none transition-colors focus:border-primary/40"
        />
        <Button type="submit" size="sm" className="shrink-0">
          <Mail className="h-3.5 w-3.5" />
        </Button>
      </form>
      {errorMessage && (
        <p className="mt-1.5 text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}
