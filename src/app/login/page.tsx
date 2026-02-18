import { AuthForm } from '@/components/auth/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your GrantLink account to save grants, track applications, and get personalized alerts.',
}

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Log in to save grants, track applications, and get personalized alerts.
          </p>
        </div>

        {params.error && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {params.error === 'invalid_link' ? 'This login link is invalid or has expired.' : params.error}
          </div>
        )}

        <AuthForm mode="login" redirectTo={params.redirect} />
      </div>
    </div>
  )
}
