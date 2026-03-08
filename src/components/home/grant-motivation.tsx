'use client'

import { useState } from 'react'

const QUOTES = [
  { text: 'Small teams, big impact. The right tools make the difference.', context: 'That\'s why we built GrantLink.' },
  { text: 'Behind every funded program is someone who decided to try.', context: 'That someone is you.' },
  { text: 'Funders want to say yes. Help them find a reason.', context: 'Tell your story with data.' },
  { text: 'The best proposals solve real problems with clear plans.', context: 'Show the path forward.' },
  { text: 'Your mission deserves the resources to grow — no matter your team size.', context: 'Keep searching. Keep measuring. Keep going.' },
  { text: 'Every great nonprofit started with a first grant.', context: 'Start somewhere.' },
  { text: 'Impact is not a buzzword. It\'s what you do every day.', context: 'Now you can prove it.' },
  { text: 'You don\'t need a big team to run a professional operation.', context: 'GrantLink gives small nonprofits the tools to operate like large ones.' },
]

function getDailyQuote() {
  const dayIndex = Math.floor(Date.now() / 86400000) % QUOTES.length
  return QUOTES[dayIndex]
}

export function GrantMotivation() {
  const [quote] = useState(() => getDailyQuote())

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-3xl font-normal leading-snug tracking-tight text-muted-foreground/40 md:text-4xl">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="mt-6 text-sm font-medium text-foreground">{quote.context}</p>
          <p className="text-xs tracking-wide text-muted-foreground/50">Daily motivation from GrantLink</p>
        </div>
      </div>
    </section>
  )
}
