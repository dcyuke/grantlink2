import type { Metadata } from 'next'
import { MEPlanBuilder } from './me-plan-builder'

export const metadata: Metadata = {
  title: 'Evaluation Plan Builder | GrantLink',
  description:
    'Build a simple monitoring and evaluation plan for your nonprofit — no jargon, just clear steps to track your impact.',
}

export default function EvaluationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <MEPlanBuilder />
      </div>
    </div>
  )
}
