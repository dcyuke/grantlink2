import type { Metadata } from 'next'
import { ReadinessQuiz } from './readiness-quiz'

export const metadata: Metadata = {
  title: 'Grant Readiness Self-Assessment | GrantLink',
  description:
    'Find out if your nonprofit is ready to apply for grants. This free self-assessment helps you identify strengths and areas to strengthen before applying.',
  openGraph: {
    title: 'Grant Readiness Self-Assessment | GrantLink',
    description:
      'Find out if your nonprofit is ready to apply for grants.',
    url: 'https://grantlink.org/readiness',
  },
}

export default function ReadinessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Grant Readiness Self-Assessment
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Answer a few quick questions to see how prepared your organization is to
            pursue grant funding — and get tailored tips to strengthen your applications.
          </p>
        </div>

        <ReadinessQuiz />
      </div>
    </div>
  )
}
