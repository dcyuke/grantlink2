import type { Metadata } from 'next'
import { DataDashboard } from './data-dashboard'

export const metadata: Metadata = {
  title: 'Impact Data | GrantLink',
  description:
    'View and analyze your imported impact data with interactive charts and data tables.',
}

export default function DataPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DataDashboard />
    </div>
  )
}
