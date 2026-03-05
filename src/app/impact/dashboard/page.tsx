import type { Metadata } from 'next'
import { ImpactDashboard } from './impact-dashboard'

export const metadata: Metadata = {
  title: 'Impact Dashboard | GrantLink',
  description:
    'Enter and visualize your nonprofit\'s impact data. Track outputs, outcomes, and long-term impact across reporting periods.',
}

export default function ImpactDashboardPage() {
  return <ImpactDashboard />
}
