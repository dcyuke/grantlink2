import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Reusable authentication guard for API routes.
 *
 * Since middleware excludes /api/* routes, each protected API route
 * must verify authentication individually. This helper provides a
 * consistent pattern to avoid forgetting auth checks on new routes.
 *
 * Usage:
 *   const auth = await requireAuth()
 *   if (auth.error) return auth.error
 *   const { user } = auth
 */

type AuthSuccess = { user: { id: string; email?: string }; error: null }
type AuthError = { user: null; error: NextResponse }

export async function requireAuth(): Promise<AuthSuccess | AuthError> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { user, error: null }
}
