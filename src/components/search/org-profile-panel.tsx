'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, ChevronDown, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ORG_TYPE_OPTIONS, POPULATION_OPTIONS } from '@/lib/constants'
import { getOrgProfile, saveOrgProfile, clearOrgProfile } from '@/lib/org-profile-storage'
import type { OrgProfile } from '@/lib/fit-scoring'

const BUDGET_OPTIONS = [
  { value: 'under_100k', label: 'Under $100K' },
  { value: '100k_500k', label: '$100K – $500K' },
  { value: '500k_1m', label: '$500K – $1M' },
  { value: '1m_5m', label: '$1M – $5M' },
  { value: '5m_plus', label: '$5M+' },
]

function loadInitialProfile(): OrgProfile {
  const saved = getOrgProfile()
  return saved ?? {
    orgType: '',
    geography: '',
    populations: [],
    budget: '',
    missionAlignment: '',
  }
}

export function OrgProfilePanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [savedProfile, setSavedProfile] = useState<OrgProfile | null>(() => getOrgProfile())
  const [profile, setProfile] = useState<OrgProfile>(loadInitialProfile)

  const handleSave = () => {
    saveOrgProfile(profile)
    setSavedProfile(profile)
    setIsEditing(false)
  }

  const handleClear = () => {
    clearOrgProfile()
    setSavedProfile(null)
    setProfile({
      orgType: '',
      geography: '',
      populations: [],
      budget: '',
      missionAlignment: '',
    })
    setIsEditing(false)
  }

  const togglePopulation = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      populations: prev.populations.includes(value)
        ? prev.populations.filter((p) => p !== value)
        : [...prev.populations, value],
    }))
  }

  const orgTypeLabel = ORG_TYPE_OPTIONS.find((o) => o.value === savedProfile?.orgType)?.label
  const budgetLabel = BUDGET_OPTIONS.find((o) => o.value === savedProfile?.budget)?.label

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            My Organization
          </span>
          {savedProfile && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Active
            </span>
          )}
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
          {/* Saved profile summary */}
          {savedProfile && !isEditing ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Fit scores are shown on search results based on your profile.
              </p>
              <div className="rounded-lg border border-border bg-card p-3 text-sm">
                {orgTypeLabel && (
                  <p className="text-foreground"><span className="text-muted-foreground">Type:</span> {orgTypeLabel}</p>
                )}
                {savedProfile.geography && (
                  <p className="text-foreground"><span className="text-muted-foreground">Location:</span> {savedProfile.geography}</p>
                )}
                {savedProfile.populations.length > 0 && (
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Populations:</span>{' '}
                    {savedProfile.populations
                      .map((p) => POPULATION_OPTIONS.find((o) => o.value === p)?.label || p)
                      .join(', ')}
                  </p>
                )}
                {budgetLabel && (
                  <p className="text-foreground"><span className="text-muted-foreground">Budget:</span> {budgetLabel}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  <Pencil className="mr-1.5 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            /* Edit form */
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Enter your organization details to see fit scores on search results.
              </p>

              {/* Org type */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Organization Type
                </label>
                <select
                  value={profile.orgType}
                  onChange={(e) => setProfile((p) => ({ ...p, orgType: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-primary/40"
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
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Location
                </label>
                <input
                  type="text"
                  value={profile.geography}
                  onChange={(e) => setProfile((p) => ({ ...p, geography: e.target.value }))}
                  placeholder="e.g., US, US-NY, Global"
                  className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-primary/40"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Annual Budget
                </label>
                <select
                  value={profile.budget}
                  onChange={(e) => setProfile((p) => ({ ...p, budget: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-primary/40"
                >
                  <option value="">Select...</option>
                  {BUDGET_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Populations served */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Populations Served
                </label>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                  {POPULATION_OPTIONS.map((pop) => (
                    <label
                      key={pop.value}
                      className="flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={profile.populations.includes(pop.value)}
                        onCheckedChange={() => togglePopulation(pop.value)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-muted-foreground">{pop.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="flex-1">
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  Save Profile
                </Button>
                {savedProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProfile(savedProfile)
                      setIsEditing(false)
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
