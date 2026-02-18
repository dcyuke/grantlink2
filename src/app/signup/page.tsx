import { AuthForm } from '@/components/auth/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free GrantLink account to save grants, track applications, and get personalized alerts.',
}

export default function SignupPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Join GrantLink to save grants, track applications, and get personalized alerts — all for free.
          </p>
        </div>

        <AuthForm mode="signup" />
      </div>
    </div>
  )
}
