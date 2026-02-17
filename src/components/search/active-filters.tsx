'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import {
  OPPORTUNITY_TYPE_LABELS,
  FUNDER_TYPE_LABELS,
  FOCUS_AREAS,
  POPULATION_OPTIONS,
  ORG_TYPE_OPTIONS,
  AMOUNT_PRESETS,
} from '@/lib/constants'

interface FilterPill {
  key: string
  paramKey: string
  label: string
}

export function ActiveFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pills: FilterPill[] = []

  // Types
  const types = searchParams.get('types')?.split(',') || []
  types.forEach((t) => {
    const label = OPPORTUNITY_TYPE_LABELS[t as keyof typeof OPPORTUNITY_TYPE_LABELS]
    if (label) pills.push({ key: `type-${t}`, paramKey: 'types', label })
  })

  // Funder types
  const funderTypes = searchParams.get('funderTypes')?.split(',') || []
  funderTypes.forEach((t) => {
    const label = FUNDER_TYPE_LABELS[t as keyof typeof FUNDER_TYPE_LABELS]
    if (label) pills.push({ key: `ft-${t}`, paramKey: 'funderTypes', label })
  })

  // Focus areas
  const focusAreas = searchParams.get('focusAreas')?.split(',') || []
  focusAreas.forEach((slug) => {
    const area = FOCUS_AREAS.find((f) => f.slug === slug)
    if (area) pills.push({ key: `fa-${slug}`, paramKey: 'focusAreas', label: area.name })
  })

  // Populations
  const populations = searchParams.get('populations')?.split(',') || []
  populations.forEach((p) => {
    const pop = POPULATION_OPTIONS.find((o) => o.value === p)
    if (pop) pills.push({ key: `pop-${p}`, paramKey: 'populations', label: pop.label })
  })

  // Org types
  const orgTypes = searchParams.get('orgTypes')?.split(',') || []
  orgTypes.forEach((t) => {
    const org = ORG_TYPE_OPTIONS.find((o) => o.value === t)
    if (org) pills.push({ key: `org-${t}`, paramKey: 'orgTypes', label: org.label })
  })

  // Amount
  const amountMin = searchParams.get('amountMin')
  const amountMax = searchParams.get('amountMax')
  if (amountMin || amountMax) {
    const preset = AMOUNT_PRESETS.find(
      (p) => String(p.min) === amountMin && (p.max === null ? !amountMax : String(p.max) === amountMax)
    )
    pills.push({
      key: 'amount',
      paramKey: 'amount',
      label: preset?.label || `$${Number(amountMin || 0) / 100} - $${amountMax ? Number(amountMax) / 100 : '∞'}`,
    })
  }

  // Deadline
  const deadline = searchParams.get('deadline')
  if (deadline) {
    const labels: Record<string, string> = {
      open: 'Open now',
      '30days': 'Next 30 days',
      '90days': 'Next 90 days',
      rolling: 'Rolling',
    }
    pills.push({ key: 'deadline', paramKey: 'deadline', label: labels[deadline] || deadline })
  }

  // Query
  const q = searchParams.get('q')
  if (q) {
    pills.push({ key: 'q', paramKey: 'q', label: `"${q}"` })
  }

  if (pills.length === 0) return null

  const removePill = (pill: FilterPill) => {
    const params = new URLSearchParams(searchParams.toString())

    if (pill.paramKey === 'amount') {
      params.delete('amountMin')
      params.delete('amountMax')
    } else if (['types', 'funderTypes', 'focusAreas', 'populations', 'orgTypes'].includes(pill.paramKey)) {
      const current = params.get(pill.paramKey)?.split(',') || []
      const value = pill.key.split('-').slice(1).join('-')
      const next = current.filter((v) => v !== value)
      if (next.length > 0) {
        params.set(pill.paramKey, next.join(','))
      } else {
        params.delete(pill.paramKey)
      }
    } else {
      params.delete(pill.paramKey)
    }

    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const clearAll = () => {
    router.push(pathname)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3">
      {pills.map((pill) => (
        <button
          key={pill.key}
          onClick={() => removePill(pill)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          {pill.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      {pills.length > 1 && (
        <button
          onClick={clearAll}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
