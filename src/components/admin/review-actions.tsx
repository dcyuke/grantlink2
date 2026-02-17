'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReviewActionsProps {
  opportunityId: string
  funderId: string
  token: string
}

export function ReviewActions({ opportunityId, funderId, token }: ReviewActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)
  const [error, setError] = useState('')

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action)
    setError('')

    try {
      const res = await fetch(`/api/admin/review?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, funderId, action }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Action failed')
      }

      setDone(action === 'approve' ? 'approved' : 'rejected')
      // Refresh server data after short delay so user sees the status change
      setTimeout(() => router.refresh(), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  if (done) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
          done === 'approved'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-700'
        }`}
      >
        {done === 'approved' ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Approved and published!
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            Rejected and removed.
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={() => handleAction('approve')}
        disabled={loading !== null}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {loading === 'approve' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        Approve & Publish
      </Button>

      <Button
        variant="outline"
        onClick={() => handleAction('reject')}
        disabled={loading !== null}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {loading === 'reject' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="mr-2 h-4 w-4" />
        )}
        Reject
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
