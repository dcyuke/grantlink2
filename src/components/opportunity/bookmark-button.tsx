'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  opportunityId: string
  className?: string
}

// Global cache of saved IDs to avoid redundant fetches
let savedIdsCache: Set<string> | null = null
let fetchPromise: Promise<void> | null = null

async function fetchSavedIds(): Promise<Set<string>> {
  if (savedIdsCache) return savedIdsCache

  if (!fetchPromise) {
    fetchPromise = fetch('/api/saved')
      .then((res) => res.json())
      .then((data) => {
        savedIdsCache = new Set(
          (data.saved ?? []).map((s: { opportunity_id: string }) => s.opportunity_id)
        )
      })
      .catch(() => {
        savedIdsCache = new Set()
      })
      .finally(() => {
        fetchPromise = null
      })
  }

  await fetchPromise
  return savedIdsCache ?? new Set()
}

function invalidateCache() {
  savedIdsCache = null
}

export function BookmarkButton({ opportunityId, className }: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSavedIds().then((ids) => {
      setIsSaved(ids.has(opportunityId))
    })
  }, [opportunityId])

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setLoading(true)

      const action = isSaved ? 'unsave' : 'save'

      try {
        const res = await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunityId, action }),
        })

        if (res.status === 401) {
          // Not logged in — redirect to login
          window.location.href = '/login?redirect=/search'
          return
        }

        const data = await res.json()
        setIsSaved(data.saved)
        invalidateCache()
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    },
    [isSaved, opportunityId]
  )

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={isSaved ? 'Remove bookmark' : 'Save grant'}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
        isSaved
          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
        loading && 'opacity-50',
        className
      )}
    >
      <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />
    </button>
  )
}
