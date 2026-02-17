'use client'

import { useState, useEffect } from 'react'
import { OpportunityCard } from '@/components/opportunity/opportunity-card'
import { getOrgProfile } from '@/lib/org-profile-storage'
import { calculateSearchFit } from '@/lib/fit-scoring'
import type { OpportunityListItem } from '@/types/opportunity'

interface SearchResultsWithFitProps {
  opportunities: OpportunityListItem[]
}

export function SearchResultsWithFit({ opportunities }: SearchResultsWithFitProps) {
  const [fitScores, setFitScores] = useState<
    Map<string, { score: number; label: string; color: string }>
  >(new Map())

  const computeScores = () => {
    const profile = getOrgProfile()
    if (!profile) {
      setFitScores(new Map())
      return
    }

    const scores = new Map<string, { score: number; label: string; color: string }>()
    for (const opp of opportunities) {
      const fitData = {
        eligibleOrgTypes: opp.eligible_org_types,
        eligibleGeography: opp.eligible_geography,
        eligiblePopulations: opp.eligible_populations,
        amountMin: opp.amount_min,
        amountMax: opp.amount_max,
        applicationComplexity: opp.application_complexity,
      }
      scores.set(opp.id, calculateSearchFit(profile, fitData))
    }
    setFitScores(scores)
  }

  // Compute on mount and when opportunities change
  useEffect(() => {
    computeScores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunities])

  // Listen for profile updates from the OrgProfilePanel on the same page
  useEffect(() => {
    const handleProfileUpdate = () => {
      computeScores()
    }

    window.addEventListener('orgProfileUpdated', handleProfileUpdate)
    return () => {
      window.removeEventListener('orgProfileUpdated', handleProfileUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunities])

  return (
    <div className="space-y-3">
      {opportunities.map((opp) => (
        <OpportunityCard
          key={opp.id}
          opportunity={opp}
          fitScore={fitScores.get(opp.id)}
        />
      ))}
    </div>
  )
}
