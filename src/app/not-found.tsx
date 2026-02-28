'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, ArrowLeft } from 'lucide-react'

const TIPS = [
  'Grant tip: Always read the full RFP before applying.',
  'Grant tip: Follow up after submitting. Silence isn\u2019t rejection.',
  'Grant tip: Budgets should tell a story, not just list numbers.',
  'Grant tip: Start your LOI with impact, not history.',
  'While you\u2019re here: Have you checked your deadlines this week?',
  'Grant tip: Tailor every application. Funders can tell when you don\u2019t.',
]

export default function NotFound() {
  const tipRef = useRef(TIPS[Math.floor(Math.random() * TIPS.length)])

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      {/* Animated 404 */}
      <div className="mb-8 animate-[float_3s_ease-in-out_infinite]">
        <span className="text-8xl font-bold tracking-tighter text-muted-foreground/20 md:text-9xl">
          4<Search className="inline h-16 w-16 text-primary/40 md:h-20 md:w-20" />4
        </span>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-foreground">This grant got away.</h1>
      <p className="mb-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for is as elusive as unrestricted funding.
      </p>

      <p className="mb-8 max-w-sm text-xs italic text-muted-foreground/60">
        {tipRef.current}
      </p>

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            Browse Opportunities
          </Link>
        </Button>
      </div>
    </div>
  )
}
