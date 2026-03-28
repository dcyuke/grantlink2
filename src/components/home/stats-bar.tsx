'use client'

import { useEffect, useRef, useState } from 'react'

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
    { value: oppCounter.count.toLocaleString(), label: 'Opportunities', ref: oppCounter.ref },
    { value: funderCounter.count.toLocaleString(), label: 'Funders', ref: funderCounter.ref },
    { value: deadlineCounter.count.toLocaleString(), label: 'Deadlines This Month', ref: deadlineCounter.ref },
    { value: totalFunding, label: 'Available Funding', ref: null },
  ]

  return (
    <section className="border-y border-border/50">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center" ref={stat.ref}>
              <p className="font-serif text-3xl font-extrabold text-foreground tabular-nums md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium tracking-wide uppercase text-muted-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
