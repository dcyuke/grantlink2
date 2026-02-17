import type { Metadata } from 'next'
import { PlusCircle } from 'lucide-react'
import { SubmissionForm } from '@/components/submit/submission-form'

export const metadata: Metadata = {
  title: 'Submit a Funding Opportunity',
  description:
    'Are you a funder? Submit your grant, fellowship, or funding opportunity to reach nonprofits and social enterprises on GrantLink.',
}

export default function SubmitPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <PlusCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Submit a Funding Opportunity
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Help nonprofits and social entrepreneurs discover your funding opportunity.
            Fill out the form below and our team will review your submission within 48 hours.
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3">
          <p className="text-sm text-amber-800">
            <strong>How it works:</strong> Submit your opportunity below. Our team reviews
            every submission to ensure quality. Once approved, it will be published on GrantLink
            and discoverable by thousands of mission-driven organizations.
          </p>
        </div>

        <SubmissionForm />
      </div>
    </div>
  )
}
