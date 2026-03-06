'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  CalendarClock,
  BarChart3,
  Building2,
  ClipboardCheck,
  Handshake,
  ArrowRight,
} from 'lucide-react'
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

const SEARCH_EGGS: Record<string, string> = {
  'free money': "If only! But these grants are pretty close.",
  'help': "That's what we're here for!",
  'nonprofit life': "We see you. Coffee helps. Grants help more.",
  'drew': "Oh hey, that's the person who built this!",
  'yukelson': "The creator sends their regards!",
  'the answer': "42. But also, try searching for 'education'.",
}

const TOOL_CARDS = [
  {
    icon: Search,
    title: 'Find Funding',
    desc: 'Search grants, fellowships, and corporate giving',
    href: '/search',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: BarChart3,
    title: 'Measure Impact',
    desc: 'Track metrics and generate funder reports',
    href: '/impact',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    icon: ClipboardCheck,
    title: 'Check Readiness',
    desc: 'Assess your grant-readiness with a quick quiz',
    href: '/readiness',
    color: 'text-amber-600 bg-amber-100',
  },
  {
    icon: Handshake,
    title: 'Match Partners',
    desc: 'Find corporate funders aligned with your mission',
    href: '/partners',
    color: 'text-violet-600 bg-violet-100',
  },
  {
    icon: Building2,
    title: 'Org Profile',
    desc: 'One profile that powers all your tools',
    href: '/organization',
    color: 'text-emerald-600 bg-emerald-100',
  },
]

interface HeroSectionProps {
  deadlinesThisMonth?: number
}

export function HeroSection({ deadlinesThisMonth }: HeroSectionProps) {
  const [query, setQuery] = useState('')
  const [secretMessage, setSecretMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    const egg = SEARCH_EGGS[q.toLowerCase()]
    if (egg) {
      setSecretMessage(egg)
      setTimeout(() => {
        setSecretMessage(null)
        router.push(`/search?q=${encodeURIComponent(q)}`)
      }, 2000)
      return
    }
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    } else {
      router.push('/search')
    }
  }

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 via-background to-background" />

      <div className="container mx-auto px-4 pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline */}
          <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Your Nonprofit&apos;s{' '}
            <span className="text-primary">
              Back Office
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground/80 md:text-xl">
            Find funding. Measure impact. Prove your worth.{' '}
            <span className="text-foreground/70">
              Everything small and mid-size nonprofits need — in one place.
            </span>
          </p>

          {/* Deadline counter badge */}
          {deadlinesThisMonth != null && deadlinesThisMonth > 0 && (
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <CalendarClock className="h-4 w-4" />
              {deadlinesThisMonth} deadline{deadlinesThisMonth === 1 ? '' : 's'} closing this month
            </div>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto mb-6 max-w-2xl">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card p-1.5 shadow-md shadow-black/[0.03] transition-all focus-within:border-primary/40 focus-within:shadow-primary/5">
              <div className="flex flex-1 items-center gap-3 px-3">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  id="search-input"
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
            {/* Easter egg message */}
            {secretMessage && (
              <p className="mt-3 animate-[success-pop_0.3s_ease-out] text-sm font-medium text-primary">
                {secretMessage}
              </p>
            )}
          </form>

          {/* Quick filter pills */}
          <div className="mb-16 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground/70">Quick search:</span>
            {QUICK_FILTERS.map((filter) => (
              <Link
                key={filter.label}
                href={`/search?${filter.param}`}
                className="rounded-full border border-border/50 bg-transparent px-4 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
              >
                {filter.label}
              </Link>
            ))}
          </div>

          {/* Tool cards — shows the full platform at a glance */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {TOOL_CARDS.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group flex flex-col items-center rounded-xl border border-border/50 bg-card p-4 text-center shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${tool.color}`}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{tool.desc}</p>
                <ArrowRight className="mt-2 h-3.5 w-3.5 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
