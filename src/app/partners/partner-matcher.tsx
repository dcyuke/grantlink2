'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FOCUS_AREAS } from '@/lib/constants'
import {
  CORPORATE_PARTNERS,
  PARTNERSHIP_TYPES,
  type CorporatePartner,
} from '@/lib/corporate-partners'
import {
  ExternalLink,
  MapPin,
  Building2,
  Handshake,
  CheckCircle2,
  Filter,
  X,
} from 'lucide-react'

export function PartnerMatcher() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const toggleArea = (slug: string) => {
    setSelectedAreas((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const toggleType = (value: string) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const clearAll = () => {
    setSelectedAreas([])
    setSelectedTypes([])
  }

  // Score and filter partners
  const rankedPartners = useMemo(() => {
    let partners = CORPORATE_PARTNERS.map((partner) => {
      const matchingAreas = selectedAreas.length > 0
        ? partner.focusAreas.filter((a) => selectedAreas.includes(a))
        : partner.focusAreas
      const areaScore = selectedAreas.length > 0
        ? matchingAreas.length / selectedAreas.length
        : 0

      const matchingTypes = selectedTypes.length > 0
        ? partner.partnershipTypes.filter((t) => selectedTypes.includes(t))
        : partner.partnershipTypes
      const typeScore = selectedTypes.length > 0
        ? matchingTypes.length / selectedTypes.length
        : 0

      const totalScore = selectedAreas.length > 0 && selectedTypes.length > 0
        ? (areaScore * 0.7 + typeScore * 0.3)
        : selectedAreas.length > 0
          ? areaScore
          : selectedTypes.length > 0
            ? typeScore
            : 0

      return {
        ...partner,
        matchingAreas,
        matchingTypes,
        score: totalScore,
      }
    })

    // Filter: must match at least one selected area or type
    if (selectedAreas.length > 0 || selectedTypes.length > 0) {
      partners = partners.filter((p) => {
        const passesArea = selectedAreas.length === 0 || p.matchingAreas.length > 0
        const passesType = selectedTypes.length === 0 || p.matchingTypes.length > 0
        return passesArea && passesType
      })
      // Sort by score descending
      partners.sort((a, b) => b.score - a.score)
    }

    return partners
  }, [selectedAreas, selectedTypes])

  const hasFilters = selectedAreas.length > 0 || selectedTypes.length > 0

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Filters sidebar */}
      <aside className="w-full shrink-0 lg:w-72">
        <div className="sticky top-20 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Filter className="h-4 w-4" />
              Filter Partners
            </h2>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Focus Areas */}
          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Focus Areas
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {FOCUS_AREAS.map((area) => {
                const isActive = selectedAreas.includes(area.slug)
                return (
                  <button
                    key={area.slug}
                    onClick={() => toggleArea(area.slug)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50'
                    }`}
                  >
                    {area.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Partnership Types */}
          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Partnership Types
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {PARTNERSHIP_TYPES.map((type) => {
                const isActive = selectedTypes.includes(type.value)
                return (
                  <button
                    key={type.value}
                    onClick={() => toggleType(type.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50'
                    }`}
                  >
                    {type.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Result count */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{rankedPartners.length}</span>{' '}
              {rankedPartners.length === 1 ? 'partner' : 'partners'} found
            </p>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div className="min-w-0 flex-1">
        {rankedPartners.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">No matches found</h3>
            <p className="text-sm text-muted-foreground">
              Try selecting different focus areas or partnership types to find matching corporate partners.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rankedPartners.map((partner) => (
              <PartnerCard
                key={partner.slug}
                partner={partner}
                matchingAreas={partner.matchingAreas}
                matchingTypes={partner.matchingTypes}
                score={partner.score}
                hasFilters={hasFilters}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface PartnerCardProps {
  partner: CorporatePartner
  matchingAreas: string[]
  matchingTypes: string[]
  score: number
  hasFilters: boolean
}

function PartnerCard({ partner, matchingAreas, matchingTypes, score, hasFilters }: PartnerCardProps) {
  const areaNames = FOCUS_AREAS.filter((a) => partner.focusAreas.includes(a.slug))
  const typeLabels = PARTNERSHIP_TYPES.filter((t) => partner.partnershipTypes.includes(t.value))

  const matchPercent = hasFilters ? Math.round(score * 100) : null

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{partner.name}</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {partner.headquarters}
          </p>
        </div>
        {matchPercent !== null && matchPercent > 0 && (
          <Badge
            className={`shrink-0 text-xs font-semibold ${
              matchPercent >= 75
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                : matchPercent >= 50
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-50'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-50'
            }`}
          >
            {matchPercent}% match
          </Badge>
        )}
      </div>

      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {partner.description}
      </p>

      {/* Focus areas */}
      <div className="mb-3">
        <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CheckCircle2 className="h-3 w-3" />
          Focus Areas
        </h4>
        <div className="flex flex-wrap gap-1">
          {areaNames.map((area) => {
            const isMatching = matchingAreas.includes(area.slug)
            return (
              <span
                key={area.slug}
                className={`rounded-md px-2 py-0.5 text-[11px] ${
                  hasFilters && isMatching
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {area.name}
              </span>
            )
          })}
        </div>
      </div>

      {/* Partnership types */}
      <div className="mb-4">
        <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Handshake className="h-3 w-3" />
          Partnership Types
        </h4>
        <div className="flex flex-wrap gap-1">
          {typeLabels.map((type) => {
            const isMatching = matchingTypes.includes(type.value)
            return (
              <span
                key={type.value}
                className={`rounded-md px-2 py-0.5 text-[11px] ${
                  hasFilters && isMatching
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {type.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-2">
        <Button asChild size="sm" variant="outline" className="w-full">
          <a href={partner.givingUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Visit Giving Page
          </a>
        </Button>
      </div>
    </div>
  )
}
