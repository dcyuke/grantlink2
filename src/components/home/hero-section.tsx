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
import Image from 'next/image'

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
  },
  {
    icon: BarChart3,
    title: 'Measure Impact',
    desc: 'Track metrics and generate funder reports',
    href: '/impact',
  },
  {
    icon: ClipboardCheck,
    title: 'Grant Readiness Assessment',
    desc: 'Assess your grant-readiness with a quick quiz',
    href: '/readiness',
  },
  {
    icon: Handshake,
    title: 'Match Partners',
    desc: 'Find corporate funders aligned with your mission',
    href: '/partners',
  },
  {
    icon: Building2,
    title: 'Org Profile',
    desc: 'One profile that powers all your tools',
    href: '/organization',
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
      <div className="container mx-auto px-4 pb-12 pt-20 md:pb-20 md:pt-28">
        {/* Large serif display heading */}
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-sm font-medium tracking-widest uppercase text-muted-foreground/70">
            Built for small &amp; mid-size nonprofits
          </p>

          <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[5.5rem] lg:leading-[1.05]">
            Your Nonprofit&apos;s{' '}
            <span className="text-primary">
              Back Office.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Find funding. Measure impact. Tell your story — everything you need in one place, no enterprise budget required.
          </p>

          {/* Deadline counter badge */}
          {deadlinesThisMonth != null && deadlinesThisMonth > 0 && (
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <CalendarClock className="h-4 w-4" />
              {deadlinesThisMonth} deadline{deadlinesThisMonth === 1 ? '' : 's'} closing this month
            </div>
          )}

          {/* Search bar — pill shape */}
          <form onSubmit={handleSearch} className="mx-auto mb-6 max-w-2xl">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm transition-all focus-within:border-primary/40 focus-within:shadow-md">
              <div className="flex flex-1 items-center gap-3 pl-4">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search grants, fellowships, focus areas..."
                  className="w-full bg-transparent py-2.5 text-base outline-none placeholder:text-muted-foreground/50"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0 rounded-full px-6">
                Search
              </Button>
            </div>
            {secretMessage && (
              <p className="mt-3 animate-[success-pop_0.3s_ease-out] text-sm font-medium text-primary">
                {secretMessage}
              </p>
            )}
          </form>

          {/* Quick filter pills */}
          <div className="mb-16 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground/60">Quick search:</span>
            {QUICK_FILTERS.map((filter) => (
              <Link
                key={filter.label}
                href={`/search?${filter.param}`}
                className="rounded-full border border-border/60 bg-transparent px-4 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Hero Image — full-width landscape with rounded corners */}
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80"
            alt="Nonprofit team collaborating together"
            width={1200}
            height={600}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        {/* Tool cards — minimal grid with thin top borders like reference */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {TOOL_CARDS.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group flex flex-col border-t border-border pt-5"
              >
                <tool.icon className="mb-3 h-5 w-5 text-foreground/70 transition-colors group-hover:text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{tool.desc}</p>
                <ArrowRight className="mt-3 h-3.5 w-3.5 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
