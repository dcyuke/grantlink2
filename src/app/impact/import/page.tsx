import type { Metadata } from 'next'
import { ImportWizard } from './import-wizard'

export const metadata: Metadata = {
  title: 'Import Data | GrantLink',
  description:
    'Import your existing impact data from CSV, Excel, or pasted text. GrantLink will automatically detect and organize your data.',
}

export default function ImportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <ImportWizard />
      </div>
    </div>
  )
}
