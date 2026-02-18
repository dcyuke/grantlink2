'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

interface AuthFormProps {
  mode: 'login' | 'signup'
  redirectTo?: string
}

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [authMethod, setAuthMethod] = useState<'password' | 'magic_link'>('password')
  const router = useRouter()

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?redirect=${redirectTo}` : ''}`,
          },
        })
        if (error) throw error
        setMagicLinkSent(true) // Show confirmation email sent message
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push(redirectTo || '/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?redirect=${redirectTo}` : ''}`,
        },
      })
      if (error) throw error
      setMagicLinkSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a {authMethod === 'magic_link' ? 'login link' : 'confirmation email'} to{' '}
          <span className="font-medium text-foreground">{email}</span>.
          Click the link to {mode === 'signup' ? 'confirm your account' : 'log in'}.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
      {/* Auth method tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setAuthMethod('password')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            authMethod === 'password'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod('magic_link')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            authMethod === 'magic_link'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Magic Link
        </button>
      </div>

      <form onSubmit={authMethod === 'password' ? handlePasswordAuth : handleMagicLink} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary/40"
            />
          </div>
        </div>

        {authMethod === 'password' && (
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder={mode === 'signup' ? 'Create a password (6+ characters)' : 'Your password'}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none transition-colors focus:border-primary/40"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {authMethod === 'magic_link'
            ? 'Send Magic Link'
            : mode === 'login'
              ? 'Log In'
              : 'Create Account'}
          {!loading && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
