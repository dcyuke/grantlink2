'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const QUICK_FILTERS = [
  { label: 'Grants', param: 'types=grant' },
  { label: 'Fellowships', param: 'types=fellowship' },
  { label: 'Prizes', param: 'types=prize,competition' },
  { label: 'Corporate Giving', param: 'types=corporate_giving' },
  { label: 'Impact Investment', param: 'types=impact_investment' },
  { label: 'Accelerators', param: 'types=accelerator' },
]

interface HeroSectionProps {
  deadlinesThisMonth?: number
}

export function HeroSection({ deadlinesThisMonth }: HeroSectionProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/search')
    }
  }

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/50 via-background to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]" />

      <div className="container mx-auto px-4 pb-16 pt-20 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Find Funding for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              What Matters
            </span>
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Search available grants, fellowships, prizes, and funding opportunities
            from foundations, corporations, and government agencies.
          </p>

          {/* Deadline counter badge */}
          {deadlinesThisMonth != null && deadlinesThisMonth > 0 && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-800">
              <CalendarClock className="h-4 w-4" />
              {deadlinesThisMonth} deadline{deadlinesThisMonth === 1 ? '' : 's'} closing this month
            </div>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto mb-6 max-w-2xl">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-lg shadow-black/5 transition-all focus-within:border-primary/40 focus-within:shadow-primary/10">
              <div className="flex flex-1 items-center gap-3 px-3">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search grants, fellowships, focus areas..."
                  className="w-full bg-transparent py-2.5 text-base outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0 rounded-lg px-6">
                Search
              </Button>
            </div>
          </form>

          {/* Quick filter pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Quick search:</span>
            {QUICK_FILTERS.map((filter) => (
              <Link
                key={filter.label}
                href={`/search?${filter.param}`}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
