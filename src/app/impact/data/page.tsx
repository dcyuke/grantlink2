import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DataDashboard } from './data-dashboard'

export const metadata: Metadata = {
  title: 'Impact Data | GrantLink',
  description:
    'View and analyze your imported impact data with interactive charts and data tables.',
}

export default function DataPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading dashboard…</div>}>
        <DataDashboard />
      </Suspense>
    </div>
  )
}
