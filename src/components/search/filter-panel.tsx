'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { FilterSection } from './filter-section'
import { Checkbox } from '@/components/ui/checkbox'
import {
  OPPORTUNITY_TYPE_LABELS,
  FUNDER_TYPE_LABELS,
  AMOUNT_PRESETS,
  ORG_TYPE_OPTIONS,
  POPULATION_OPTIONS,
  FOCUS_AREAS,
} from '@/lib/constants'
import type { OpportunityType, FunderType } from '@/types/opportunity'

export function FilterPanel() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getArrayParam = (key: string): string[] => {
    const val = searchParams.get(key)
    return val ? val.split(',') : []
  }

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const toggleArrayValue = useCallback(
    (key: string, value: string) => {
      const current = getArrayParam(key)
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      updateParam(key, next.length > 0 ? next.join(',') : null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, updateParam]
  )

  const activeTypes = getArrayParam('types')
  const activeFunderTypes = getArrayParam('funderTypes')
  const activeFocusAreas = getArrayParam('focusAreas')
  const activeOrgTypes = getArrayParam('orgTypes')
  const activePopulations = getArrayParam('populations')
  const activeDeadline = searchParams.get('deadline') || ''
  const activeAmountMin = searchParams.get('amountMin')
  const activeAmountMax = searchParams.get('amountMax')

  const isAmountPresetActive = (min: number, max: number | null) => {
    return (
      activeAmountMin === String(min) &&
      (max === null ? !activeAmountMax : activeAmountMax === String(max))
    )
  }

  const setAmountPreset = (min: number, max: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (isAmountPresetActive(min, max)) {
      params.delete('amountMin')
      params.delete('amountMax')
    } else {
      params.set('amountMin', String(min))
      if (max !== null) {
        params.set('amountMax', String(max))
      } else {
        params.delete('amountMax')
      }
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-0">
      {/* Funding Type */}
      <FilterSection title="Funding Type">
        {(Object.entries(OPPORTUNITY_TYPE_LABELS) as [OpportunityType, string][]).map(
          ([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={activeTypes.includes(value)}
                onCheckedChange={() => toggleArrayValue('types', value)}
              />
              <span className="text-muted-foreground">{label}</span>
            </label>
          )
        )}
      </FilterSection>

      {/* Funder Type */}
      <FilterSection title="Funder Type" defaultOpen={false}>
        {(Object.entries(FUNDER_TYPE_LABELS) as [FunderType, string][]).map(
          ([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={activeFunderTypes.includes(value)}
                onCheckedChange={() => toggleArrayValue('funderTypes', value)}
              />
              <span className="text-muted-foreground">{label}</span>
            </label>
          )
        )}
      </FilterSection>

      {/* Amount Range */}
      <FilterSection title="Funding Amount">
        <div className="grid grid-cols-2 gap-1.5">
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setAmountPreset(preset.min, preset.max)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                isAmountPresetActive(preset.min, preset.max)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Deadline */}
      <FilterSection title="Deadline">
        {[
          { value: '', label: 'Any time' },
          { value: 'open', label: 'Open now' },
          { value: '30days', label: 'Next 30 days' },
          { value: '90days', label: 'Next 90 days' },
          { value: 'rolling', label: 'Rolling / Continuous' },
        ].map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50"
          >
            <input
              type="radio"
              name="deadline"
              value={option.value}
              checked={activeDeadline === option.value}
              onChange={() => updateParam('deadline', option.value || null)}
              className="h-3.5 w-3.5 accent-primary"
            />
            <span className="text-muted-foreground">{option.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* Focus Area */}
      <FilterSection title="Focus Area" defaultOpen={false}>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {FOCUS_AREAS.map((area) => (
            <label
              key={area.slug}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={activeFocusAreas.includes(area.slug)}
                onCheckedChange={() => toggleArrayValue('focusAreas', area.slug)}
              />
              <span className="text-muted-foreground">{area.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Population Served */}
      <FilterSection title="Population Served" defaultOpen={false}>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {POPULATION_OPTIONS.map((pop) => (
            <label
              key={pop.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={activePopulations.includes(pop.value)}
                onCheckedChange={() => toggleArrayValue('populations', pop.value)}
              />
              <span className="text-muted-foreground">{pop.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Eligibility */}
      <FilterSection title="Eligibility" defaultOpen={false}>
        {ORG_TYPE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50"
          >
            <Checkbox
              checked={activeOrgTypes.includes(option.value)}
              onCheckedChange={() => toggleArrayValue('orgTypes', option.value)}
            />
            <span className="text-muted-foreground">{option.label}</span>
          </label>
        ))}
      </FilterSection>
    </div>
  )
}
