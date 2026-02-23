'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { FilterSection } from './filter-section'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  OPPORTUNITY_TYPE_LABELS,
  FUNDER_TYPE_LABELS,
  AMOUNT_PRESETS,
  COMPLEXITY_LABELS,
  ORG_TYPE_OPTIONS,
  POPULATION_OPTIONS,
  FOCUS_AREAS,
  US_STATES,
} from '@/lib/constants'
import type { OpportunityType, FunderType, ApplicationComplexity } from '@/types/opportunity'

// Amount slider range: 0 to $2M in cents
const SLIDER_MAX = 200000000 // $2M in cents
const SLIDER_STEP = 100000 // $1K steps

function formatSliderAmount(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1000000) return `$${(dollars / 1000000).toFixed(1)}M`
  if (dollars >= 1000) return `$${Math.round(dollars / 1000)}K`
  return `$${dollars}`
}

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
  const activeComplexity = getArrayParam('complexity')
  const activeDeadline = searchParams.get('deadline') || ''
  const activeAmountMin = searchParams.get('amountMin')
  const activeAmountMax = searchParams.get('amountMax')
  const activeNewThisWeek = searchParams.get('newThisWeek') === 'true'
  const activeGeography = getArrayParam('geography')
  const activeFirstTimeFriendly = searchParams.get('firstTimeFriendly') === 'true'

  const sliderMin = activeAmountMin ? Number(activeAmountMin) : 0
  const sliderMax = activeAmountMax ? Number(activeAmountMax) : SLIDER_MAX

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

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const params = new URLSearchParams(searchParams.toString())
      if (values[0] > 0) {
        params.set('amountMin', String(values[0]))
      } else {
        params.delete('amountMin')
      }
      if (values[1] < SLIDER_MAX) {
        params.set('amountMax', String(values[1]))
      } else {
        params.delete('amountMax')
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="space-y-0">
      {/* Quick Toggles */}
      <div className="border-b border-border/40 py-3 space-y-1">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50">
          <Checkbox
            checked={activeNewThisWeek}
            onCheckedChange={(checked) => updateParam('newThisWeek', checked ? 'true' : null)}
          />
          <span className="font-medium text-foreground">New this week</span>
          <span className="ml-auto rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            NEW
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50">
          <Checkbox
            checked={activeFirstTimeFriendly}
            onCheckedChange={(checked) => updateParam('firstTimeFriendly', checked ? 'true' : null)}
          />
          <span className="font-medium text-foreground">First-time friendly</span>
          <span className="ml-auto rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
            TIP
          </span>
        </label>
      </div>

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

      {/* Amount Range - Presets + Slider */}
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
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatSliderAmount(sliderMin)}</span>
            <span>{sliderMax >= SLIDER_MAX ? '$2M+' : formatSliderAmount(sliderMax)}</span>
          </div>
          <Slider
            min={0}
            max={SLIDER_MAX}
            step={SLIDER_STEP}
            value={[sliderMin, sliderMax]}
            onValueCommit={handleSliderChange}
            className="py-1"
          />
        </div>
      </FilterSection>

      {/* Application Complexity */}
      <FilterSection title="Complexity" defaultOpen={false}>
        {(Object.entries(COMPLEXITY_LABELS) as [ApplicationComplexity, string][])
          .filter(([value]) => value !== 'unknown')
          .map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={activeComplexity.includes(value)}
                onCheckedChange={() => toggleArrayValue('complexity', value)}
              />
              <span className="text-muted-foreground">{label}</span>
            </label>
          ))}
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

      {/* Geographic Focus */}
      <FilterSection title="State / Region" defaultOpen={false}>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          <label
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50"
          >
            <Checkbox
              checked={activeGeography.includes('US')}
              onCheckedChange={() => toggleArrayValue('geography', 'US')}
            />
            <span className="font-medium text-foreground">National (All US)</span>
          </label>
          {US_STATES.map((state) => (
            <label
              key={state.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50"
            >
              <Checkbox
                checked={activeGeography.includes(state.value)}
                onCheckedChange={() => toggleArrayValue('geography', state.value)}
              />
              <span className="text-muted-foreground">{state.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}
