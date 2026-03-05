import type { Metadata } from 'next'
import { ImpactSetup } from './impact-setup'

export const metadata: Metadata = {
  title: 'Set Up Impact Tracking | GrantLink',
  description:
    'Choose your issue area and select the metrics that matter most for your nonprofit. Get started with impact measurement in under 2 minutes.',
}

export default function ImpactSetupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <ImpactSetup />
      </div>
    </div>
  )
}
