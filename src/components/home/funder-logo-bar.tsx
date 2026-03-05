import Link from 'next/link'
import { Building2 } from 'lucide-react'

interface FunderLogoBarProps {
  funders: { name: string; slug: string }[]
}

export function FunderLogoBar({ funders }: FunderLogoBarProps) {
  if (funders.length < 3) return null

  return (
    <section className="border-y border-border/20 py-14">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <Building2 className="mx-auto mb-3 h-5 w-5 text-primary/50" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
            Featuring opportunities from leading funders
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {funders.map((funder) => (
            <Link
              key={funder.slug}
              href={`/funder/${funder.slug}`}
              className="text-sm font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {funder.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
