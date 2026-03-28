'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Something went wrong.
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        An unexpected error occurred. This has been logged and we&apos;ll look
        into it.
      </p>
      <Button onClick={reset}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  )
}
