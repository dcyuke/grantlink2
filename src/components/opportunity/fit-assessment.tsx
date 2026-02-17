'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ORG_TYPE_OPTIONS, POPULATION_OPTIONS } from '@/lib/constants'

interface FitAssessmentProps {
  eligibleOrgTypes: string[] | null
  eligibleGeography: string[] | null
  eligiblePopulations: string[] | null
  amountMin: number | null
  amountMax: number | null
  applicationComplexity: string
}

interface OrgProfile {
  orgType: string
  geography: string
  populations: string[]
  budget: string
  missionAlignment: string
}

interface FitResult {
  score: number
  matches: { label: string; status: 'match' | 'partial' | 'mismatch' | 'unknown' }[]
  summary: string
}

function calculateFit(profile: OrgProfile, props: FitAssessmentProps): FitResult {
  const matches: FitResult['matches'] = []
  let matchCount = 0
  let totalChecks = 0

  // Organization type check
  if (props.eligibleOrgTypes?.length) {
    totalChecks++
    if (profile.orgType && props.eligibleOrgTypes.includes(profile.orgType)) {
      matches.push({ label: 'Organization type eligible', status: 'match' })
      matchCount++
    } else if (profile.orgType) {
      matches.push({ label: 'Organization type may not be eligible', status: 'mismatch' })
    } else {
      matches.push({ label: 'Organization type not specified', status: 'unknown' })
      matchCount += 0.5
    }
  }

  // Geography check
  if (props.eligibleGeography?.length) {
    totalChecks++
    const geo = profile.geography.toUpperCase().trim()
    const isMatch = props.eligibleGeography.some(
      (g) => g === 'Global' || g.toUpperCase() === geo || geo.includes(g.toUpperCase())
    )
    if (geo && isMatch) {
      matches.push({ label: 'Geographic eligibility met', status: 'match' })
      matchCount++
    } else if (geo) {
      matches.push({ label: 'May not meet geographic requirements', status: 'mismatch' })
    } else {
      matches.push({ label: 'Geographic eligibility not checked', status: 'unknown' })
      matchCount += 0.5
    }
  }

  // Population alignment
  if (props.eligiblePopulations?.length && props.eligiblePopulations.length > 0) {
    totalChecks++
    const overlap = profile.populations.filter((p) =>
      props.eligiblePopulations!.includes(p)
    )
    if (overlap.length > 0) {
      matches.push({
        label: `Population alignment: ${overlap.length} of ${props.eligiblePopulations.length} match`,
        status: overlap.length >= props.eligiblePopulations.length / 2 ? 'match' : 'partial',
      })
      matchCount += overlap.length / props.eligiblePopulations.length
    } else if (profile.populations.length > 0) {
      matches.push({ label: 'Populations served may not align', status: 'mismatch' })
    } else {
      matches.push({ label: 'Population alignment not checked', status: 'unknown' })
      matchCount += 0.5
    }
  }

  // Mission alignment (text-based - simple keyword check)
  if (profile.missionAlignment.trim().length > 10) {
    totalChecks++
    matches.push({ label: 'Mission statement provided', status: 'match' })
    matchCount++
  } else if (profile.missionAlignment.trim().length > 0) {
    totalChecks++
    matches.push({ label: 'Consider adding more detail about your mission', status: 'partial' })
    matchCount += 0.5
  }

  const score = totalChecks > 0 ? Math.round((matchCount / totalChecks) * 100) : 50
  let summary: string
  if (score >= 80) {
    summary = 'Strong fit! Your organization aligns well with this opportunity\'s requirements.'
  } else if (score >= 60) {
    summary = 'Moderate fit. Some criteria align, but review the requirements carefully.'
  } else if (score >= 40) {
    summary = 'Partial fit. Several criteria may not align - review eligibility before applying.'
  } else {
    summary = 'This opportunity may not be the best match for your organization.'
  }

  return { score, matches, summary }
}

export function FitAssessment(props: FitAssessmentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [result, setResult] = useState<FitResult | null>(null)
  const [profile, setProfile] = useState<OrgProfile>({
    orgType: '',
    geography: '',
    populations: [],
    budget: '',
    missionAlignment: '',
  })

  const handleAssess = () => {
    const fitResult = calculateFit(profile, props)
    setResult(fitResult)
  }

  const togglePopulation = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      populations: prev.populations.includes(value)
        ? prev.populations.filter((p) => p !== value)
        : [...prev.populations, value],
    }))
    setResult(null)
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Am I a Good Fit?
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-primary/10 p-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Tell us about your organization and we&apos;ll evaluate how well you match this
            opportunity&apos;s requirements.
          </p>

          <div className="space-y-4">
            {/* Org type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Organization Type
              </label>
              <select
                value={profile.orgType}
                onChange={(e) => {
                  setProfile((p) => ({ ...p, orgType: e.target.value }))
                  setResult(null)
                }}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary/40"
              >
                <option value="">Select...</option>
                {ORG_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Geography */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Where are you based? (e.g., US, US-CA, Global)
              </label>
              <input
                type="text"
                value={profile.geography}
                onChange={(e) => {
                  setProfile((p) => ({ ...p, geography: e.target.value }))
                  setResult(null)
                }}
                placeholder="e.g., US, US-NY, Global"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary/40"
              />
            </div>

            {/* Populations served */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Populations Your Organization Serves
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                {POPULATION_OPTIONS.map((pop) => (
                  <label
                    key={pop.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-xs hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={profile.populations.includes(pop.value)}
                      onCheckedChange={() => togglePopulation(pop.value)}
                    />
                    <span className="text-muted-foreground">{pop.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mission alignment */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Why do you think you&apos;re a good fit?
              </label>
              <textarea
                value={profile.missionAlignment}
                onChange={(e) => {
                  setProfile((p) => ({ ...p, missionAlignment: e.target.value }))
                  setResult(null)
                }}
                rows={3}
                placeholder="Briefly describe your organization's mission and how it aligns with this opportunity..."
                className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary/40"
              />
            </div>

            <Button onClick={handleAssess} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Assess My Fit
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              {/* Score */}
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold',
                    result.score >= 80
                      ? 'bg-emerald-100 text-emerald-700'
                      : result.score >= 60
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-500/10 text-rose-600'
                  )}
                >
                  {result.score}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {result.score >= 80
                      ? 'Strong Fit'
                      : result.score >= 60
                        ? 'Moderate Fit'
                        : result.score >= 40
                          ? 'Partial Fit'
                          : 'Low Fit'}
                  </p>
                  <p className="text-xs text-muted-foreground">{result.summary}</p>
                </div>
              </div>

              {/* Criteria breakdown */}
              <div className="space-y-2">
                {result.matches.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    {m.status === 'match' && (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                    {m.status === 'partial' && (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    )}
                    {m.status === 'mismatch' && (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    )}
                    {m.status === 'unknown' && (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                This is a preliminary assessment. Always review the full eligibility criteria
                before applying.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
