'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Building2,
  Target,
  Users,
  MapPin,
  DollarSign,
  Globe,
  Mail,
  CheckCircle2,
  ArrowRight,
  Search,
  BarChart3,
  FileText,
  Handshake,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOrgProfile, saveOrgProfile } from '@/lib/org-profile-storage'
import type { OrgProfile } from '@/lib/fit-scoring'
import {
  ORG_TYPE_OPTIONS,
  POPULATION_OPTIONS,
  FOCUS_AREAS,
} from '@/lib/constants'
import { Checkbox } from '@/components/ui/checkbox'

// ── Constants ────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { value: 'under_100k', label: 'Under $100K' },
  { value: '100k_500k', label: '$100K - $500K' },
  { value: '500k_1m', label: '$500K - $1M' },
  { value: '1m_5m', label: '$1M - $5M' },
  { value: '5m_plus', label: '$5M+' },
]

const TEAM_SIZE_OPTIONS = [
  { value: '1-5', label: '1-5 people' },
  { value: '6-15', label: '6-15 people' },
  { value: '16-50', label: '16-50 people' },
  { value: '51-200', label: '51-200 people' },
  { value: '200+', label: '200+ people' },
]

function emptyProfile(): OrgProfile {
  return {
    name: '',
    mission: '',
    focusAreas: [],
    yearFounded: undefined,
    website: '',
    contactEmail: '',
    orgType: '',
    geography: '',
    populations: [],
    budget: '',
    missionAlignment: '',
    teamSize: '',
    tier: 'free',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// ── Connected Tools Section ──────────────────────────────────────

function ConnectedTools({ profile }: { profile: OrgProfile }) {
  const hasFocusAreas = (profile.focusAreas?.length ?? 0) > 0
  const hasName = !!profile.name?.trim()
  const hasOrgType = !!profile.orgType

  const tools = [
    {
      icon: Search,
      label: 'Grant Search',
      href: '/search',
      connected: hasOrgType,
      desc: hasOrgType
        ? 'Fit scores active on search results'
        : 'Add org type to see fit scores',
      color: 'text-blue-600',
    },
    {
      icon: BarChart3,
      label: 'Impact Dashboard',
      href: '/impact',
      connected: hasName && hasFocusAreas,
      desc:
        hasName && hasFocusAreas
          ? 'Org name and focus area connected'
          : 'Add name and focus areas to connect',
      color: 'text-emerald-600',
    },
    {
      icon: FileText,
      label: 'Reports',
      href: '/impact/report',
      connected: hasName,
      desc: hasName
        ? 'Org name auto-fills in reports'
        : 'Add org name for report headers',
      color: 'text-purple-600',
    },
    {
      icon: Handshake,
      label: 'Partner Matching',
      href: '/partners',
      connected: hasFocusAreas,
      desc: hasFocusAreas
        ? 'Focus areas pre-selected in partner filter'
        : 'Add focus areas for partner matching',
      color: 'text-amber-600',
    },
    {
      icon: ClipboardCheck,
      label: 'Grant Readiness Assessment',
      href: '/readiness',
      connected: hasOrgType,
      desc: hasOrgType
        ? 'Org type informs readiness context'
        : 'Add org type for readiness context',
      color: 'text-rose-600',
    },
  ]

  const connectedCount = tools.filter((t) => t.connected).length

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Connected Tools
        </h2>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {connectedCount} of {tools.length} active
        </span>
      </div>
      <div className="space-y-2">
        {tools.map((tool) => (
          <Link
            key={tool.label}
            href={tool.href}
            className="flex items-center gap-3 rounded-lg border border-border/30 p-3 transition-all hover:border-primary/20 hover:bg-muted/30"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                tool.connected ? 'bg-primary/10' : 'bg-muted/60'
              }`}
            >
              <tool.icon
                className={`h-4 w-4 ${
                  tool.connected ? tool.color : 'text-muted-foreground/50'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {tool.label}
              </p>
              <p className="text-xs text-muted-foreground">{tool.desc}</p>
            </div>
            {tool.connected ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────

export function OrgProfileHub() {
  const [profile, setProfile] = useState<OrgProfile>(emptyProfile)
  const [loaded, setLoaded] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    const existing = getOrgProfile()
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration: load from localStorage on mount
      setProfile({ ...emptyProfile(), ...existing })
    }
    setLoaded(true)
  }, [])

  const handleSave = useCallback(() => {
    const toSave: OrgProfile = {
      ...profile,
      // Keep missionAlignment in sync with mission for fit scoring
      missionAlignment: profile.mission ?? profile.missionAlignment ?? '',
      updatedAt: new Date().toISOString(),
      createdAt: profile.createdAt || new Date().toISOString(),
    }
    saveOrgProfile(toSave)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }, [profile])

  const update = <K extends keyof OrgProfile>(
    key: K,
    value: OrgProfile[K],
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const toggleFocusArea = (slug: string) => {
    setProfile((prev) => {
      const current = prev.focusAreas ?? []
      return {
        ...prev,
        focusAreas: current.includes(slug)
          ? current.filter((s) => s !== slug)
          : [...current, slug],
      }
    })
  }

  const togglePopulation = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      populations: prev.populations.includes(value)
        ? prev.populations.filter((p) => p !== value)
        : [...prev.populations, value],
    }))
  }

  const completionPct = (() => {
    let filled = 0
    const total = 7
    if (profile.name?.trim()) filled++
    if (profile.mission?.trim()) filled++
    if ((profile.focusAreas?.length ?? 0) > 0) filled++
    if (profile.orgType) filled++
    if (profile.geography?.trim()) filled++
    if (profile.budget) filled++
    if (profile.populations.length > 0) filled++
    return Math.round((filled / total) * 100)
  })()

  if (!loaded) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
                My Organization
              </h1>
              <p className="text-sm text-muted-foreground">
                Your profile connects and personalizes every tool in GrantLink.
              </p>
            </div>
          </div>

          {/* Completion ring */}
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" className="stroke-muted/60" />
                <circle
                  cx="28" cy="28" r="24" fill="none" strokeWidth="4"
                  strokeLinecap="round"
                  className="stroke-primary transition-all duration-700"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 24}`,
                    strokeDashoffset: `${2 * Math.PI * 24 * (1 - completionPct / 100)}`,
                  }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {completionPct}%
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {completionPct === 100 ? 'Profile complete!' : 'Profile completion'}
              </p>
              <p className="text-xs text-muted-foreground">
                {completionPct < 100
                  ? `Fill in ${Math.round((100 - completionPct) / (100 / 7))} more fields to unlock full personalization`
                  : 'All tools are fully connected'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
          {/* Main form */}
          <div className="space-y-8">
            {/* Identity */}
            <section className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-5 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Organization Identity
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={profile.name ?? ''}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="e.g., Community Bridge Foundation"
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Mission Statement
                  </label>
                  <textarea
                    value={profile.mission ?? ''}
                    onChange={(e) => update('mission', e.target.value)}
                    placeholder="Describe your organization's purpose and the change you're working to create..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Organization Type
                    </label>
                    <select
                      value={profile.orgType}
                      onChange={(e) => update('orgType', e.target.value)}
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      <option value="">Select...</option>
                      {ORG_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Year Founded
                    </label>
                    <input
                      type="number"
                      value={profile.yearFounded ?? ''}
                      onChange={(e) =>
                        update(
                          'yearFounded',
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      placeholder="e.g., 2018"
                      min={1800}
                      max={new Date().getFullYear()}
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Focus Areas */}
            <section className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Focus Areas
                </h2>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Select all that apply. This personalizes grant search, partner
                matching, and impact tracking.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FOCUS_AREAS.map((area) => {
                  const selected = profile.focusAreas?.includes(area.slug)
                  return (
                    <button
                      key={area.slug}
                      type="button"
                      onClick={() => toggleFocusArea(area.slug)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30'
                          : 'border-border/40 text-muted-foreground hover:border-primary/20 hover:text-foreground'
                      }`}
                    >
                      {area.name}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Size & Location */}
            <section className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-5 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Size & Location
                </h2>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <DollarSign className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                      Annual Budget
                    </label>
                    <select
                      value={profile.budget}
                      onChange={(e) => update('budget', e.target.value)}
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      <option value="">Select...</option>
                      {BUDGET_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <Users className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                      Team Size
                    </label>
                    <select
                      value={profile.teamSize ?? ''}
                      onChange={(e) => update('teamSize', e.target.value)}
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      <option value="">Select...</option>
                      {TEAM_SIZE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      <MapPin className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={profile.geography}
                      onChange={(e) => update('geography', e.target.value)}
                      placeholder="e.g., New York, NY"
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Populations Served */}
            <section className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Populations Served
                </h2>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Select all communities your organization serves. This improves
                grant fit scoring.
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                {POPULATION_OPTIONS.map((pop) => (
                  <label
                    key={pop.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={profile.populations.includes(pop.value)}
                      onCheckedChange={() => togglePopulation(pop.value)}
                      className="h-4 w-4"
                    />
                    <span className="text-foreground/80">{pop.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Contact & Web */}
            <section className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-5 flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Contact & Web
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    <Globe className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={profile.website ?? ''}
                    onChange={(e) => update('website', e.target.value)}
                    placeholder="https://yourorg.org"
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    <Mail className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={profile.contactEmail ?? ''}
                    onChange={(e) => update('contactEmail', e.target.value)}
                    placeholder="info@yourorg.org"
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
            </section>

            {/* Save button */}
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-6">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {justSaved
                    ? 'Profile saved!'
                    : 'Save your profile to connect your tools'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Your profile powers every tool in GrantLink.
                </p>
              </div>
              <Button onClick={handleSave} className="gap-2">
                {justSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ConnectedTools profile={profile} />

            {/* Quick actions */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h2 className="mb-3 font-serif text-lg font-semibold text-foreground">
                Next Steps
              </h2>
              <div className="space-y-2">
                {completionPct < 50 && (
                  <p className="text-xs text-muted-foreground">
                    Fill in more details above to unlock personalized
                    experiences across all GrantLink tools.
                  </p>
                )}
                {completionPct >= 50 && (
                  <div className="space-y-2">
                    <Link
                      href="/search"
                      className="flex items-center gap-2 rounded-lg border border-border/30 p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
                    >
                      <Search className="h-4 w-4 text-primary" />
                      Search grants with fit scoring
                      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                    <Link
                      href="/impact"
                      className="flex items-center gap-2 rounded-lg border border-border/30 p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
                    >
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Set up impact tracking
                      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                    <Link
                      href="/readiness"
                      className="flex items-center gap-2 rounded-lg border border-border/30 p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
                    >
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      Check your grant readiness
                      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
