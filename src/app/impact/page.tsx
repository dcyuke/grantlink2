import type { Metadata } from 'next'
import { ImpactLanding } from './impact-landing'

export const metadata: Metadata = {
  title: 'Impact Measurement | GrantLink',
  description:
    'Impact measurement tools designed for small and mid-sized nonprofits. Choose your issue area, track the right metrics, and generate polished reports for donors and stakeholders.',
  openGraph: {
    title: 'Impact Measurement | GrantLink',
    description:
      'Impact measurement tools for small and mid-size nonprofits.',
    url: 'https://grantlink.org/impact',
  },
}

export default function ImpactPage() {
  return <ImpactLanding />
}
