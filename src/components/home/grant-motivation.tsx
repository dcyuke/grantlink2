'use client'

import { useRef } from 'react'

const QUOTES = [
  { text: 'Small grants lead to big impact.', context: 'Every dollar counts.' },
  { text: 'Behind every funded program is someone who decided to try.', context: 'That someone is you.' },
  { text: 'Grant writing tip: the first draft is just the beginning.', context: 'Keep refining.' },
  { text: 'Funders want to say yes. Help them find a reason.', context: 'Tell your story.' },
  { text: 'The best proposals solve real problems with clear plans.', context: 'Show the path forward.' },
  { text: 'Your mission deserves the resources to grow.', context: 'Keep searching.' },
  { text: 'Every great nonprofit started with a first grant.', context: 'Start somewhere.' },
  { text: 'Persistence in grant seeking pays compounding returns.', context: 'Stay the course.' },
]

function getDailyQuote() {
  const dayIndex = Math.floor(Date.now() / 86400000) % QUOTES.length
  return QUOTES[dayIndex]
}

export function GrantMotivation() {
  const quoteRef = useRef(getDailyQuote())
  const quote = quoteRef.current

  return (
    <div className="border-t border-border/40 py-8 text-center">
      <p className="text-sm italic text-muted-foreground/70">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="mt-1 text-xs text-muted-foreground/50">{quote.context}</p>
    </div>
  )
}
