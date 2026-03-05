import type { Metadata } from 'next'
import { ImpactReport } from './impact-report'

export const metadata: Metadata = {
  title: 'Impact Report | GrantLink',
  description:
    'Generate polished impact reports, donor updates, and board presentations from your tracked data.',
}

export default function ImpactReportPage() {
  return <ImpactReport />
}
