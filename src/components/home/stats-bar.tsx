import { FileText, Building2, Globe, TrendingUp } from 'lucide-react'

interface StatsBarProps {
  opportunityCount: number
  funderCount: number
  focusAreaCount: number
}

export function StatsBar({ opportunityCount, funderCount, focusAreaCount }: StatsBarProps) {
  const stats = [
    { icon: FileText, value: opportunityCount, label: 'Opportunities' },
    { icon: Building2, value: funderCount, label: 'Funders' },
    { icon: Globe, value: focusAreaCount, label: 'Focus Areas' },
    { icon: TrendingUp, value: '$500M+', label: 'Total Funding' },
  ]

  return (
    <section className="border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
