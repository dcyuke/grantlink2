import Link from 'next/link'
import { Building2 } from 'lucide-react'

interface FunderLogoBarProps {
  funders: { name: string; slug: string }[]
}

export function FunderLogoBar({ funders }: FunderLogoBarProps) {
  if (funders.length < 3) return null

  return (
    <section className="border-y border-border/40 bg-muted/10 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
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
