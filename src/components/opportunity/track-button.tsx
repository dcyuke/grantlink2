'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ClipboardList, Check, Loader2 } from 'lucide-react'

interface TrackButtonProps {
  opportunityId: string
}

export function TrackButton({ opportunityId }: TrackButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'added'>('idle')

  const handleTrack = useCallback(async () => {
    setStatus('loading')

    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', opportunityId }),
      })

      if (res.status === 401) {
        window.location.href = '/login?redirect=/search'
        return
      }

      if (res.ok) {
        setStatus('added')
      } else {
        setStatus('idle')
      }
    } catch {
      setStatus('idle')
    }
  }, [opportunityId])

  if (status === 'added') {
    return (
      <Button variant="outline" className="w-full" disabled>
        <Check className="mr-2 h-4 w-4 text-emerald-600" />
        Added to Tracker
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleTrack}
      disabled={status === 'loading'}
    >
      {status === 'loading' ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ClipboardList className="mr-2 h-4 w-4" />
      )}
      Track Application
    </Button>
  )
}
