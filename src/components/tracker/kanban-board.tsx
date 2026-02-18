'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Trash2,
  Search,
  ClipboardList,
} from 'lucide-react'

const COLUMNS = [
  { id: 'researching', label: 'Researching', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'writing', label: 'Writing', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'submitted', label: 'Submitted', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'awarded', label: 'Awarded', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
] as const

type ColumnId = (typeof COLUMNS)[number]['id']

interface TrackedApp {
  id: string
  status: ColumnId
  notes: string
  submitted_at: string | null
  awarded_amount: number | null
  created_at: string
  opportunities: {
    id: string
    slug: string
    title: string
    amount_display: string | null
    deadline_date: string | null
    deadline_display: string | null
    funders: { name: string } | null
  } | null
}

export function KanbanBoard() {
  const [apps, setApps] = useState<TrackedApp[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tracker')
      .then((res) => res.json())
      .then((data) => {
        setApps(
          (data.applications ?? []).map((a: Record<string, unknown>) => ({
            ...a,
            opportunities: a.opportunities as TrackedApp['opportunities'],
          }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const moveApp = useCallback(async (appId: string, newStatus: ColumnId) => {
    setUpdating(appId)

    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: appId, status: newStatus }),
      })

      if (res.ok) {
        setApps((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        )
      }
    } catch {
      // Silently fail
    } finally {
      setUpdating(null)
    }
  }, [])

  const removeApp = useCallback(async (appId: string) => {
    setUpdating(appId)
    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', id: appId }),
      })

      if (res.ok) {
        setApps((prev) => prev.filter((a) => a.id !== appId))
      }
    } catch {
      // Silently fail
    } finally {
      setUpdating(null)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="mb-1 text-lg font-semibold text-foreground">No applications yet</h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          Start tracking your grant applications by saving an opportunity and adding it to your tracker.
        </p>
        <Button asChild>
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            Find Grants
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnApps = apps.filter((a) => a.status === column.id)
        const colIndex = COLUMNS.findIndex((c) => c.id === column.id)

        return (
          <div
            key={column.id}
            className="w-72 shrink-0 rounded-xl border border-border/60 bg-muted/20 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                  column.color
                )}
              >
                {column.label}
              </span>
              <span className="text-xs text-muted-foreground">{columnApps.length}</span>
            </div>

            <div className="space-y-2">
              {columnApps.map((app) => {
                const opp = app.opportunities
                if (!opp) return null

                return (
                  <div
                    key={app.id}
                    className={cn(
                      'rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-opacity',
                      updating === app.id && 'opacity-50'
                    )}
                  >
                    <Link
                      href={`/opportunity/${opp.slug}`}
                      className="mb-1 block text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {opp.title}
                    </Link>

                    {opp.funders?.name && (
                      <p className="mb-2 text-xs text-muted-foreground">{opp.funders.name}</p>
                    )}

                    <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {opp.amount_display && <span>💰 {opp.amount_display}</span>}
                      {opp.deadline_display && <span>📅 {opp.deadline_display}</span>}
                    </div>

                    {/* Move buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {colIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => moveApp(app.id, COLUMNS[colIndex - 1].id)}
                            disabled={updating === app.id}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title={`Move to ${COLUMNS[colIndex - 1].label}`}
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {colIndex < COLUMNS.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveApp(app.id, COLUMNS[colIndex + 1].id)}
                            disabled={updating === app.id}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title={`Move to ${COLUMNS[colIndex + 1].label}`}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Link
                          href={`/opportunity/${opp.slug}`}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="View opportunity"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeApp(app.id)}
                          disabled={updating === app.id}
                          className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          title="Remove from tracker"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
