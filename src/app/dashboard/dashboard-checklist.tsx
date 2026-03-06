'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2,
  Search,
  BarChart3,
  ClipboardCheck,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { getOrgProfile } from '@/lib/org-profile-storage'
import { getImpactConfig } from '@/lib/impact-storage'

interface ChecklistItem {
  id: string
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  check: () => boolean
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'org-profile',
    title: 'Set up your organization profile',
    description: 'Add your name, mission, and focus areas so every tool is personalized.',
    href: '/organization',
    icon: Building2,
    check: () => {
      const p = getOrgProfile()
      return !!(p?.name?.trim() && p?.orgType && p?.focusAreas?.length)
    },
  },
  {
    id: 'browse-grants',
    title: 'Browse grants and save one',
    description: 'Search for funding opportunities and bookmark the ones that fit.',
    href: '/search',
    icon: Search,
    check: () => {
      // Check if user has browsed (we can't check Supabase from client, so check localStorage flag)
      return localStorage.getItem('gl_has_searched') === 'true'
    },
  },
  {
    id: 'readiness',
    title: 'Take the readiness assessment',
    description: 'A quick quiz to see where your org stands for grant applications.',
    href: '/readiness',
    icon: ClipboardCheck,
    check: () => {
      return localStorage.getItem('gl_readiness_completed') === 'true'
    },
  },
  {
    id: 'impact-setup',
    title: 'Set up impact tracking',
    description: 'Choose your issue area and metrics to start measuring outcomes.',
    href: '/impact/setup',
    icon: BarChart3,
    check: () => {
      return getImpactConfig() !== null
    },
  },
]

export function DashboardChecklist() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const completed = new Set<string>()
    for (const item of CHECKLIST_ITEMS) {
      try {
        if (item.check()) completed.add(item.id)
      } catch {
        // localStorage may not be available
      }
    }
    setCompletedIds(completed)
  }, [])

  if (!mounted) return null

  const completedCount = completedIds.size
  const totalCount = CHECKLIST_ITEMS.length
  const allDone = completedCount === totalCount
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  // If all done, show a minimal congrats
  if (allDone) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
        <p className="text-sm font-medium text-emerald-800">
          You&apos;re all set up! Your GrantLink tools are ready to use.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between p-5"
      >
        <div className="text-left">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Getting Started
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {completedCount} of {totalCount} steps completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative flex h-10 w-10 items-center justify-center">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15.9155"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-muted/40"
              />
              <circle
                cx="18" cy="18" r="15.9155"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${progressPercent}, 100`}
                strokeLinecap="round"
                className="text-primary"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-foreground">
              {progressPercent}%
            </span>
          </div>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="border-t border-border/40 px-5 pb-5 pt-3">
          <div className="space-y-2">
            {CHECKLIST_ITEMS.map((item) => {
              const done = completedIds.has(item.id)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-start gap-3 rounded-lg p-3 transition-all ${
                    done
                      ? 'bg-muted/30 opacity-60'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <item.icon className={`mt-0.5 h-4 w-4 shrink-0 ${done ? 'text-muted-foreground/40' : 'text-primary/60'}`} />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
