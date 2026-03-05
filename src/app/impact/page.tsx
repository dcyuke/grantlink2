import type { Metadata } from 'next'
import { ImpactLanding } from './impact-landing'

export const metadata: Metadata = {
  title: 'Impact Measurement | GrantLink',
  description:
    'Track your nonprofit\'s outputs, outcomes, and impact. Choose your issue area, select the right metrics, and generate polished reports for donors and stakeholders.',
  openGraph: {
    title: 'Impact Measurement | GrantLink',
    description:
      'Free impact measurement tools for small and mid-size nonprofits.',
    url: 'https://grantlink.org/impact',
  },
}

export default function ImpactPage() {
  return <ImpactLanding />
}
