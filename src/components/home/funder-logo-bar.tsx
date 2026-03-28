import Link from 'next/link'

interface FunderLogoBarProps {
  funders: { name: string; slug: string }[]
}

export function FunderLogoBar({ funders }: FunderLogoBarProps) {
  if (funders.length < 3) return null

  return (
    <section className="border-y border-border/30 py-14">
      <div className="container mx-auto px-4">
        <p className="mb-6 text-center text-xs font-medium tracking-widest uppercase text-muted-foreground/50">
          Featuring opportunities from leading funders
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {funders.map((funder) => (
            <Link
              key={funder.slug}
              href={`/funder/${funder.slug}`}
              className="text-sm font-medium text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              {funder.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
