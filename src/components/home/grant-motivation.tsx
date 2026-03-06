'use client'

import { useState } from 'react'

const QUOTES = [
  { text: 'Small teams, big impact. The right tools make the difference.', context: 'That\'s why we built GrantLink.' },
  { text: 'Behind every funded program is someone who decided to try.', context: 'That someone is you.' },
  { text: 'Funders want to say yes. Help them find a reason.', context: 'Tell your story with data.' },
  { text: 'The best proposals solve real problems with clear plans.', context: 'Show the path forward.' },
  { text: 'Your mission deserves the resources to grow.', context: 'Keep searching. Keep measuring. Keep going.' },
  { text: 'Every great nonprofit started with a first grant.', context: 'Start somewhere.' },
  { text: 'Impact is not a buzzword. It\'s what you do every day.', context: 'Now you can prove it.' },
  { text: 'You don\'t need a big team to run a professional operation.', context: 'You just need the right back office.' },
]

function getDailyQuote() {
  const dayIndex = Math.floor(Date.now() / 86400000) % QUOTES.length
  return QUOTES[dayIndex]
}

export function GrantMotivation() {
  const [quote] = useState(() => getDailyQuote())

  return (
    <div className="border-t border-border/20 py-12 text-center">
      <p className="font-serif text-base italic text-muted-foreground/60">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="mt-2 text-xs tracking-wide text-muted-foreground/40">{quote.context}</p>
    </div>
  )
}
