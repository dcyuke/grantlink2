'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Building2, CalendarClock, TrendingUp } from 'lucide-react'

interface StatsBarProps {
  opportunityCount: number
  funderCount: number
  totalFunding: string
  deadlinesThisMonth: number
}

function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

export function StatsBar({ opportunityCount, funderCount, totalFunding, deadlinesThisMonth }: StatsBarProps) {
  const oppCounter = useAnimatedCounter(opportunityCount)
  const funderCounter = useAnimatedCounter(funderCount)
  const deadlineCounter = useAnimatedCounter(deadlinesThisMonth)

  const stats = [
    { icon: FileText, value: oppCounter.count.toLocaleString(), label: 'Opportunities', ref: oppCounter.ref },
    { icon: Building2, value: funderCounter.count.toLocaleString(), label: 'Funders', ref: funderCounter.ref },
    { icon: CalendarClock, value: deadlineCounter.count.toLocaleString(), label: 'Deadlines This Month', ref: deadlineCounter.ref },
    { icon: TrendingUp, value: totalFunding, label: 'Available Funding', ref: null },
  ]

  return (
    <section className="border-y border-border/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center" ref={stat.ref}>
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary/70" />
              <p className="font-serif text-2xl font-bold text-foreground tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs tracking-wide text-muted-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
